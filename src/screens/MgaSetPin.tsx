import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  navigate,
  useAppNavigation,
  useAppRoute,
  popIfTop,
} from '../Controller';
import { ConditionalPrompt } from '../utils/controlFlow';
import { getCurrentVehicle } from '../features/auth/sessionSlice';
import { promptManagerFactory } from '../utils/controlFlow';
import { store } from '../store';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import { profileApi } from '../api/profile.api';
import { isPinOrFingerprintSetSync } from 'react-native-device-info';
import i18n from '../i18n';
import { CsfFormValues } from '../components/CsfForm/CsfForm';
import {
  vehicleHasDeprecatedKeychainPin,
  vehicleHasNoKeychainPin,
} from '../api/account.api';
import {
  selectVehicleAccountAttribute,
  updateVehicleAccountAttribute,
  VehicleAttributePayloads,
} from '../api/userAttributes.api';
import { gen2Plus, has } from '../features/menu/rules';
import { isFourDigitNumericPIN } from '../utils/PIN';
import { NormalResult } from '../../@types';
import { MgaFormItemProps } from '../components';
import promptAlert from '../components/CsfAlert';
import CsfText from '../components/CsfText';
import MgaForm from '../components/MgaForm';
import MgaPage from '../components/MgaPage';
import MgaPageContent from '../components/MgaPageContent';

const vehicleHasWirelessCarPin = (): boolean => {
  const wirelessCarPinAttribute = selectVehicleAccountAttribute(
    'mga.account.wirelessCarPin',
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  let wirelessCarPinExists: VehicleAttributePayloads['mga.account.wirelessCarPin'];
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    wirelessCarPinExists = wirelessCarPinAttribute
      ? wirelessCarPinAttribute
      : undefined;
  } catch (error) {
    console.error('Failed to parse wirelessCarPinAttributes ', error);
  }
  return !!wirelessCarPinExists;
};

const promptManager = promptManagerFactory('SetPin', navigate);

const setPinInitialValues: CsfFormValues = {
  pin: '',
  pinConfirmation: '',
  rememberPin: false,
};

type PinScreenMode = 'new' | 'returning'
export interface SetPinScreenProps {
  id?: number
  pageTitle?: string
  formTitle?: string
  formSubTitle?: string
  mode?: PinScreenMode
  handleSubmit?: (data: any) => void | Promise<void>
}

export const MgaSetPin: React.FC<SetPinScreenProps> = props => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const currentVehicle = useCurrentVehicle();
  const navigation = useAppNavigation();
  const oemCustId = currentVehicle?.userOemCustId;
  const route = useAppRoute<'SetPin'>();
  const pageTitleRoute = route.params ? route.params.pageTitle : props.pageTitle;
  const formTitleRoute = route.params ? route.params.formTitle : props.formTitle;
  const formSubTitleRoute = route.params ? route.params.formSubTitle : undefined;
  const mode = route.params ? route.params.mode : props.mode;

  const fieldsToRender: MgaFormItemProps[] = [
    {
      name: 'pinTitle',
      label: t('changePin:enterPin'),
      type: 'password',
      componentProps: {
        keyboardType: 'numeric',
        maxLength: 4,
      },
      rules: {
        required: {
          message: t('validation:required'),
        },
        length: {
          value: 4,
          message: t('validation:length', { count: 4 }),
        },
        validate: {
          validator: isFourDigitNumericPIN,
          message: t('changePin:invalidPin'),
        },
      },
    },
    {
      name: 'pinConfirmation',
      label: t('changePin:confirmPin'),
      type: 'password',
      componentProps: {
        keyboardType: 'numeric',
        maxLength: 4,
      },
      rules: {
        required: {
          message: t('validation:required'),
        },
        equalsField: {
          value: 'pinTitle',
          message: t(
            'changePin:remoteServicePinPanelFormValidateMessages.remoteServicePinConfirmation.equalTo',
          ),
        },
        validate: {
          validator: isFourDigitNumericPIN,
          message: t('changePin:invalidPin'),
        },
      },
    },
    {
      name: 'rememberPin',
      label: t('changePin:rememberPin'),
      type: 'checkbox',
      componentProps: {
        editable: true,
      },
    },
    {
      name: 'rememberPinContent',
      component: () => <CsfText>{t('changePin:rememberPinContent')}</CsfText>,
    },
  ];

  return (
    <MgaPage title={pageTitleRoute} focusedEdit disableHardwareBack>
      <MgaPageContent>
        <MgaForm
          title={formTitleRoute}
          subtitle={formSubTitleRoute}
          initialValues={setPinInitialValues}
          trackingId="CreatePIN"
          submitLabel={t('common:submit')}
          cancelLabel={mode == 'new' ? t('common:cancel') : t('common:notNow')}
          fields={fieldsToRender
            .filter(field => {
              if (field.name.includes('remember')) {
                return isPinOrFingerprintSetSync();
              }
              return true;
            })
            .map(field => {
              if (
                field.name.match('pinTitle') &&
                pageTitleRoute === t('forgotPin:title')
              ) {
                return { ...field, label: t('changePin:newPin') };
              }
              return field;
            })}
          isLoading={isLoading}
          onCancel={() => {
            // cancel button behavior based on 'mode'prop. new = cancel/error, returning = skip/success
            if (route?.params?.id) {
              // Screen is mounted via a prompt manager
              promptManager.send(route.params.id, {
                success: mode == 'returning',
                data: null,
                dataName: null,
                errorCode: mode == 'new' ? 'cancelled' : null,
              });
            } else {
              // Screen is mounted via a direct navigation stack push
              popIfTop(navigation, ['SetPin', 'ResetPin']);
            }
          }}
          onSubmit={
            props.handleSubmit
              ? (data: any) => props.handleSubmit!(data)
              : async (values: CsfFormValues) => {
                const pin = values.pinTitle as string;
                const { rememberPin } = values;
                setIsLoading(true);
                // Save the PIN remotely on `profileApi`
                const request =
                  profileApi.endpoints.setRemoteServicePin.initiate({
                    remoteServicePin: pin,
                  });
                const response = await store.dispatch(request).unwrap();
                if (!response.success) {
                  await promptAlert(
                    t('common:failed'),
                    t('changePin:unableSet'),
                  );
                }
                /**
                 * If user checks `Remember PIN` Save the PIN locally in keychain.
                 * If not, save an empty string to the keychain to indicate that the user DID select a PIN but chose NOT to save it to the keychain.
                 **/

                store.dispatch({
                  type: 'keychain/storePin',
                  payload: {
                    oemCustId: oemCustId,
                    pin: rememberPin ? pin : '',
                  },
                });

                promptManager.send(route.params.id, {
                  success: true,
                  data: null,
                  dataName: null,
                  errorCode: null,
                });
                void updateVehicleAccountAttribute(
                  'mga.account.wirelessCarPin',
                  true,
                );
                navigation.pop();
                setIsLoading(false);
              }
          }
        />
      </MgaPageContent>
    </MgaPage>
  );
};

export const setPinPromptSwitchVehicle: ConditionalPrompt = {
  displayName: 'setPinSwitchVehicle',
  predicate: () => {
    const vehicle = getCurrentVehicle();
    if (
      has([gen2Plus, 'res:*'], vehicle) &&
      /**
       *  New Vehicle User: Vehicle does NOT have a Wireless Car PIN.
       **/
      !vehicleHasWirelessCarPin()
    ) {
      return true;
    }
    return false;
  },
  userInputFlow: async () => {
    const { t } = i18n;
    const pageTitle = t('changePin:createPin');
    const formTitle = t('changePin:createPinContent');

    const prompt = await promptManager.show({
      pageTitle,
      formTitle,
      mode: 'new',
    });
    return prompt;
  },
};

export const setPinPromptNewUser: ConditionalPrompt = {
  displayName: 'setPinNewUser',
  predicate: () => {
    const vehicle = getCurrentVehicle();
    if (
      has([gen2Plus, 'res:*'], vehicle) &&
      /**
       *  New Vehicle User: Vehicle does NOT have a Wireless Car PIN.
       **/
      !vehicleHasWirelessCarPin()
    ) {
      return true;
    }
    return false;
  },
  userInputFlow: async () => {
    const { t } = i18n;
    const pageTitle = t('changePin:createPin');
    const formTitle = t('changePin:createPinContent');

    const vehicle = getCurrentVehicle();
    if (vehicle?.remoteServicePinExist) {
      try {
        await updateVehicleAccountAttribute('mga.account.wirelessCarPin', true);
        const res: NormalResult<boolean> = {
          success: true,
          data: null,
          dataName: null,
          errorCode: null,
        };

        const resolver: Promise<NormalResult<boolean>> = new Promise(
          resolve => {
            resolve(res);
          },
        );

        return resolver;
      } catch (error) {
        console.error('Failed to update vehicle account attribute', error);
      }
    }

    return await promptManager.show({
      pageTitle,
      formTitle,
      mode: 'new',
    });
  },
};

export const setPinPromptReturningUser: ConditionalPrompt = {
  displayName: 'setPinReturningUser',
  predicate: () => {
    const vehicle = getCurrentVehicle();
    if (
      has([gen2Plus, 'res:*'], vehicle) &&
      /**
       *  Returning Vehicle User: Vehicle has no saved PIN or an old encrypted PIN in Keychain
       **/
      (vehicleHasDeprecatedKeychainPin() || vehicleHasNoKeychainPin())
    ) {
      return true;
    }
    return false;
  },
  userInputFlow: async () => {
    const { t } = i18n;
    const pageTitle = t('changePin:verifyPin');
    const formTitle = t('changePin:verifyPinContent');
    const formSubTitle = t('changePin:verifyPinSubTitle');
    return await promptManager.show({
      pageTitle,
      formTitle,
      formSubTitle,
      mode: 'returning',
    });
  },
};
