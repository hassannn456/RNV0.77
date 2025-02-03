import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation, useAppRoute } from '../Controller';
import {
  CustomerProfileResponse,
  EditEmailParameters,
  useUpdateEmailMutation,
} from '../features/profile/contact/contactApi';
import { UpdateEmailParams } from './MgaEditEmailAddress';
import { testID } from '../components/utils/testID';
import { cNetworkError } from '../api';
import { MgaFormItemProps, CsfAlertAction } from '../components';
import promptAlert from '../components/CsfAlert';
import CsfView from '../components/CsfView';
import { alertBadConnection } from '../components/MgaBadConnectionCard';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';
import { useMgaModalEffect } from '../components/useMgaModalEffect';

interface PasswordParameters {
  password: string
}

const MgaSaveEmail: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'SaveEmail'>();
  const data: UpdateEmailParams = route.params?.data;
  const [request, status] = useUpdateEmailMutation();
  useMgaModalEffect(navigation);
  const loading = status.isLoading;

  const fieldsToRender: MgaFormItemProps[] = [
    {
      name: 'password',
      label: t('common:enterPassword'),
      type: 'password',
      rules: {
        required: {
          message: t('validation:required'),
        },
      },
    },
  ];

  const id = testID('saveEmail');

  return (
    <MgaPage title={t('myProfile:saveEmail')}>
      <CsfView edgeInsets style={{ flex: 1 }} gap={16} testID={id('container')}>
        <MgaForm
          initialValues={{ password: '' }}
          trackingId={'password'}
          testID={id('password')}
          fields={fieldsToRender}
          isLoading={loading}
          onCancel={() => navigation.pop()}
          onSubmit={async (formData: PasswordParameters) => {
            const payload: EditEmailParameters = {
              ...data,
              password: formData?.password,
              updateAction: 'EMAIL_UPDATE',
            };
            if (!formData?.password) {
              return true;
            }
            await request(payload).then(async response => {

              const responseData: CustomerProfileResponse = response?.data;
              const actions: CsfAlertAction[] = [
                { title: t('common:continue'), type: 'primary' },
              ];

              if (responseData?.success) {
                await promptAlert(
                  t('common:success'),
                  t('myProfile:contactInformationUpdated'),
                  actions,
                  { type: 'success' },
                );
                navigation.navigate('MyProfileView');
              } else if (responseData?.errorCode == cNetworkError) {
                alertBadConnection();
              } else {
                if (
                  responseData?.errorCode == 'INVALID_PASSWORD' ||
                  responseData?.errorCode == 'VALIDATION_ERROR'
                ) {
                  await promptAlert(
                    t('common:failed'),
                    t('myProfile:incorrectPassword'),
                    actions,
                    { type: 'error' },
                  );
                } else {
                  await promptAlert(
                    t('common:failed'),
                    t('myProfile:profileUpdateError'),
                    actions,
                    { type: 'error' },
                  );
                }
              }
            });
          }}
        />
      </CsfView>
    </MgaPage>
  );
};


export default MgaSaveEmail;
