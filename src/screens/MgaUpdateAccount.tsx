import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  navigate,
  popIfTop,
  useAppNavigation,
  useAppRoute,
} from '../Controller';
import { NormalResult, UpdateAccountRequest } from '../../@types';
import { store } from '../store';
import { profileApi } from '../api/profile.api';
import {
  getDeviceNameSync,
  isPinOrFingerprintSetSync,
} from 'react-native-device-info';
import { SessionData } from '../features/auth/sessionSlice';
import { checkPassword } from '../utils/password';
import { testID } from '../components/utils/testID';
import { BackHandler } from 'react-native';
import { featureFlagEnabled } from '../features/menu/rules';
import { MgaFormItemProps } from '../components';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';
import MgaPasswordRules from '../components/MgaPasswordRules';

const isSecuredDevice = isPinOrFingerprintSetSync();

let nid = 0;
let receivers: {
  id: number
  resolver: (value: NormalResult<SessionData>) => void
}[] = [];

const send = (id: number | undefined, value: NormalResult<SessionData>) => {
  const receiver = receivers.filter(r => r.id == id)[0];
  receiver?.resolver(value);
};

/** Show alert outside components and capture selected response. */
export const showUpdateAccount = async (): Promise<
  NormalResult<SessionData>
> => {
  nid = nid + 1;
  return new Promise(resolve => {
    navigate('UpdateAccount', {
      id: nid,
    });
    receivers.push({
      id: nid,
      resolver: value => {
        resolve(value);
        receivers = receivers.filter(r => r.id != nid);
      },
    });
  });
};

const MgaUpdateAccount: React.FC = () => {
  const navigation = useAppNavigation();
  const { t } = useTranslation();
  const route = useAppRoute<'UpdateAccount'>();
  const [isLoading, setLoading] = useState(false);
  const initialValues: UpdateAccountRequest = {
    oldPassword: '',
    password: '',
    passwordConfirmation: '',
    iAgreeCheckBox: false,
    deviceName: getDeviceNameSync().replace(
      /[^A-Za-z0-9@!#$^%*()+=\-\\;,./:?~`_\s]+/g,
      '',
    ),
  };
  const fields: MgaFormItemProps[] = [
    {
      name: 'oldPassword',
      type: 'password',
      label: t('updateAccount:currentPassword'),
      rules: {
        required: {
          message: t('validation:required'),
        },
      },
    },
    {
      name: 'password',
      type: 'password',
      label: t('updateAccount:newPassword'),
      rules: {
        required: {
          message: t('validation:required'),
        },
        notEqualsField: {
          value: 'oldPassword',
          message: t('validation:notEqualTo', {
            label: t('updateAccount:currentPassword'),
          }),
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
      type: 'password',
      label: t('updateAccount:confirmPassword'),
      rules: {
        required: {
          message: t('validation:required'),
        },
        equalsField: {
          message: t('validation:equalTo', { label: 'password' }),
          value: 'password',
        },
      },
    },
  ];
  // MGAS-5: T&C on Authorized User for SCI
  if (featureFlagEnabled('mga.authorizedUsers.disclaimer')) {
    fields.push({
      name: 'iAgreeCheckBox',
      type: 'checkbox',
      label: t('updateAccount:agreeToTerms'),
      rules: {
        required: {
          message: t('validation:required'),
        },
      },
    });
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', () => {
      setLoading(false);
    });
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        onCancel();
        return true;
      },
    );
    return () => {
      unsubscribe();
      backHandler.remove();
    };
  }, [navigation]);

  const onSubmit = async (data?: UpdateAccountRequest | undefined) => {
    if (!data) { return; }
    setLoading(true);
    const request = profileApi.endpoints.updateAccount.initiate(data);
    const response = await store.dispatch(request).unwrap();
    if (response.success) {
      // Update keychain
      const oldLogin = store.getState().keychain?.login;
      if (oldLogin) {
        const newLogin = {
          ...oldLogin,
          password: data.password,
          isSecuredDevice,
        };
        store.dispatch({ type: 'keychain/storeLogin', payload: newLogin });
      }
      const id = route.params.id;
      if (id) {
        send(id, response);
      } else {
        navigation.navigate('Dashboard');
      }
    } else if (
      response.errorCode == 'INVALID_PASSWORD' ||
      response.errorCode == 'UNABLE_TO_SAVE_TERMS_AND_CONDITIONS'
    ) {
      CsfSimpleAlert(t('common:error'), t('updateAccount:incorrectPassword'), {
        type: 'error',
      });
      setLoading(false);
    } else {
      CsfSimpleAlert(
        t('common:error'),
        t('updateAccount:unableToUpdateAccount'),
        { type: 'error' },
      );
    }
  };
  const onCancel = () => {
    const id = route.params.id;
    if (id) {
      send(id, {
        success: false,
        data: null,
        dataName: null,
        errorCode: 'cancelled',
      });
      popIfTop(navigation, 'UpdateAccount');
    }
  };

  const id = testID('UpdateAccount');
  return (
    <MgaPage title={t('updateAccount:title')} focusedEdit>
      <CsfView minHeight={'100%'}>
        <CsfView edgeInsets standardSpacing>
          <CsfText testID={id('updatePasswordInfo')}>
            {t('updateAccount:updatePasswordInfo')}
          </CsfText>
          <MgaForm
            fields={fields}
            initialValues={initialValues}
            isLoading={isLoading}
            disabled={isLoading}
            onSubmit={onSubmit}
            trackingId="updateAccountForm"
            onCancel={onCancel}
          />
          <MgaPasswordRules testID={id('passwordRules')} />
        </CsfView>
      </CsfView>
    </MgaPage>
  );
};

export default MgaUpdateAccount;
