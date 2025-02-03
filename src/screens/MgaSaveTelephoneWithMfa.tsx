/* eslint-disable react/jsx-no-undef */
/* eslint-disable react-native/no-inline-styles */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation, useAppRoute } from '../Controller';
import { UpdateTelephoneParams } from './MgaEditTelephone';
import {
  CustomerProfileResponse,
  SendVerificationParameters,
  useTelephoneTwoAuthSendVerificationMutation,
  useUpdateTelephoneMutation,
} from '../features/profile/contact/contactApi';
import { MSAError, cNetworkError } from '../api';
import {
  TwoStepVerifyTelephoneRequest,
  useLazyTwoStepAuthVerifyTelephoneQuery,
} from '../features/auth/loginApi';
import { testID } from '../components/utils/testID';
import { CsfPassword } from '../components/CsfPassword';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import { successNotice } from '../components/notice';

const MgaSaveTelephoneWithMfa: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'SaveTelephone'>();
  const [codeSent, setCodeSent] = useState(false);
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);
  const [hasVerificationCodeError, setHasVerificationCodeError] =
    useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sendCode, sendCodeStatus] =
    useTelephoneTwoAuthSendVerificationMutation();
  const [verifyCode, verifyCodeStatus] =
    useLazyTwoStepAuthVerifyTelephoneQuery();
  const [request, status] = useUpdateTelephoneMutation();
  const isLoading =
    sendCodeStatus?.isLoading || verifyCodeStatus?.isLoading || status.isLoading;

  const data: UpdateTelephoneParams = route.params?.data;
  const payload: SendVerificationParameters = {
    cellularPhone: route.params?.data.cellularPhone,
    homePhone: route.params?.data.homePhone,
    workPhone: route.params?.data.workPhone,
    password,
  };
  const sendVerification = async () => {
    if (!password) {
      setHasError(!password);
      return;
    }
    try {
      const response = await sendCode(payload).unwrap();
      if (response.success) {
        successNotice({
          title: t('common:success'),
          subtitle: t('twoStepAuthentication:verifyInputTitle'),
        });
        setCodeSent(true);
      } else {
        if (response.errorCode == 'VALIDATION_ERROR') {
          CsfSimpleAlert(t('common:failed'), t('myProfile:invalidPassword'), {
            type: 'error',
          });
        }
      }
    } catch {
      CsfSimpleAlert(
        t('twoStepAuthentication:havingTroubleTitle'),
        t('twoStepAuthentication:havingTroubleText'),
        { type: 'error' },
      );
    }
  };
  const submitVerification = async () => {
    if (!verificationCode) {
      setHasVerificationCodeError(!verificationCode);
      return;
    }
    const submitPayload: TwoStepVerifyTelephoneRequest = {
      cellularPhone: route.params?.data.cellularPhone,
      homePhone: route.params?.data.homePhone,
      workPhone: route.params?.data.workPhone,
      verificationCode,
    };
    const updateTelephoneData = {
      ...data,
      password,
      updateAction: 'CONTACT_NUMBERS_UPDATE',
    };
    try {
      await verifyCode({
        ...submitPayload,
      })
        .unwrap()
        .then(async val => {
          if (val.success) {
            await request(updateTelephoneData).then(response => {

              const successResponse: CustomerProfileResponse = response?.data;

              const errorResponse: CustomerProfileResponse = response?.error;

              if (successResponse?.success) {
                successNotice({
                  title: t('common:success'),
                  subtitle: t('myProfile:contactInformationUpdated'),
                });
                navigation.navigate('MyProfileView');
              } else {
                if (
                  errorResponse?.errorCode == 'INVALID_PASSWORD' ||
                  errorResponse?.errorCode == 'VALIDATION_ERROR'
                ) {
                  CsfSimpleAlert(
                    t('common:failed'),
                    t('myProfile:incorrectPassword'),
                    { type: 'error' },
                  );
                } else {
                  CsfSimpleAlert(
                    t('common:failed'),
                    t('myProfile:profileUpdateError'),
                    { type: 'error' },
                  );
                }
              }
            });
          } else {
            CsfSimpleAlert(
              t('common:failed'),
              t('myProfile:badVerificationCode'),
              { type: 'error' },
            );
          }
        });
    } catch (error) {
      const msaError = error as MSAError;
      if (msaError.errorCode == 'accountLocked') {
        CsfSimpleAlert(
          t('twoStepAuthentication:accountLockedTitle'),
          t('twoStepAuthentication:accountLocked'),
          { type: 'error' },
        );
      } else if (msaError.errorCode == cNetworkError) {
        CsfSimpleAlert(
          t('common:error'),
          t('twoStepAuthentication:errorValidatingVerificationCode'),
          { type: 'error' },
        );
      } else {
        CsfSimpleAlert(
          t('common:error'),
          t('twoStepAuthentication:badVerificationCode'),
          { type: 'error' },
        );
      }
    }
  };

  const goBack = () => {
    navigation.goBack();
  };

  const id = testID('SaveTelephoneWithMfa');

  return (
    <MgaPage title={t('myProfile:updateMobilePhone')} focusedEdit>
      <CsfView edgeInsets style={{ flex: 1 }} gap={12} testID={id()}>
        <>
          {!codeSent ? (
            <>
              <CsfPassword
                label={t('login:password')}
                onChangeText={value => {
                  setPassword(value || ''), setHasError(!value);
                }}
                editable={!isLoading}
                value={password}
                errors={hasError ? [t('validation:required')] : []}
                testID={id('password')}
              />
              <MgaButton
                trackingId="TelephoneSendVerificationCode"
                enabled={!isLoading && !hasError}
                isLoading={isLoading}
                title={t('myProfile:sendVerificationCode')}
                onPress={sendVerification}
              />
            </>
          ) : (
            <>
              <CsfView>
                <CsfText align="center" testID={id('pageDescription')}>
                  {t(
                    'forgotSomething:forgotPasswordVerificationPanel:pageDescriptionA',
                  )}{' '}
                  {t(
                    'forgotSomething:forgotPasswordVerificationPanel:pageDescriptionC',
                  )}
                </CsfText>
                <CsfText align="center" testID={id('codeWaitText')}>
                  {t('myProfile:codeWaitText')}
                </CsfText>
              </CsfView>
              <CsfView
                flexDirection="row"
                justify="space-between"
                align="center">
                <CsfText variant="bold" testID={id('enterCode')}>
                  {t('myProfile:enterCode')}
                </CsfText>
                <MgaButton
                  trackingId="SaveTelephoneResend"
                  variant="link"
                  onPress={sendVerification}
                  title={t('myProfile:Resend')}
                />
              </CsfView>
              <CsfInput
                label={t('twoStepAuthentication:verificationCodeLabel')}
                inputType="verificationCode"
                value={verificationCode}
                onChangeText={value => {
                  setVerificationCode(value),
                    setHasVerificationCodeError(!value);
                }}
                testID={id('verificationCode')}
                editable={!isLoading}
                errors={
                  hasVerificationCodeError ? [t('validation:required')] : []
                }
              />
              <MgaButton
                trackingId="SaveTelephoneSubmit"
                variant="secondary"
                title={t('common:submit')}
                onPress={submitVerification}
                isLoading={isLoading}
                enabled={!isLoading && !hasVerificationCodeError}
              />
            </>
          )}
          <MgaButton
            trackingId="SaveTelephoneCancel"
            variant="secondary"
            title={t('common:cancel')}
            onPress={goBack}
          />
        </>
      </CsfView>
    </MgaPage>
  );
};

export default MgaSaveTelephoneWithMfa;
