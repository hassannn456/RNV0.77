import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation, useAppRoute } from '../Controller';
import {
  useEmergencyContactsQuery,
  useValidatePasswordMutation,
} from '../features/profile/securitysettings/securitySettingsApi';
import { cNetworkError, MSASuccess } from '../api';
import { MgaFormItemProps } from '../components';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import CsfView from '../components/CsfView';
import { alertBadConnection } from '../components/MgaBadConnectionCard';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';

const MgaEnterPassword: React.FC = () => {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const route = useAppRoute<'EnterPassword'>();
  const action: string = route.params?.action;
  const vehicleAuthorizedAccountKey: number | undefined =
    route.params?.vehicleAuthorizedAccountKey;
  const emergencyContacts = useEmergencyContactsQuery();

  const [request, status] = useValidatePasswordMutation();
  const fieldsToRender: MgaFormItemProps[] = [
    {
      name: 'password',
      label: t('common:enterPassword'),
      type: 'password',
      rules: {
        required: {
          message: t('validation:required'),
        },
        minLength: {
          value: 9,
          message: t(t('validation:minLength', { count: 9 })),
        },
      },
    },
  ];
  return (
    <MgaPage title={t('common:enterPassword')} focusedEdit>
      <CsfView pv={24} ph={16}>
        <MgaForm
          initialValues={{ password: '' }}
          trackingId={'enterPassword'}
          fields={fieldsToRender}
          scrollEnabled={false}
          isLoading={status.isLoading}
          onCancel={() => navigation.pop()}
          onSubmit={async (data: { password: string }) => {
            try {
              const payload = {
                password: data.password,
              };
              const successResponse: MSASuccess =
                await request(payload).unwrap();
              if (successResponse?.success) {
                action === 'edit'
                  ? navigation.replace('AuthorizedUserEdit', {
                    action,
                    vehicleAuthorizedAccountKey,
                    relationData: emergencyContacts,
                  })
                  : navigation.replace('AuthorizedUserAdd', {
                    action,
                    relationData: emergencyContacts,
                  });
              } else if (successResponse.errorCode == cNetworkError) {
                alertBadConnection();
              } else {
                CsfSimpleAlert(
                  t('common:failed'),
                  t('authorizedUsers:incorrectPassword'),
                  { type: 'error' },
                );
              }
            } catch (error) {
              CsfSimpleAlert(
                t('common:failed'),
                t('authorizedUsers:incorrectPassword'),
                { type: 'error' },
              );
            }
          }}
        />
      </CsfView>
    </MgaPage>
  );
};

export default MgaEnterPassword;
