import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, store, useAppSelector } from '../store';
import { useAppNavigation } from '../Controller';
import { Linking, Platform } from 'react-native';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { useStoredPin } from '../features/keychain/keychain.slice';
import { isFourDigitNumericPIN } from '../utils/PIN';
import {
  biometricsSetupFailedAlert,
  enableBiometrics,
  promptBiometrics,
} from '../features/biometrics/biometrics';
import { testID } from '../components/utils/testID';
import { isPinOrFingerprintSetSync } from 'react-native-device-info';
import { isBiometricsSetupOnDevice } from '../features/biometrics/biometrics.slice';
import {
  setPreference,
  BiometricsLoginStatus,
} from '../features/preferences/preferences.slice';
import { gen2Plus, has } from '../features/menu/rules';
import CsfCard from '../components/CsfCard';
import promptAlert from '../components/CsfAlert';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfListItem from '../components/CsfListItem';
import CsfToggle from '../components/CsfToggle';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaAppSettings: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const currentVehicle = useCurrentVehicle();
  const oemCustId = currentVehicle?.userOemCustId;
  const dispatch = useAppDispatch();
  const storedPin = useStoredPin();
  const rememberPinToggle = isFourDigitNumericPIN(storedPin);
  const biometrics = useAppSelector(state => state.biometrics);
  const preferences = useAppSelector(state => state.preferences);
  const isSecuredDevice = isPinOrFingerprintSetSync();

  const openDeviceSettings = async (title: string, message: string) => {
    const settings = t('changePin:goToSettings');
    const notNow = t('common:notNow');
    const response = await promptAlert(title, message, [
      {
        title: settings,
        type: 'primary',
      },
      {
        title: notNow,
        type: 'secondary',
      },
    ]);
    if (response == settings) {
      if (Platform.OS === 'ios') {
        // cSpell:ignore Prefs
        await Linking.openURL('App-Prefs:root');
      } else if (Platform.OS === 'android') {
        await Linking.sendIntent('android.settings.SETTINGS');
      }
    }
  };

  const biometricsLoginPreference = (): boolean => {
    return (
      preferences?.biometricsLoginStatus == BiometricsLoginStatus.BioOptedIn
    );
  };

  const id = testID('AppSettings');
  return (
    <MgaPage showVehicleInfoBar title={t('biometrics:_settingsTitle')}>
      <MgaPageContent title={t('biometrics:_settingsTitle')}>
        {has([gen2Plus, 'res:*'], currentVehicle) && (
          <CsfCard title={t('remoteService:title')}>
            <CsfListItem
              title={t('changePin:rememberPin')}
              titleTextVariant="body"
              icon={
                <CsfAppIcon
                  size="lg"
                  color="copyPrimary"
                  icon="SuccessOutline"
                />
              }
              action={
                <CsfToggle
                  checked={rememberPinToggle}
                  onChangeValue={async _val => {
                    if (rememberPinToggle) {
                      const disable = t('common:disable');
                      const response = await promptAlert(
                        t('changePin:appSettings.disableRememberPinTitle'),
                        t('changePin:appSettings.disableRememberPinMessage'),
                        [
                          {
                            title: disable,
                            type: 'primary',
                          },
                          {
                            title: t('common:cancel'),
                            type: 'secondary',
                          },
                        ],
                      );
                      if (response == disable) {
                        // Turn off Remember PIN
                        store.dispatch({
                          type: 'keychain/storePin',
                          payload: {
                            oemCustId: oemCustId,
                            pin: '',
                          },
                        });
                      }
                    } else {
                      if (!isSecuredDevice) {
                        // Device is not secured
                        await openDeviceSettings(
                          t('changePin:deviceIsNotSecured'),
                          t('changePin:deviceIsNotSecuredPinContent'),
                        );
                      } else {
                        // Toggle on Remember PIN
                        navigation.navigate('SetPin', {
                          pageTitle: t(
                            'changePin:appSettings.rememberPinPageTitle',
                          ),
                          formTitle: t(
                            'changePin:appSettings.rememberPinFormTitle',
                          ),
                          mode: 'returning',
                        });
                      }
                    }
                  }}
                  testID={id('rememberPinToggle')}
                />
              }
              pv={0}
              ph={0}
            />
          </CsfCard>
        )}
        <CsfCard title={t('common:logInNoun')}>
          <CsfListItem
            pv={0}
            ph={0}
            title={t('login:enableBiometrics')}
            titleTextVariant="body"
            icon={
              <CsfAppIcon
                size="md"
                color="copyPrimary"
                icon={
                  biometrics?.biometryType == 'FaceID'
                    ? 'Faceid'
                    : 'AndroidFingerid'
                }
              />
            }
            action={
              <CsfToggle
                checked={biometricsLoginPreference()}
                onChangeValue={async value => {
                  if (value) {
                    if (!isSecuredDevice) {
                      // Device is not secured
                      await openDeviceSettings(
                        t('changePin:deviceIsNotSecured'),
                        t('changePin:deviceIsNotSecuredBiometricsContent'),
                      );
                    } else if (isBiometricsSetupOnDevice()) {
                      // Biometrics is not setup on App
                      const { success, error } = await promptBiometrics({
                        promptMessage: t('biometrics:forLogin'),
                      });
                      if (success) {
                        dispatch({
                          type: 'keychain/rememberMe',
                          payload: 'on',
                        });
                        setPreference(
                          'biometricsLoginStatus',
                          BiometricsLoginStatus.BioOptedIn,
                        );
                      } else if (error != undefined) {
                        await biometricsSetupFailedAlert();
                      }
                    } else {
                      //Toggle On Biometrics
                      void enableBiometrics();
                    }
                  } else {
                    const title = t('biometrics:disableBiometrics');
                    const message = t('biometrics:disableBiometricsDescription');
                    const yes = t('common:disable');
                    const no = t('common:cancel');
                    const response = await promptAlert(title, message, [
                      { title: yes, type: 'primary' },
                      { title: no, type: 'secondary' },
                    ]);
                    if (response == yes) {
                      setPreference(
                        'biometricsLoginStatus',
                        BiometricsLoginStatus.BioOptedOut,
                      );
                    }
                  }
                }}
                testID={id('enableBiometricsToggle')}
              />
            }
          />
        </CsfCard>
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaAppSettings;
