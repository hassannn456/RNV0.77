/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-void */
/* eslint-disable react/no-unstable-nested-components */

import React, { useEffect, useState } from 'react';
import { isPinOrFingerprintSetSync } from 'react-native-device-info';
import {
  CsfFormFieldFunctionPayload,
  CsfFormFieldList,
  MgaFormProps,
} from '../components';

import { useAppDispatch, useAppSelector } from '../store';
import { useTranslation } from 'react-i18next';
import { getDeviceNameSync, getUniqueIdSync } from 'react-native-device-info';
import revisionJson from '../../build/revision.json';
import { navigate, useAppNavigation, useAppRoute } from '../Controller';
import { Linking, Pressable } from 'react-native';
import { useStartupPropertiesQuery } from '../features/admin/admin.api';
// import ChatIcon from '../../content/svg/chat-icon.svg';
import { LoginParameters, cNoVehicle, login } from '../api/account.api';
import { cNoRemoteServicePinExist } from './MgaPINCheck';
import { testID } from '../components/utils/testID';
import { getPushToken } from '../features/notices/push';
import { cNetworkError } from '../api';
import useTracking, {
  getAnalyticsIdentity,
  trackError,
} from '../components/useTracking';
import {
  getCurrentEnvironmentConfig,
  getLanguages,
} from '../features/localization/environment';
import { featureFlagEnabled } from '../features/menu/rules';
import { isBiometricsSetupOnDevice } from '../features/biometrics/biometrics.slice';
import {
  BiometricsLoginStatus,
  getPreference,
  setPreference,
} from '../features/preferences/preferences.slice';
import {
  enableBiometrics,
  promptBiometrics,
} from '../features/biometrics/biometrics';
import { FieldValues, UseFormSetValue } from 'react-hook-form';
import { CsfFormValues } from '../components/CsfForm/CsfForm';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import CsfAppIcon from '../components/CsfAppIcon';
import MgaLanguageSelect from '../components/MgaLanguageSelect';
import MgaEnvironmentSelect from '../components/MgaEnvironmentSelect';
import promptAlert from '../components/CsfAlert';
import CsfView from '../components/CsfView';
// import MgaLogo from '../components/MgaLogo';
import MgaForm from '../components/MgaForm';
import CsfText from '../components/CsfText';
import CsfStatusBar from '../components/CsfAlertBar';
import MgaPage from '../components/MgaPage';
import MgaButton from '../components/MgaButton';
import MgaLogo from '../components/MgaLogo';
import MysubaruLogo from '../../content/svg/Logo';

const isSecuredDevice = isPinOrFingerprintSetSync();

interface LoginFormSubmitProps {
  loginUsername: string;
  password: string;
  passwordToken?: string;
  rememberUserCheck: 'on' | 'off';
}

/** Number of taps required to show environment select */
const hiddenTapCount = 7;

/** Initial login screen. Shows at app launch. */
const MgaLogin: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const route = useAppRoute<'Login'>();
  const navigation = useAppNavigation();
  const preferences = useAppSelector(state => state.preferences);
  const keychain = useAppSelector(state => state.keychain);
  const startupProperties = useStartupPropertiesQuery(undefined);
  const biometrics = useAppSelector(state => state.biometrics);
  const [initialState] = useState<LoginParameters>({
    env: '',
    loginUsername: '',
    password: '',
    rememberUserCheck: 'off',
    deviceId: getUniqueIdSync(),
    selectedVin: preferences?.selectedVin,
  });
  const [taps, setTaps] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricsSetupOngoing, setIsBiometricsSetupOngoing] =
    useState(false);
  const [isBiometricsAttemptsLimit, setBiometricsAttemptsLimit] =
    useState(false);
  const { trackButton } = useTracking();
  const environmentConfig = getCurrentEnvironmentConfig();
  const initialValues: CsfFormValues =
    keychain?.login?.rememberUserCheck === 'on'
      ? {
        loginUsername: keychain?.login?.loginUsername,
        rememberUserCheck: true,
      }
      : { loginUsername: '', password: '', rememberUserCheck: false };

  const loginUser = async (data: LoginFormSubmitProps) => {
    if (isLoading) {
      return;
    }
    const deviceToken = await getPushToken();
    const payload: LoginParameters = {
      ...initialState,
      env: environmentConfig?.id || '',
      loginUsername: data?.loginUsername?.trim(),
      password: data?.password,
      passwordToken: data?.passwordToken,
      pushToken: deviceToken,
      rememberUserCheck: data?.rememberUserCheck ? 'on' : 'off',
    };
    setIsLoading(true);
    console.log('payload', payload)
    const session = await login(payload);
    setIsLoading(false);
    if (session.success) {
      if (getBiometricsLoginStatus() == BiometricsLoginStatus.BioOptedIn) {
        payload.rememberUserCheck = 'on';
      }
      dispatch({
        type: 'keychain/storeLogin',
        payload: { ...payload, isSecuredDevice },
      });
      dispatch({ type: 'session/setLogin', payload: true });
    } else {
      // an error occurred. go back to login.
      navigate('Login', { noAutoLogin: true });

      let title: string = t('login:loginError');
      let message: string = t('login:loginErrorDefault');

      trackError('MgaLogin.tsx::loginUser')(session.errorCode);
      switch (session.errorCode) {
        // cases for client side errors
        case cNoVehicle:
          title = t('noVehicle:oops');
          message = t('noVehicle:noVehicle');
          break;
        case cNoRemoteServicePinExist:
          title = t('remoteServicePinPanel:pin');
          message = t('remoteServicePinPanel:setPin');
          break;
        case cNetworkError:
          title = t('message:notConnectedTitle');
          message = t('message:notConnected');
          break;
        case 'accountLocked':
          title = t('twoStepAuthentication:accountLockedTitle');
          message = t('login:accountLocked');
          break;
        case 'cancelled': // Suppress error on cancel
          title = '';
          message = '';
          break;
        // cases for messages returned from MobileAPI
        case 'invalidPassword':
        case 'passwordWarning':
        case 'noVehiclesOnAccount':
        case 'accountNotFound':
        case 'invalidAccount':
        case 'tooManyAttempts':
        case 'twoStepAuthTooManyAttempts':
          message = t(`login:${session.errorCode}`);
          break;
        case 'unableToAddDevice':
          title = t('login:unableToAddDevice');
          message = t('login:unableToAddDeviceDescription');
          break;
      }

      if (title || message) {
        CsfSimpleAlert(title, message, { type: 'error' });
      }
    }
  };

  const getBiometricsLoginStatus = (): BiometricsLoginStatus => {
    return getPreference('biometricsLoginStatus') as BiometricsLoginStatus;
  };

  const fieldsFunction: (
    _arg: CsfFormFieldFunctionPayload,
  ) => CsfFormFieldList = ({ setValue }) => {
    const fields = [
      {
        name: 'loginUsername',
        label: t('common:username'),
        type: 'email',
        disabled: !!initialValues?.passwordToken,
        rules: {
          email: {
            message: t('validation:email'),
          },
          required: {
            message: t('validation:required'),
          },
        },
        componentProps: {
          trailingAccessory: isSecuredDevice && (
            <CsfAppIcon
              color="button"
              icon={
                biometrics?.biometryType == 'FaceID'
                  ? 'Faceid'
                  : 'AndroidFingerid'
              }
              size="md"
            />
          ),
          trailingAccessoryOnPress: () => showBiometricsAlert(setValue),
        },
      },
      {
        name: initialValues?.passwordToken ? 'passwordToken' : 'password',
        label: t('login:password'),
        type: 'password',
        disabled: !!initialValues?.passwordToken,
        rules: {
          required: {
            message: t('validation:required'),
          },
        },
      },
      {
        name: 'rememberUserCheck',
        label: t('login:rememberUsernamePassword'),
        type: 'checkbox',
        componentProps: {
          onChangeValue: async (checked: boolean) => {
            if (!checked) {
              // CVCON25-6244 — Only clear password, so we can extract Keychain values on app startup.
              const yes = t('common:disable');
              const no = t('common:cancel');
              const response = await promptAlert(
                t('login:disableRememberMe'),
                t('login:disableRememberMeDescription'),
                [
                  { title: yes, type: 'primary' },
                  { title: no, type: 'secondary' },
                ],
              );
              if (response == yes) {
                setIsBiometricsSetupOngoing(false);
                dispatch({ type: 'keychain/rememberMe', payload: 'off' });
                setPreference(
                  'biometricsLoginStatus',
                  BiometricsLoginStatus.BioOptedOut,
                );
              } else {
                setValue('rememberUserCheck', 'on');
              }
            }
          },
        },
      },
    ];

    if (getLanguages().length > 1) {
      fields.unshift({
        name: 'language',
        component: (props: MgaFormProps) => <MgaLanguageSelect {...props} />,
      });
    }
    if (taps >= hiddenTapCount) {
      fields.unshift({
        name: 'env',
        label: t('login:profile'),
        componentProps: {
          value: environmentConfig?.id,
        },
        component: (props: MgaFormProps) => <MgaEnvironmentSelect {...props} />,
      });
    }

    return fields as CsfFormFieldList;
  };

  const showEnableBiometricsPrompt = async (): Promise<boolean> => {
    const title = t('login:enableBiometrics');
    const message = t('login:enableBiometricsDescription');
    const yes = t('common:continue');
    const no = t('common:notNow');
    const response = await promptAlert(title, message, [
      { title: yes, type: 'primary' },
      { title: no, type: 'secondary' },
    ]);
    return response == yes ? true : false;
  };

  const biometricsUnsuccessfulAlert = async (message: string) => {
    const title = t('login:biometricsError');
    const yes = t('common:ok');
    await promptAlert(title, message, [{ title: yes, type: 'primary' }]);
  };

  const showBiometricsAlert = async (
    setValue: UseFormSetValue<FieldValues>,
  ) => {
    if (!biometrics?.available && !isBiometricsAttemptsLimit) {
      void enableBiometrics();
      return;
    }
    if (isBiometricsAttemptsLimit) {
      await biometricsUnsuccessfulAlert(
        getBiometricsLoginStatus() == BiometricsLoginStatus.BioOptedIn
          ? t('login:biometricsLoginUnsuccessful')
          : t('login:biometricsSetupUnsuccessful'),
      );
      return;
    }
    if (getBiometricsLoginStatus() == BiometricsLoginStatus.BioOptedIn) {
      if (
        keychain?.login == undefined ||
        keychain?.login?.rememberUserCheck === 'off' ||
        isBiometricsSetupOngoing
      ) {
        const response = await showEnableBiometricsPrompt();
        if (response) {
          setValue('rememberUserCheck', 'on');
        }
      } else {
        await loginWithBiometrics();
      }
    } else {
      const response = await showEnableBiometricsPrompt();
      if (response && !isBiometricsSetupOngoing) {
        setIsBiometricsSetupOngoing(true);
        await loginWithBiometrics(false);
        setValue('rememberUserCheck', 'on');
      }
    }
  };

  const canLoginWithBiometrics = (): boolean => {
    return (
      isBiometricsSetupOnDevice() &&
      getBiometricsLoginStatus() == BiometricsLoginStatus.BioOptedIn
    );
  };

  const loginWithBiometrics = async (doLogin = true) => {
    const { success, error } = await promptBiometrics({
      promptMessage: t('biometrics:forLogin'),
    });
    if (success) {
      if (doLogin) {
        loginUser({
          loginUsername: keychain?.login?.loginUsername,
          password: keychain?.login?.password,
          rememberUserCheck: 'on',
        })
          .then()
          .catch(trackError('MgaLogin.tsx'));
      } else {
        setPreference(
          'biometricsLoginStatus',
          BiometricsLoginStatus.BioOptedIn,
        );
      }
    } else if (error != undefined) {
      setBiometricsAttemptsLimit(true);
      await biometricsUnsuccessfulAlert(
        doLogin
          ? t('login:biometricsLoginUnsuccessful')
          : t('login:biometricsSetupUnsuccessful'),
      );
    }
  };

  useEffect(() => {
    void getAnalyticsIdentity(); // if we keep the aep SDK, we can remove this.
    if (
      keychain?.login?.rememberUserCheck === 'on' && // remember user is checked
      keychain.sessionId && // session id is present in keychain (user has previously logged in)
      !route?.params?.noAutoLogin && // not coming from logout
      isSecuredDevice // device is secured
    ) {
      if (canLoginWithBiometrics()) {
        void loginWithBiometrics();
      }
    }

    if (!isSecuredDevice) {
      dispatch({ type: 'keychain/clearLogin' });
    }
  }, []);

  const id = testID('Login');

  return (
    <MgaPage bg="background" headerShown={false} testID={id()}>
      <CsfView p={16}>
        <CsfView>
          <CsfView justify="center" flex={1} minHeight={120}>
            <MysubaruLogo />
          </CsfView>
          <CsfView gap={16}>
            <MgaForm
              testID={id('Form')}
              initialValues={initialValues}
              trackingId={'loginForm'}
              isLoading={isLoading}
              submitLabel={'login:logIn'}
              fields={fieldsFunction}
              onSubmit={(data: LoginFormSubmitProps) => loginUser(data)}
              onCancel={() => navigation.navigate('ForgotSomething')}
              cancelLabel={t('login:forgotSomething')}
            />

            <CsfView align="center">
              <MgaButton
                style={{ width: 160 }}
                trackingId="demoMode"
                title={t('login:demoMode')}
                variant="secondary"
                onPress={async () => {
                  if (isLoading) {
                    return;
                  }
                  dispatch({ type: 'demo/begin' });
                  setIsLoading(true);
                  await login(initialState);
                  setIsLoading(false);
                  dispatch({ type: 'session/setLogin', payload: true });
                }}
              />
            </CsfView>
          </CsfView>

          {environmentConfig && (
            <CsfView
              gap={16}
              p={16}
              minHeight={72}
              flex={1}
              justify="flex-end"
              pb={20}>
              <Pressable
                onPress={() => setTaps(taps + 1)}
                accessibilityRole={'none'}
                accessibilityLabel={`v${revisionJson.version}`}
                testID={id('VersionPressable')}>
                <CsfText
                  align="center"
                  color="copySecondary"
                  testID={id('Version')}>
                  {environmentConfig.type != 'prod'
                    ? `v${revisionJson.version}-${revisionJson.ref} (${environmentConfig.id})`
                    : `v${revisionJson.version}`}
                </CsfText>
              </Pressable>
            </CsfView>
          )}
          {startupProperties?.data?.data?.chatEnabled &&
            featureFlagEnabled('mga.chat') && (
              <CsfStatusBar
                testID={id('LiveChat')}
                // icon={<ChatIcon />}
                title={t('login:needAssistance')}
                onPress={() => {
                  void Linking.openURL(t('login:chatUrl'));
                  trackButton({
                    trackingId: 'LoginChatButton',
                    title: t('login:needAssistance'),
                  });
                }}
              />
            )}
        </CsfView>
      </CsfView>
    </MgaPage>
  );
};

/**
 * Get device name to send to CWP when registering device.
 *
 * Simple wrapper around react-native-device-info::getDeviceNameSync.
 * May be expanded in future.
 */
export const getFriendlyDeviceName = (): string => {
  const name = getDeviceNameSync();
  return name;
};

export default MgaLogin;
