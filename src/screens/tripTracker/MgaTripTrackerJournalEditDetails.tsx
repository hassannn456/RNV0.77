/* eslint-disable eol-last */
/* eslint-disable no-void */
import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import { CsfOption } from '../../components/CsfRadioGroup';
import { Journal } from '../../../@types';
import { popIfTop, useAppNavigation, useAppRoute } from '../../Controller';
import { validate } from '../../utils/validate';
import {
  drivingJournalApi,
  useRetrieveAllJournalsQuery,
} from '../../api/drivingJournal.api';
import { store } from '../../store';
import { CsfGroupValue } from '../../components/CsfCheckbox';
import { testID } from '../../components/utils/testID';
import CsfCard from '../../components/CsfCard';
import { CsfSegmentedButton } from '../../components/CsfSegmentedButton';
import CsfTextInput from '../../components/CsfTextInput';
import CsfView from '../../components/CsfView';
import MgaButton from '../../components/MgaButton';
import MgaPage from '../../components/MgaPage';
import MgaPageContent from '../../components/MgaPageContent';
import { successNotice } from '../../components/notice';

/**
 * Create or update a driving journal.
 * On create, data is passed to second screen to pick trip logs.
 **/
const MgaTripTrackerJournalEditDetails: React.FC = () => {
  const { t } = useTranslation();
  const existing = useAppRoute<'TripTrackerJournalEditDetails'>().params;
  const navigation = useAppNavigation();
  const { data } = useRetrieveAllJournalsQuery(undefined);
  const [state, setState] = useState<Partial<Journal>>({
    journalCategory: 'PERSONAL',
    ...existing,
  });
  const [showErrors, setShowErrors] = useState(false);
  const categories: CsfOption[] = [
    {
      label: t('tripLogAddJournal:journalCategoryPersonalLabel'),
      value: 'PERSONAL',
      icon: 'Home',
    },
    {
      label: t('tripLogAddJournal:journalCategoryBusinessLabel'),
      value: 'BUSINESS',
      icon: 'Business',
    },
  ];
  const journalNames =
    data && data.data && typeof data.data != 'string'
      ? data.data
        .map(journal => journal.journalName)
        .filter(name => name != existing?.journalName)
      : [];
  const errors = validate(
    state,
    {
      journalName: {
        required: true,
        alphanumericNoQuotes: true,
        nameAlreadyExists: journalNames,
      },
      journalDescription: 'required',
      journalCategory: 'required',
    },
    (key, error) => {
      return t(
        `tripLogAddJournal:addJournalEntryValidateMessages.${key}.${error as string
        }`,
        {
          defaultValue: t(`validation:${error as string}`),
        },
      );
    },
  );
  const onSubmit = async () => {
    setShowErrors(true);
    if (Object.keys(errors).length > 0) return;
    if (state.journalId) {
      const request = drivingJournalApi.endpoints.updateJournal.initiate(state);
      const response = await store.dispatch(request).unwrap();
      if (response.success) {
        const refreshRequest =
          drivingJournalApi.endpoints.retrieveAllJournals.initiate(undefined);
        void store.dispatch(refreshRequest);
        successNotice({ title: t('tripLogAddJournal:hasUpdated', state) });
        popIfTop(navigation, 'TripTrackerJournalEditDetails');
      }
    } else {
      navigation.replace('TripTrackerJournalEditTripLogs', state);
    }
  };

  const id = testID('TripTrackerJournalEditDetails');
  return (
    <MgaPage
      focusedEdit
      title={
        state.journalId
          ? t('tripLogAddJournal:editJournalTitle')
          : t('tripLogAddJournal:createNewJournalTitle')
      }>
      <MgaPageContent gap={16}>
        <CsfCard gap={12}>
          <CsfTextInput
            errors={showErrors && errors.journalName}
            label={t('tripLogAddJournal:journalNameLabel')}
            maxLength={30}
            outsideLabel
            value={state.journalName}
            onChangeText={text => setState({ ...state, journalName: text })}
            testID={id('journalNameLabel')}
          />
          <CsfTextInput
            errors={showErrors && errors.journalDescription}
            label={t('tripLogAddJournal:journalDescriptionLabel')}
            maxLength={500}
            multiline={true}
            outsideLabel
            value={state.journalDescription}
            onChangeText={text =>
              setState({ ...state, journalDescription: text })
            }
            testID={id('journalDescriptionLabel')}
          />
          <CsfSegmentedButton
            options={categories}
            value={state.journalCategory}
            onChange={(newValue: CsfGroupValue) =>
              setState({
                ...state,
                journalCategory: newValue as string,
              })
            }
            testID={id('journalCategory')}
          />
        </CsfCard>
        <CsfView gap={12}>
          <MgaButton
            title={t(
              state.journalId
                ? 'tripLogAddJournal:saveDrivingJournal'
                : 'tripLogAddJournal:selectYourTrips',
            )}
            onPress={onSubmit}
            trackingId="TripTrackerJournalEditSave"
          />
          <MgaButton
            trackingId="TripTrackerJournalEditCancel"
            title={t('common:cancel')}
            variant="link"
            onPress={() => navigation.pop()}
          />
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaTripTrackerJournalEditDetails;