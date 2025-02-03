/* eslint-disable eqeqeq */
/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation } from '../Controller';
import { checkPassword } from '../utils/password';
import { useAppDispatch, useAppSelector } from '../store';
import { useUpdatePasswordMutation } from '../api/profile.api';
import { ChangePasswordRequest } from '../../@types';
import { cNetworkError } from '../api';
import { testID } from '../components/utils/testID';
import { isPinOrFingerprintSetSync } from 'react-native-device-info';
import { MgaFormItemProps } from '../components';
import promptAlert from '../components/CsfAlert';
import CsfView from '../components/CsfView';
import { alertBadConnection } from '../components/MgaBadConnectionCard';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';
import MgaPasswordRules from '../components/MgaPasswordRules';
import { successNotice } from '../components/notice';

const isSecuredDevice = isPinOrFingerprintSetSync();

const MgaChangePassword: React.FC = () => {
  const navigation = useAppNavigation();
  const dispatch = useAppDispatch();
  const keychain = useAppSelector(state => state.keychain);
  const { t } = useTranslation();
  const [request, status] = useUpdatePasswordMutation();
  const isLoading = status.isLoading;
  const id = testID('ChangePassword');

  const fieldsToRender: MgaFormItemProps[] = [
    {
      name: 'oldPassword',
      label: t('common:currentPassword'),

      type: 'password',
      rules: {
        required: {
          message: t('validation:required'),
        },
        minLength: {
          value: 8,
          message: t('validation:minLength', { count: 8 }),
        },
      },
    },
    {
      name: 'password',
      label: t('changePassword:newPassword'),

      type: 'password',
      rules: {
        required: {
          message: t('validation:required'),
        },
        minLength: {
          value: 8,
          message: t('validation:minLength', { count: 8 }),
        },
        notEqualsField: {
          value: 'oldPassword',
          message: t('validation:notEqualTo', {
            label: t('common:currentPassword'),
          }),
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
    {
      name: 'rules',
      type: 'text',
      component: () => (
        <CsfView>
          <MgaPasswordRules testID={id()} />
        </CsfView>
      ),
    },
  ];

  return (
    <MgaPage title={t('changePassword:title')} focusedEdit>
      <MgaPageContent>
        <MgaForm
          initialValues={{
            oldPassword: '',
            password: '',
            passwordConfirmation: '',
          }}
          cancelLabel={t('common:cancel')}
          trackingId={'updatePassword'}
          submitLabel={t('common:submit')}
          onCancel={() => navigation.goBack()}
          fields={fieldsToRender}
          isLoading={isLoading}
          onSubmit={async (data: ChangePasswordRequest) => {
            const response = await request(data).unwrap();
            if (response.success) {
              const payload = {
                ...keychain?.login,
                password: data?.password,
                isSecuredDevice,
              };
              dispatch({ type: 'keychain/storeLogin', payload });
              successNotice({
                title: t('common:success'),
                subtitle: t('changePassword:passwordChanged'),
              });
              navigation.replace('MyProfileView');
            } else if (response.errorCode == cNetworkError) {
              alertBadConnection();
            } else {
              await promptAlert(
                t('common:failed'),
                t('changePassword:incorrectOldPassword'),
                [{ title: t('common:continue'), type: 'primary' }],
                { type: 'error' },
              );
            }
          }}
        />
      </MgaPageContent>
    </MgaPage>
  );
};

export default MgaChangePassword;
