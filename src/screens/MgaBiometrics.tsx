/* eslint-disable eqeqeq */
/* eslint-disable no-void */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  biometricsSetupFailedAlert,
  enableBiometrics,
  promptBiometrics,
} from '../features/biometrics/biometrics';
import { useAppSelector } from '../store';
import { ConditionalPrompt } from '../utils/controlFlow';
import { navigate, useAppRoute } from '../Controller';
import { isBiometricsSetupOnDevice } from '../features/biometrics/biometrics.slice';
import { promptManagerFactory } from '../utils/controlFlow';
import { isPinOrFingerprintSetSync } from 'react-native-device-info';
import {
  getPreference,
  setPreference,
  BiometricsLoginStatus,
} from '../features/preferences/preferences.slice';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfToggle from '../components/CsfToggle';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const promptManager = promptManagerFactory('Biometrics', navigate);
const MAX_SKIP_COUNT = 2;

export const MgaBiometrics: React.FC = () => {
  const { t } = useTranslation();
  const biometrics = useAppSelector(state => state.biometrics);
  const [isEnabled, setIsEnabled] = useState(false);
  const route = useAppRoute<'Biometrics'>();

  const toggleBiometrics = async () => {
    const { success, error } = await promptBiometrics({
      promptMessage: t('biometrics:forLogin'),
    });
    if (isBiometricsSetupOnDevice()) {
      if (success) {
        setIsEnabled(!isEnabled);
      } else if (error != undefined) {
        await biometricsSetupFailedAlert();
        skipBiometricsSetup();
      }
    } else {
      void enableBiometrics();
    }
  };

  const promptManagerSend = () => {
    promptManager.send(route.params.id, {
      data: null,
      dataName: null,
      errorCode: null,
      success: true,
    });
  };

  const skipBiometricsSetup = () => {
    const currentPromptCount = getPreference('biometricsPromptCount');
    const parsedPromptCount =
      currentPromptCount == undefined ? 0 : Number(currentPromptCount);
    const updatedPromptCount = parsedPromptCount + 1;
    setPreference('biometricsPromptCount', String(updatedPromptCount));
    setPreference('biometricsPromptDate', new Date().toISOString());
    setPreference('biometricsLoginStatus', BiometricsLoginStatus.None);
    promptManagerSend();
  };

  return (
    <MgaPage noScroll focusedEdit disableHardwareBack>
      <CsfView flex={1} justify="space-between">
        <MgaPageContent title={t('biometrics:doYouWantToEnableBiometric')} />
        <CsfView align="center">
          <CsfAppIcon
            icon={
              biometrics?.biometryType == 'FaceID'
                ? 'Faceid'
                : 'AndroidFingerid'
            }
            size="xxl"
          />
        </CsfView>
        <CsfView gap={16} p={16}>
          <CsfToggle
            editable={true}
            checked={isEnabled}
            label={t('biometrics:enableBiometricsForLogin')}
            onChangeValue={async () => {
              await toggleBiometrics();
            }}
          />
          <MgaButton
            trackingId="BiometricsSaveButton"
            onPress={() => {
              setPreference('biometricsPromptDate', new Date().toISOString());
              setPreference(
                'biometricsLoginStatus',
                isEnabled
                  ? BiometricsLoginStatus.BioOptedIn
                  : BiometricsLoginStatus.BioOptedOut,
              );
              promptManagerSend();
            }}
            title={t('common:save')}
          />

          <MgaButton
            trackingId="BiometricsSkipButton"
            onPress={skipBiometricsSetup}
            title={t('biometrics:skipForNow')}
            variant="secondary"
          />
        </CsfView>
      </CsfView>
    </MgaPage>
  );
};

export const biometricsPrompt: ConditionalPrompt = {
  displayName: 'Biometrics',
  predicate: () => {
    const biometricsLoginStatus =
      getPreference('biometricsLoginStatus') ?? BiometricsLoginStatus.None;
    const storedPromptCount = getPreference('biometricsPromptCount');
    const parsedPromptCount =
      storedPromptCount == undefined ? 0 : Number(storedPromptCount);
    return (
      isPinOrFingerprintSetSync() &&
      biometricsLoginStatus == BiometricsLoginStatus.None &&
      parsedPromptCount < MAX_SKIP_COUNT
    );
  },
  userInputFlow: async () => {
    return await promptManager.show();
  },
};
