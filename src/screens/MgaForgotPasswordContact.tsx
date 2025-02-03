/* eslint-disable @typescript-eslint/no-shadow */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation, useAppRoute } from '../Controller';
import {
  ForgotPasswordSendVerificationRequest,
  useForgotPasswordSendVerificationMutation,
} from '../features/forgot/forgotApi';
import { MgaFormItemProps } from '../components';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import MgaButton from '../components/MgaButton';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const MgaForgotPasswordContact: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'ForgotPasswordContact'>();
  const [request, status] = useForgotPasswordSendVerificationMutation();
  const isLoading = status.isLoading;
  const options = [];
  const languageCode: string = t('language:languageCode');
  const email: string = t('common:email');
  const text: string = t('common:text');

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

  const fieldsToRender: MgaFormItemProps[] = [
    {
      name: 'contactMethod',
      label: t('forgotSomething:forgotPasswordContactsPanel.contactMethod'),
      options: options,
      value: 'email',
      type: 'radio',
      rules: {
        required: {
          message: t('validation:required'),
        },
      },
    },
  ];
  const defaultContactMethod = options[0]?.value || undefined;
  return (
    <MgaPage
      title={t('forgotSomething:forgotPasswordPanel.forgotPassword')}
      focusedEdit>
      <MgaPageContent
        description={t(
          'forgotSomething:forgotPasswordContactsPanel.pageDescription',
        )}>
        <MgaForm
          trackingId={'forgotPasswordContact'}
          fields={fieldsToRender}
          initialValues={{
            contactMethod: defaultContactMethod,
            languageCode: languageCode,
            verificationCode: '',
          }}
          isLoading={isLoading}
          cancelLabel={t('common:cancel')}
          onCancel={() => navigation.goBack()}
          onSubmit={async (data: ForgotPasswordSendVerificationRequest) => {
            const languageCode: string = t('language:languageCode');
            const payload = {
              ...data,
              languageCode: languageCode,
            };
            const response = await request(payload).unwrap();
            if (response.success) {
              navigation.push('ForgotPasswordVerification', {
                contactMethod: data.contactMethod,
              });
            } else {
              CsfSimpleAlert(
                t('forgotSomething:forgotPasswordPanel.forgotPassword'),
                t('forgotSomething:forgotPasswordFailPanel.pageDescription'),
                { type: 'error' },
              );
            }
          }}
        />

        <MgaButton
          variant="link"
          title={t('twoStepAuthentication:termsToggle')}
          disabled={isLoading}
          trackingId="forgotPasswordTermsToggle"
          onPress={() =>
            CsfSimpleAlert(
              t('twoStepAuthentication:termsToggle'),
              t('twoStepAuthentication:termsConditions'),
            )
          }
        />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaForgotPasswordContact;
