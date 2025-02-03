// cSpell:ignore dont
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MSAError } from '../api';
import { navigate, useAppRoute } from '../Controller';

import {
  loginApi,
  TwoStepAuthSendVerificationRequest,
  TwoStepAuthVerifyRequest,
  useLazyTwoStepAuthSendVerificationQuery,
  useLazyTwoStepAuthVerifyQuery,
} from '../features/auth/loginApi';
import { store } from '../store';
import { promptManagerFactory } from '../utils/controlFlow';
import { selectVehicle } from '../api/account.api';
import { registeredDeviceReducer } from '../features/auth/sessionSlice';
import { ConditionalPrompt } from '../utils/controlFlow';
import { testID } from '../components/utils/testID';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';
import { successNotice } from '../components/notice';

const promptManager = promptManagerFactory('TwoStepAuthentication', navigate);

/** Two step auth dialog.
 * 1. Asks for a phone or e-mail address.
 * 2. Waits for correct code to be input. */
const MgaTwoStepAuthentication: React.FC = () => {
  const { t } = useTranslation();
  const route = useAppRoute<'TwoStepAuthentication'>();
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [contactMethod, setContactMethod] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const languageCode: string = t('language:languageCode');
  const [sendCode, sendCodeStatus] = useLazyTwoStepAuthSendVerificationQuery();
  const [verifyCode, _verifyCodeStatus] = useLazyTwoStepAuthVerifyQuery();

  useEffect(() => { }, [isLoggedIn]);

  const sendVerification = async (
    data: TwoStepAuthSendVerificationRequest,
    resend?: boolean,
  ) => {
    try {
      const response = await sendCode(data).unwrap();
      if (response.success) {
        setCodeSent(true);
        if (resend) {
          successNotice({
            title: t('twoStepAuthentication:codeResent'),
            dismissable: true,
          });
        }
        setIsLoggedIn(true);
      } else {
        CsfSimpleAlert(
          t('twoStepAuthentication:havingTroubleTitle'),
          t('twoStepAuthentication:havingTroubleText'),
          { type: 'error' },
        );
        setIsLoggedIn(false);
      }
    } catch {
      CsfSimpleAlert(
        t('twoStepAuthentication:havingTroubleTitle'),
        t('twoStepAuthentication:havingTroubleText'),
        { type: 'error' },
      );
      setIsLoggedIn(false);
    }
  };

  type TwoStepRequest = TwoStepAuthSendVerificationRequest &
    TwoStepAuthVerifyRequest

  const handleError = (errorCode: string | null | undefined) => {
    promptManager.send(route.params.id, {
      success: false,
      errorCode: errorCode ?? null, // making TS stop complaining
      dataName: null,
      data: null,
    });
  };

  const submitVerification = async (data: TwoStepRequest) => {
    if (data.verificationCode) {
      setLoading(true);
      try {
        const response = await verifyCode(data).unwrap();
        if (!response.success || !response.data) {
          handleError(response.errorCode);
          return;
        }
        const vin = (response.data.vehicles ?? [])[
          response.data.currentVehicleIndex ?? 0
        ]?.vin;
        if (!vin) {
          CsfSimpleAlert(t('noVehicle:oops'), t('noVehicle:noVehicle'), {
            type: 'warning',
          });
          //TODO:UA:20241004 reject and go back to login if no vin?
          return;
        }
        // TODO:AG:20240214 - we should decouple select vehicle from 2fa
        const select = await selectVehicle({ vin });

        if (!select.success) {
          handleError(select.errorCode);
          return;
        }

        promptManager.send(route.params.id, {
          success: true,
          errorCode: null,
          dataName: null,
          data: null,
        });
      } catch (error) {
        const msaError = error as MSAError;

        handleError(msaError.errorCode);
      } finally {
        setLoading(false);
      }
    } else {
      // setIsShowError(true)
    }
  };
  // TODO:AG:20230727: These need to be re-written if we support languages with a different word order
  const email: string = t('common:email');
  const text: string = t('common:text');

  const options = [];

  if (route.params?.phone) {
    options.push({
      label: `${text}: ${route.params.phone}`,
      value: 'phone',
    });
  }

  if (route.params?.email) {
    options.push({
      label: `${email}: ${route.params.email}`,
      value: 'email',
    });
  }

  if (route.params.userName && route.params.userName !== route.params.email) {
    options.push({
      label: `${email}: ${route.params.userName}`,
      value: 'userName',
    });
  }

  const defaultContactMethod = options[0]?.value || undefined;
  const id = testID('TwoStepVerification');
  return (
    <MgaPage
      title={t('twoStepAuthentication:twoStepHeader')}
      focusedEdit
      disableHardwareBack>
      <CsfView edgeInsets standardSpacing testID={id()}>
        {!codeSent ? (
          <>
            <MgaForm
              // key is required because screen has two different forms
              trackingId={'contactMethodForm'}
              title={t('twoStepAuthentication:dontRecognize')}
              subtitle={t('twoStepAuthentication:pleaseVerify')}
              key="contact"
              isLoading={loading}
              fields={[
                {
                  name: 'contactMethod',
                  type: 'radio',
                  label: t('twoStepAuthentication:chooseContactMethod'),
                  options: options,
                  editable: true,
                  componentProps: {
                    onChange: (v: string) => setContactMethod(v),
                  },
                },
              ]}
              initialValues={{
                contactMethod: defaultContactMethod,
                languageCode: languageCode,
                verificationCode: '',
              }}
              onSubmit={async (data: TwoStepAuthSendVerificationRequest) => {
                setLoading(true);
                await sendVerification(data);
                if (data.contactMethod) {
                  setContactMethod(data.contactMethod);
                }
                setLoading(false);
              }}
              onCancel={() => {
                promptManager.send(route.params.id, {
                  success: false,
                  data: null,
                  dataName: null,
                  errorCode: 'cancelled',
                });
              }}
            />

            <CsfText testID={id('helpDisclaimer')}>
              {t('twoStepAuthentication:helpDisclaimer')}
            </CsfText>
            <MgaButton
              trackingId="ViewTermsOfServiceButton"
              variant="link"
              title={t('twoStepAuthentication:termsToggle')}
              disabled={loading}
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
            <MgaForm
              trackingId={'verificationCodeForm'}
              title={t('twoStepAuthentication:verifyInputTitle')}
              subtitle={t('twoStepAuthentication:verifyInputSubTitle')}
              // key is required because screen has two different forms
              key="code"
              fields={[
                {
                  name: 'verificationCode',
                  label: t('twoStepAuthentication:verificationCodeLabel'),
                  type: 'numeric',
                  componentProps: {
                    maxLength: 6,
                  },
                  rules: { required: { message: t('validation:required') } },
                },
                {
                  name: 'rememberDevice',
                  label: t('twoStepAuthentication:rememberDevice'),
                  type: 'checkbox',
                  componentProps: {
                    editable: true,
                  },
                },
              ]}
              initialValues={{
                verificationCode: '',
                rememberDevice: 0,
                deviceName: getFriendlyDeviceName(),
              }}
              onCancel={() => {
                promptManager.send(route.params.id, {
                  success: false,
                  data: null,
                  dataName: null,
                  errorCode: 'cancelled',
                });
              }}
              onSubmit={data => submitVerification(data as TwoStepRequest)}
              isLoading={loading}
            />

            <MgaButton
              variant="secondary"
              trackingId="ResendCodeButton"
              title={t('twoStepAuthentication:resend')}
              onPress={async () => {
                await sendVerification(
                  {
                    contactMethod,
                    languageCode,
                    deviceName: getFriendlyDeviceName(),
                  },
                  true,
                );
              }}
              isLoading={sendCodeStatus.isFetching}
            />
            <CsfText testID={id('didYouKnow')}>
              {t('twoStepAuthentication:didYouKnow')}
            </CsfText>
          </>
        )}
      </CsfView>
    </MgaPage>
  );
};

export const twoStepAuthPrompt: ConditionalPrompt = {
  displayName: '2FA',
  predicate: () => {
    const isDeviceRegistered = registeredDeviceReducer(store.getState());
    return !isDeviceRegistered;
  },
  userInputFlow: async () => {
    const contactsRequest =
      loginApi.endpoints.twoStepAuthContacts.initiate(undefined);
    const contacts = await store.dispatch(contactsRequest).unwrap();
    return await promptManager.show(contacts.data);
  },
};

export default MgaTwoStepAuthentication;
