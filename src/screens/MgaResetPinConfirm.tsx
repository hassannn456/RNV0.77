/* eslint-disable react/no-unstable-nested-components */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { cNetworkError, MSAError, MSASuccess } from '../api';
import { popIfTop, useAppNavigation, useAppRoute } from '../Controller';

import { hasErrors, validate } from '../utils/validate';
import {
  TwoStepAuthSendVerificationRequest,
  TwoStepAuthVerifyRequest,
  useLazyTwoStepAuthSendVerificationQuery,
} from '../features/auth/loginApi';
import { useForgotPinMutation } from '../features/profile/securitysettings/securitySettingsApi';
import { getCurrentVehicle } from '../features/auth/sessionSlice';
import { store, useAppDispatch } from '../store';
import { useEncryptPinMutation } from '../features/biometrics/biometrics.api';
import { testID } from '../components/utils/testID';
import { MgaFormItemProps } from '../components';
import promptAlert from '../components/CsfAlert';
import CsfRule from '../components/CsfRule';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaResetPinConfirm: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const dispatch = useAppDispatch();
  const route = useAppRoute<'ResetPin2FA'>();
  const nextScreen = route.params?.nextScreen;
  const [request, status] = useForgotPinMutation();
  const [state, setState] = useState<
    TwoStepAuthSendVerificationRequest & TwoStepAuthVerifyRequest
  >({
    contactMethod: '',
    deviceName: getFriendlyDeviceName(),
    languageCode: t('language:languageCode'),
    rememberDevice: 0,
    verificationCode: '',
  });
  const oemCustId = getCurrentVehicle()?.userOemCustId;
  const [encrypt, _status] = useEncryptPinMutation();
  const onBiometricsDisable = () => {
    if (oemCustId) {
      dispatch({ type: 'keychain/clearPin', payload: oemCustId });
    }
  };
  const onRememberPinEnable = (pin: string) => {
    store.dispatch({
      type: 'keychain/storePin',
      payload: {
        oemCustId: oemCustId,
        pin: pin,
      },
    });
  };

  const [codeSent, setCodeSent] = useState(false);
  const [sendCode, sendCodeStatus] = useLazyTwoStepAuthSendVerificationQuery();
  const isLoading = sendCodeStatus.isFetching || status.isLoading;
  const errors = validate(state, { contactMethod: 'required' });
  const id = testID('ResetPin2MFA');

  const sendVerification = async (data: { contactMethod: string }) => {
    let payload = { ...state };
    if (data.contactMethod) {
      payload = { ...state, contactMethod: data.contactMethod };
      setState(payload);
    }
    const hasErrors = validate(payload, { contactMethod: 'required' });
    if (hasErrors.contactMethod) {
      return;
    }
    const showAlert = () => {
      return CsfSimpleAlert(
        t('twoStepAuthentication:havingTroubleTitle'),
        t('twoStepAuthentication:havingTroubleText'),
        { type: 'error' },
      );
    };

    try {
      const response = await sendCode(payload).unwrap();
      if (response.success) {
        setCodeSent(true);
      } else {
        // Note: Required as success can be false.
        showAlert();
      }
    } catch {
      showAlert();
    }
  };
  const submitVerification = async (params: { verificationCode: string }) => {
    if (hasErrors(errors)) {
      return;
    }
    try {
      const data = {
        contactMethod: 'userName',
        verificationCode: params.verificationCode,
        pin: route.params.pin,
      };
      const successResponse: MSASuccess = await request(data).unwrap();
      if (successResponse?.success) {
        if (route.params.rememberPin && route.params.pin) {
          onRememberPinEnable(route.params.pin);
        } else if (route.params.biometrics && route.params.pin) {
          await encrypt({ pin: route.params.pin }).unwrap();
        } else {
          onBiometricsDisable();
        }
        if (nextScreen) {
          navigation.navigate(nextScreen, { success: true });
        } else {
          await promptAlert(
            t('common:success'),
            t('changePin:PinChanged'),
            [
              {
                title: t('common:continue'),
                type: 'primary',
              },
            ],
            {
              type: 'success',
            },
          );
          popIfTop(navigation, 'ResetPin2FA');
          popIfTop(navigation, 'ResetPin');
        }
      } else {
        throw successResponse;
      }
    } catch (error) {
      const msaError = error as MSAError;
      if (msaError.errorCode == 'accountLocked') {
        await promptAlert(
          t('twoStepAuthentication:accountLockedTitle'),
          `${t('twoStepAuthentication:lockedOutText')} \n ${t(
            'twoStepAuthentication:accountLocked2',
          )}`,
          [
            {
              title: t('common:close'),
              type: 'primary',
            },
          ],
          {
            type: 'error',
          },
        );
        dispatch({ type: 'keychain/clearSessionId' });
        dispatch({ type: 'session/setLogin', payload: false });
      } else if (msaError.errorCode == cNetworkError) {
        CsfSimpleAlert(
          t('common:error'),
          t('twoStepAuthentication:errorValidatingVerificationCode'),
          { type: 'error' },
        );
      } else if (msaError.errorCode == 'error') {
        CsfSimpleAlert(t('common:failed'), t('changePin:unableSet'), {
          type: 'error',
        });
      } else {
        CsfSimpleAlert(
          t('common:error'),
          t('twoStepAuthentication:badVerificationCode'),
          {
            type: 'error',
          },
        );
      }
    }
  };
  // TODO:AG:20230727: These need to be re-written if we support languages with a different word order
  const email: string = t('common:email');
  const text: string = t('common:text');

  const getRadioOptions = () => {
    const radioOptions = [];
    if (route.params.phone) {
      radioOptions.push({
        label: text + ': ' + route.params.phone,
        value: 'phone',
      });
    }
    if (route.params.email) {
      radioOptions.push({
        label: email + ': ' + route.params.email,
        value: 'email',
      });
    }
    if (route.params.userName) {
      radioOptions.push({
        label: email + ': ' + route.params.userName,
        value: 'userName',
      });
    }
    return radioOptions;
  };

  const radioOptions = getRadioOptions();

  const fieldsToRender: MgaFormItemProps[] = [
    {
      name: 'contactMethod',
      label: t('twoStepAuthentication:chooseContactMethod'),
      type: 'radio',
      options: radioOptions,
    },
  ];
  const fieldsToRenderVerification: MgaFormItemProps[] = [
    {
      name: 'resend',
      componentProps: {},
      component: () => (
        <CsfView
          flexDirection="row"
          justify="space-between"
          align="center"
          testID={id('resend')}>
          <CsfText testID={id('enterCode')}>
            {t('twoStepAuthentication:enterCode')}
          </CsfText>
          <MgaButton
            variant="link"
            trackingId="ResetPinResend"
            title={t('twoStepAuthentication:resend')}
            onPress={async () => {
              await sendVerification({
                contactMethod: state.contactMethod,
              });
            }}
          />
        </CsfView>
      ),
    },
    {
      name: 'rule',
      componentProps: {},
      component: () => <CsfRule orientation="horizontal" />,
    },
    {
      name: 'verificationCode',
      label: t('twoStepAuthentication:verificationCodeLabel'),
      type: 'text',
      componentProps: {
        autoComplete: 'sms-otp',
        inputType: 'verificationCode',
        onSubmitEditing: submitVerification,
      },
      rules: {
        required: {
          message: t('validation:required'),
        },
      },
    },
  ];

  return (
    <MgaPage title={t('forgotPin:title')}>
      <MgaPageContent>
        {!codeSent ? (
          <>
            <CsfText
              variant="heading"
              align="center"
              testID={id('pleaseVerify')}>
              {t('twoStepAuthentication:pleaseVerify')}
            </CsfText>
            <MgaForm
              initialValues={{
                contactMethod: radioOptions[0]?.value,
              }}
              trackingId={'ResetPin2MFA'}
              submitLabel={t('common:next')}
              fields={fieldsToRender}
              isLoading={isLoading}
              onSubmit={sendVerification}
              onCancel={() => navigation.pop()}
            />
            <MgaButton
              variant="link"
              title={t('twoStepAuthentication:termsToggle')}
              trackingId="ResetPinTermsToggle"
              disabled={isLoading}
              onPress={() =>
                CsfSimpleAlert(
                  t('twoStepAuthentication:termsToggle'),
                  t('twoStepAuthentication:termsConditions'),
                )
              }
            />
          </>
        ) : (
          <>
            <CsfText
              variant="heading"
              align="center"
              testID={id('verifyInputTitle')}>
              {t('twoStepAuthentication:verifyInputTitle')}
            </CsfText>
            <CsfText align="center" testID={id('verifyInputSubTitle')}>
              {t('twoStepAuthentication:verifyInputSubTitle')}
            </CsfText>
            <MgaForm
              initialValues={{
                verificationCode: '',
              }}
              trackingId={'ResetPinConfirmation'}
              submitLabel={t('common:submit')}
              fields={fieldsToRenderVerification}
              isLoading={isLoading}
              onSubmit={submitVerification}
              onCancel={() => navigation.pop()}
            />
          </>
        )}
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaResetPinConfirm;
