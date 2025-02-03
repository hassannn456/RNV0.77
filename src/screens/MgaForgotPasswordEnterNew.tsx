import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../Controller';
import {
  ForgotPasswordEnterNewRequest,
  useLazyForgotPasswordEnterNewQuery,
} from '../features/forgot/forgotApi';
import { checkPassword } from '../utils/password';
import { MgaFormItemProps } from '../components';
import promptAlert from '../components/CsfAlert';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
import MgaPasswordRules from '../components/MgaPasswordRules';

const MgaForgotPasswordEnterNew: React.FC = () => {
  const navigation = useAppNavigation();
  const [query, status] = useLazyForgotPasswordEnterNewQuery();

  const { t } = useTranslation();
  const isLoading = status.isLoading;

  const fieldsToRender: MgaFormItemProps[] = [
    {
      name: 'password',
      type: 'password',
      label: t('changePassword:newPassword'),
      rules: {
        required: {
          message: t('validation:required'),
        },
        minLength: {
          value: 8,
          message: t('validation:minLength', { count: 8 }),
        },
        validate: {
          message: t('validation:password'),
          validator: checkPassword,
        },
      },
    },
    {
      name: 'passwordConfirmation',
      label: t('changePassword:confirmNewPassword'),
      type: 'password',
      rules: {
        required: {
          message: t('validation:required'),
        },
        equalsField: {
          value: 'password',
          message: t('validation:equalTo', {
            label: t('changePassword:newPassword'),
          }),
        },
      },
    },
  ];
  return (
    <MgaPage
      title={t('forgotSomething:forgotPasswordPanel.forgotPassword')}
      focusedEdit>
      <MgaPageContent
        description={t(
          'forgotSomething:forgotPasswordEnterNewPanel.pageDescription',
        )}>
        <MgaForm
          initialValues={{ password: '', passwordConfirmation: '' }}
          trackingId={'enterNewPassword'}
          submitLabel={t('common:submit')}
          fields={fieldsToRender}
          isLoading={isLoading}
          onCancel={() => navigation.pop()}
          onSubmit={async (data: ForgotPasswordEnterNewRequest) => {
            const response = await query(data).unwrap();
            if (response.success) {
              navigation.popToTop();
              await promptAlert(
                t('forgotSomething:forgotPasswordPanel.forgotPassword'),
                t('forgotSomething:forgotPasswordSuccessPanel.pageDescription'),
                [
                  {
                    title: t(
                      'forgotSomething:forgotPasswordSuccessPanel.logIn',
                    ),
                    type: 'primary',
                  },
                ],
                {
                  type: 'success',
                },
              );
            } else {
              if (response.errorCode == 'NEW_PASSWORD_MATCHES_CURRENT') {
                CsfSimpleAlert(
                  t('forgotSomething:forgotPasswordPanel.forgotPassword'),
                  t('forgotSomething:NEW_PASSWORD_MATCHES_CURRENT'),
                  { type: 'error' },
                );
              } else {
                navigation.popToTop();
                CsfSimpleAlert(
                  t('forgotSomething:forgotPasswordPanel.forgotPassword'),
                  t('forgotSomething:forgotPasswordFailPanel.pageDescription'),
                  { type: 'error' },
                );
              }
            }
          }}
        />
        <MgaPasswordRules />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaForgotPasswordEnterNew;
