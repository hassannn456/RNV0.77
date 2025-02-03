/* eslint-disable no-void */
import React, { useState } from 'react';
import {
  selectVehicleAccountAttribute,
  updateVehicleAccountAttribute,
} from '../api/userAttributes.api';
import { useTranslation } from 'react-i18next';
import { navigate, useAppRoute } from '../Controller';
import { ConditionalPrompt } from '../utils/controlFlow';
import { isIsoDateString } from '../utils/dates';
import { promptManagerFactory } from '../utils/controlFlow';
import { testID } from '../components/utils/testID';
import CsfCard from '../components/CsfCard';
import { CsfCheckBox } from '../components/CsfCheckbox';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const promptManager = promptManagerFactory('TermsConditions', navigate);
export interface TermsConditionsScreenProps {
  id?: number
}

const MgaTermsConditions: React.FC = () => {
  const { t } = useTranslation();
  const route = useAppRoute<'TermsConditions'>();
  const [termsCheckboxSelected, setTermsCheckboxSelected] =
    useState<boolean>(false);
  const [conditionsCheckboxSelected, setConditionsCheckboxSelected] =
    useState<boolean>(false);
  const [privacyCheckboxSelected, setPrivacyCheckboxSelected] =
    useState<boolean>(false);
  const id = testID('TermsConditions');

  return (
    <MgaPage
      focusedEdit
      noScroll
      height={'100%'}
      title={t('legalDisclaimers:termsConditionsScreenTitle')}
      disableHardwareBack>
      <MgaPageContent>
        <CsfText variant="body">
          {t('legalDisclaimers:termsConditionsPreface')}
        </CsfText>
        <CsfView gap={16}>
          <CsfCard gap={8}>
            <CsfView>
              <CsfCheckBox
                checked={termsCheckboxSelected}
                testID={id('termsConditionsAgreeCheckbox')}
                label={t('legalDisclaimers:termsConditionsAgree')}
                onChangeValue={checked => {
                  setTermsCheckboxSelected(checked);
                }} />
              <CsfCheckBox
                checked={conditionsCheckboxSelected}
                testID={id('conditionsOfUseAgreeCheckbox')}
                label={t('legalDisclaimers:conditionsOfUseAgree')}
                onChangeValue={checked => {
                  setConditionsCheckboxSelected(checked);
                }} />
              <CsfCheckBox
                checked={privacyCheckboxSelected}
                testID={id('privacyPolicyAgreeCheckbox')}
                label={t('legalDisclaimers:privacyPolicyAgree')}
                onChangeValue={checked => {
                  setPrivacyCheckboxSelected(checked);
                }} />
            </CsfView>
          </CsfCard>

          <MgaButton
            disabled={
              !termsCheckboxSelected ||
              !conditionsCheckboxSelected ||
              !privacyCheckboxSelected
            }
            trackingId="TermsConditionContinue"
            variant="primary"
            title={t('common:continue')}
            onPress={() => {
              void updateVehicleAccountAttribute(
                'mga.account.tos.20240628',
                new Date().toISOString(),
              );
              promptManager.send(route.params.id, {
                success: true,
                errorCode: null,
                data: null,
                dataName: null,
              });
            }}
          />
          <MgaButton
            trackingId="TermsConditionCancelButton"
            onPress={_ => {
              promptManager.send(route.params.id, {
                success: false,
                data: null,
                dataName: null,
                errorCode: 'cancelled',
              });
            }}
            title={t('common:cancel')}
            variant="link"
          />
        </CsfView>
      </MgaPageContent>
    </MgaPage>
  );
};

export const termsConditionsPrompt: ConditionalPrompt = {
  displayName: 'termsConditions',
  predicate: () => {
    const tosAttribute = selectVehicleAccountAttribute(
      'mga.account.tos.20240628',
    );

    return !isIsoDateString(tosAttribute);
  },
  userInputFlow: async () => {
    return await promptManager.show();
  },
};

export default MgaTermsConditions;
