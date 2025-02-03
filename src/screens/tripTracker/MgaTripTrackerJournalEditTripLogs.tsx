/* eslint-disable eol-last */
/* eslint-disable no-void */
/* eslint-disable @typescript-eslint/no-unused-vars */
//cSpell:ignore Tripdata
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { popIfTop, useAppNavigation, useAppRoute } from '../../Controller';
import {
  drivingJournalApi,
  useRetrieveTripdataQuery,
} from '../../api/drivingJournal.api';
import { JournalEntry, NormalResult, TripDetail } from '../../../@types';
import { ScrollView } from 'react-native';
import { store } from '../../store';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCsfFocusedAppearance } from '../../components/CsfFocusedEdit';
import MgaSelectTrip, {
  getTripDistanceString,
  getTripTimeRange,
} from './MgaSelectTrip';
import { boxShadow } from '../../components/constants';
import { testID } from '../../components/utils/testID';
import CsfAccordionList from '../../components/CsfAccordionList';
import CsfAccordionSection from '../../components/CsfAccordionSection';
import CsfActivityIndicator from '../../components/CsfActivityIndicator';
import promptAlert from '../../components/CsfAlert';
import { CsfCheckBox } from '../../components/CsfCheckbox';
import CsfListItem from '../../components/CsfListItem';
import { CsfRuleList } from '../../components/CsfRuleList';
import CsfText from '../../components/CsfText';
import CsfView from '../../components/CsfView';
import MgaButton from '../../components/MgaButton';
import { errorNotice } from '../../components/notice';

const includesAll: <T>(coll: T[], subset: T[]) => boolean = (coll, subset) => {
  return subset.filter(item => coll.includes(item)).length == subset.length;
};

const includesAny: <T>(coll: T[], subset: T[]) => boolean = (coll, subset) => {
  return subset.filter(item => coll.includes(item)).length > 0;
};

/**
 * Update a driving journal's trip logs.
 * Create journal first if needed.
 **/
const MgaTripTrackerJournalEditTripLogs: React.FC = () => {
  const { t } = useTranslation();
  const journal = useAppRoute<'TripTrackerJournalEditTripLogs'>().params;
  const navigation = useAppNavigation();
  const [selectedTrip, setSelectedTrip] = useState('');
  const { data, isFetching } = useRetrieveTripdataQuery(
    selectedTrip ? JSON.parse(selectedTrip) : {},
  );
  const existingIds =
    journal?.journalEntries?.map(entry => entry.tripLogDataId) ?? [];
  const [selectedIds, setSelectedIds] = useState<number[]>(existingIds);
  useCsfFocusedAppearance({
    headerTitle: t('tripLogAddJournal:createNewJournalTitle'),
  });
  const resultMap = data?.data?.resultMap ?? {};
  const resultKeys = Object.keys(resultMap);
  const toggleSelectedId = (id: number) => {
    setSelectedIds(
      selectedIds.includes(id)
        ? selectedIds.filter(i => i != id)
        : selectedIds.concat([id]),
    );
  };
  const addSelectedIds = (ids: number[]) => {
    const newIds = ids.filter(i => !selectedIds.includes(i));
    setSelectedIds(selectedIds.concat(newIds));
  };
  const removeSelectedIds = (ids: number[]) => {
    setSelectedIds(selectedIds.filter(i => !ids.includes(i)));
  };
  const onSubmit = async () => {
    const isCreate = !journal.journalId;
    const saveJournalRequest = isCreate
      ? drivingJournalApi.endpoints.createJournal.initiate(journal)
      : drivingJournalApi.endpoints.updateJournal.initiate(journal);
    const saveJournalResponse = await store
      .dispatch(saveJournalRequest)
      .unwrap();
    if (!saveJournalResponse.success || !saveJournalResponse.data?.journalId) {
      onError(saveJournalResponse);
      return;
    }
    const journalId = saveJournalResponse.data.journalId;
    const addIds = selectedIds.filter(id => !existingIds.includes(id));
    if (addIds.length > 0) {
      const entries: Partial<JournalEntry>[] = addIds.map(id => ({
        tripLogDataId: id,
        journalId,
      }));
      const request =
        drivingJournalApi.endpoints.addJournalEntriesToJournal.initiate(entries);
      const response = await store.dispatch(request).unwrap();
      if (!response.success) {
        onError(response);
        return;
      }
    }
    // Deletes have to reference journalEntryId not tripLogDataId
    const deleteTripLogIds = existingIds.filter(id => !selectedIds.includes(id));
    if (deleteTripLogIds.length > 0) {
      const deleteEntries =
        journal?.journalEntries?.filter(entry =>
          deleteTripLogIds.includes(entry.tripLogDataId),
        ) ?? [];
      const deleteIds = deleteEntries.map(entry => entry.journalEntryId);
      const entries: Partial<JournalEntry>[] = deleteIds.map(id => ({
        journalEntryId: id,
        journalId,
      }));
      const request =
        drivingJournalApi.endpoints.deleteJournalEntriesFromJournal.initiate(
          entries,
        );
      const response = await store.dispatch(request).unwrap();
      if (!response.success) {
        onError(response);
        return;
      }
    }
    const refreshRequest =
      drivingJournalApi.endpoints.retrieveAllJournals.initiate(undefined);
    void store.dispatch(refreshRequest);
    const _ok = await promptAlert(
      t(
        isCreate ? 'tripLogAddJournal:createNewJournalTitle' : 'common:success',
      ),
      t(
        isCreate
          ? 'tripLogAddJournal:hasAdded'
          : 'tripLogAddJournal:hasUpdated',
        journal,
      ),
    );
    if (isCreate) {
      navigation.replace('TripTrackerJournalDetails', { journalId });
    } else {
      popIfTop(navigation, 'TripTrackerJournalEditTripLogs');
    }
  };
  const onError = (response: NormalResult<unknown>) => {
    errorNotice({ title: t('common:error'), subtitle: response.data as string });
  };

  const id = testID('TripTrackerJournalEditTripLogs');
  return (
    <CsfView flex={1}>
      <CsfView edgeInsets standardSpacing>
        <MgaSelectTrip
          value={selectedTrip}
          onSelect={setSelectedTrip}
          testID={id('selectTrip')}
        />
      </CsfView>
      <ScrollView>
        <CsfView>
          {isFetching ? (
            <CsfActivityIndicator />
          ) : (
            resultKeys.length > 0 && (
              <CsfView edgeInsets={['left', 'right']} standardSpacing>
                <CsfText align="center" testID={id('selectTripsDescription')}>
                  {t('tripLogAddJournal:selectTripsDescription')}
                </CsfText>
                <CsfAccordionList>
                  {resultKeys.map((key, index) => {
                    const details = resultMap[key] as TripDetail[];
                    const sectionIds = details.map(
                      detail => detail.tripLogDataId,
                    );
                    const sectionChecked = includesAll(selectedIds, sectionIds);
                    const sectionPartial = includesAny(selectedIds, sectionIds);
                    const itemTestId = testID(id(`selectedTrip-${index}`));
                    return (
                      <CsfAccordionSection
                        key={key}
                        title={`${key} (${details.length})`}
                        titleTextVariant="subheading"
                        testID={itemTestId('accordion')}
                        icon={
                          <CsfCheckBox
                            checked={sectionChecked || sectionPartial}
                            customIcon={
                              sectionPartial && !sectionChecked
                                ? 'Minus'
                                : undefined
                            }
                            onChangeValue={_checked => {
                              if (!sectionChecked) {
                                addSelectedIds(sectionIds);
                              } else {
                                removeSelectedIds(sectionIds);
                              }
                            }}
                            testID={itemTestId('itemSelection')}
                          />
                        }
                        renderBody={() => (
                          <CsfRuleList>
                            {details.map(detail => (
                              <CsfListItem
                                onPress={() =>
                                  toggleSelectedId(detail.tripLogDataId)
                                }
                                key={detail.tripLogDataId}
                                title={getTripTimeRange(detail)}
                                titleTextVariant="body2"
                                subtitle={getTripDistanceString(detail)}
                                testID={itemTestId('tripDetail')}
                                icon={
                                  <CsfCheckBox
                                    checked={selectedIds.includes(
                                      detail.tripLogDataId,
                                    )}
                                    onChangeValue={_checked =>
                                      toggleSelectedId(detail.tripLogDataId)
                                    }
                                    testID={itemTestId('tripLogSelection')}
                                  />
                                }
                              />
                            ))}
                          </CsfRuleList>
                        )}
                      />
                    );
                  })}
                </CsfAccordionList>
              </CsfView>
            )
          )}
        </CsfView>
      </ScrollView>
      <CsfView
        bg="backgroundSecondary"
        style={{ ...boxShadow(0, -2, '#000000', 0.1, 4, 2) }}>
        <SafeAreaView edges={['bottom']}>
          <CsfView edgeInsets standardSpacing>
            <CsfText align="center" testID={id('tripLogsSelected')}>
              {t('tripTrackerLanding:tripLogsSelected', {
                count: selectedIds.length,
              })}
            </CsfText>
            <MgaButton
              trackingId="TripLogsSaveDrivingJournal"
              disabled={selectedIds.length == 0}
              title={t('tripLogAddJournal:saveDrivingJournal')}
              onPress={onSubmit}
            />
          </CsfView>
        </SafeAreaView>
      </CsfView>
    </CsfView>
  );
};


export default MgaTripTrackerJournalEditTripLogs;