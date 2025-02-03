import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppNavigation, useAppRoute } from '../Controller';
import { useLazyTwoStepAuthContactsQuery } from '../features/auth/loginApi';
import { ContactMethodConfirm } from '../features/profile/securitysettings/securitySettingsApi';
import { useFocusEffect } from '@react-navigation/native';
import { ChangePinRequest } from '../../@types';
import { MgaSetPin } from './MgaSetPin';
import MgaPage from '../components/MgaPage';

const MgaResetPin: React.FC = () => {
  const navigation = useAppNavigation();
  const route = useAppRoute<'ResetPin'>();
  const nextScreen = route.params?.nextScreen;
  const { t } = useTranslation();
  const [startContact, _contactStatus] = useLazyTwoStepAuthContactsQuery();
  const [isLoading, setIsLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(false);
    }, []),
  );

  const navigateToConfirmPIN = async (
    data: ChangePinRequest & { rememberPin: boolean },
  ) => {
    if (isLoading) {
      return;
    }
    setIsLoading(true);
    const contacts = await startContact(undefined).unwrap();
    const stateData: ContactMethodConfirm = contacts.data;
    const payload = {
      ...stateData,
      pin: data.pinConfirmation,
      rememberPin: data.rememberPin,
    };
    if (!data.pinConfirmation) {
      return;
    }

    navigation.navigate('ResetPin2FA', { ...payload, nextScreen });
  };

  return (
    <MgaPage>
      <MgaSetPin
        pageTitle={t('forgotPin:title')}
        formTitle={t('forgotPin:forgotPinContent')}
        mode="returning"
        handleSubmit={navigateToConfirmPIN}
      />
    </MgaPage>
  );
};

export default MgaResetPin;
