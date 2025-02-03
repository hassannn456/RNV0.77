import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation, useAppRoute } from '../Controller';
import {
  ForgotPasswordVerifyRequest,
  useForgotPasswordSendVerificationMutation,
  useLazyForgotPasswordVerifyQuery,
} from '../features/forgot/forgotApi';
import { testID } from '../components/utils/testID';

const MgaForgotPasswordVerification: React.FC = () => {
  const navigation = useAppNavigation();
  const route = useAppRoute<'ForgotPasswordVerification'>();
  const contactMethod: string = route.params?.contactMethod;
  const [verify, status] = useLazyForgotPasswordVerifyQuery();
  const { t } = useTranslation();

  const [sendCode, sendCodeStatus] = useForgotPasswordSendVerificationMutation();
  const sendVerification = async () => {
    const languageCode: string = t('language:languageCode');
    const payload = {
      contactMethod,
      languageCode: languageCode,
    };
    try {
      await sendCode(payload).unwrap();
    } catch {
      CsfSimpleAlert(
        t('forgotSomething:havingTroubleTitle'),
        t('forgotSomething:havingTroubleText'),
        { type: 'error' },
      );
    }
  };
  const isLoading = status.isFetching || sendCodeStatus.isLoading;

  const fieldsToRender: MgaFormItemProps[] = [
    {
      name: 'verificationCode',
      type: 'numeric',
      label: t('forgotSomething:forgotPasswordVerificationPanel.accessCode'),
      componentProps: {
        autoComplete: 'sms-otp',
        maxLength: 6,
      },
      rules: {
        required: {
          message: t('validation:required'),
        },
      },
    },
  ];

  const id = testID('ForgotPasswordVerification');
  return (
    <MgaPage
      title={t('forgotSomething:forgotPasswordPanel.forgotPassword')}
      focusedEdit>
      <MgaPageContent>
        <CsfView ph={20} pt={20}>
          <CsfText testID={id('description')}>
            {t(
              'forgotSomething:forgotPasswordVerificationPanel.pageDescriptionA',
            )}{' '}
            {t(
              'forgotSomething:forgotPasswordVerificationPanel.pageDescriptionB',
            )}{' '}
            {t(
              'forgotSomething:forgotPasswordVerificationPanel.pageDescriptionC',
            )}
          </CsfText>
        </CsfView>
        <CsfView flexDirection="row" justify="space-between" align="center">
          <CsfText testID={id('enterCode')}>
            {t('twoStepAuthentication:enterCode')}
          </CsfText>
          <MgaButton
            variant="link"
            title={t('twoStepAuthentication:resend')}
            onPress={sendVerification}
            trackingId="forgotPasswordVerificationResend"
          />
        </CsfView>
        <MgaForm
          trackingId={'forgotPasswordVerification'}
          fields={fieldsToRender}
          isLoading={isLoading}
          cancelLabel={t('common:cancel')}
          onCancel={() => navigation.goBack()}
          onSubmit={async (data: ForgotPasswordVerifyRequest) => {
            const response = await verify(data).unwrap();
            if (response.success) {
              navigation.replace('ForgotPasswordEnterNew');
            } else {
              if (response.errorCode == 'accountLocked') {
                const ok: string = t('common:ok');
                await promptAlert(
                  t('common:error'),
                  t('forgotSomething:accountLocked'),
                  [{ title: ok, type: 'primary' }],
                  { type: 'error' },
                );
                navigation.popToTop();
              } else {
                CsfSimpleAlert(
                  t('common:error'),
                  t('forgotSomething:codeIncorrect'),
                  { type: 'error' },
                );
              }
            }
          }}
        />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaForgotPasswordVerification;
