/* eslint-disable no-void */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { popIfTop, useAppNavigation, useAppRoute } from '../Controller';
import { UpdateTelephoneParams } from './MgaEditTelephone';
import {
  CustomerProfileResponse,
  EditTelephoneParameters,
  useUpdateTelephoneMutation,
} from '../features/profile/contact/contactApi';
import { cNetworkError } from '../api';
import { testID } from '../components/utils/testID';
import promptAlert from '../components/CsfAlert';
import { CsfPassword } from '../components/CsfPassword';
import CsfView from '../components/CsfView';
import { alertBadConnection } from '../components/MgaBadConnectionCard';
import MgaButton from '../components/MgaButton';
import MgaPage from '../components/MgaPage';
import { successNotice } from '../components/notice';

const MgaSaveTelephone: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const route = useAppRoute<'SaveTelephone'>();
  const data: UpdateTelephoneParams = route.params?.data;
  const [request, status] = useUpdateTelephoneMutation();
  const [password, setPassword] = useState('');
  const [hasError, setHasError] = useState(false);
  const loading = status.isLoading;

  const onFinish = async () => {
    const payload: EditTelephoneParameters = {
      ...data,
      password,
      updateAction: 'CONTACT_NUMBERS_UPDATE',
    };
    if (!password) {
      setHasError(!password);
      return true;
    }
    await request(payload).then(response => {

      const responseData: CustomerProfileResponse = response?.data;
      if (responseData?.success) {
        popIfTop(navigation, 'SaveTelephone');
        popIfTop(navigation, 'EditTelephone');
        successNotice({ title: t('myProfile:contactInformationUpdated') });
      } else if (responseData?.errorCode == cNetworkError) {
        alertBadConnection();
      } else {
        if (
          responseData?.errorCode == 'INVALID_PASSWORD' ||
          responseData?.errorCode == 'VALIDATION_ERROR'
        ) {
          void promptAlert(t('common:failed'), t('myProfile:incorrectPassword'));
        } else {
          void promptAlert(
            t('common:failed'),
            t('myProfile:profileUpdateError'),
          );
        }
      }
    });
  };

  const id = testID('SaveTelephone');
  return (
    <MgaPage title={t('myProfile:savePhoneNumbers')} focusedEdit>
      <CsfView edgeInsets style={{ flex: 1 }} gap={10} testID={id()}>
        <CsfPassword
          label={t('login:password')}
          onChangeText={value => {
            setPassword(value || '');
          }}
          editable={!loading}
          value={password}
          errors={!password && hasError ? [t('validation:required')] : []}
          testID={id('password')}
        />
        <MgaButton
          title={t('common:submit')}
          isLoading={loading}
          onPress={onFinish}
          trackingId="TelephoneSubmit"
        />
      </CsfView>
    </MgaPage>
  );
};

export default MgaSaveTelephone;
