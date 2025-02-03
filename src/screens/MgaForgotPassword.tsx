import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../Controller';
import {
  ForgotPasswordParameters,
  useLazyForgotPasswordQuery,
} from '../features/forgot/forgotApi';
import { store } from '../store';
import { cNetworkError } from '../api';

const MgaForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const [query, status] = useLazyForgotPasswordQuery();
  const fieldsToRender: MgaFormItemProps[] = [
    {
      name: 'email',
      label: t('common:username'),
      type: 'email',
      rules: {
        required: {
          message: t('validation:required'),
        },
        email: {
          message: t('validation:email'),
        },
      },
    },
  ];
  return (
    <MgaPage
      title={t('forgotSomething:forgotPasswordPanel.forgotPassword')}
      focusedEdit>
      <MgaPageContent>
        <MgaForm
          initialValues={{ email: '' }}
          trackingId={'forgotPassword'}
          cancelLabel={t('common:cancel')}
          onCancel={() => navigation.goBack()}
          fields={fieldsToRender}
          isLoading={status.isFetching}
          onSubmit={async (data: ForgotPasswordParameters) => {
            try {
              const contact = await query(data).unwrap();
              if (contact.success) {
                store.dispatch({
                  type: 'session/replace',
                  payload: contact.data,
                });
                navigation.push('ForgotPasswordContact', contact.data);
              } else if (contact?.errorCode == cNetworkError) {
                alertBadConnection();
              } else {
                CsfSimpleAlert(
                  t('forgotSomething:forgotPasswordPanel.forgotPassword'),
                  t('forgotSomething:forgotPasswordFailPanel.pageDescription'),
                  { type: 'error' },
                );
              }
            } catch {
              CsfSimpleAlert(
                t('forgotSomething:forgotPasswordPanel.forgotPassword'),
                t('forgotSomething:forgotPasswordFailPanel.pageDescription'),
                { type: 'error' },
              );
            }
          }}
        />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaForgotPassword;
