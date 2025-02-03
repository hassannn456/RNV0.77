import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions } from 'react-native';
import { push, useAppNavigation, useAppRoute } from '../Controller';
import { useAppSelector } from '../store';
import { getStoredPin } from '../features/keychain/keychain.slice';
import CsfAlertBar, { CsfAlertBarProps } from '../components/CsfAlertBar';
import { getCurrentVehicle } from '../features/auth/sessionSlice';
import { store } from '../store';
import { NormalResult } from '../../@types';
import { profileApi } from '../api/profile.api';
import i18n from '../i18n';
import { testID } from '../components/utils/testID';
import CsfPage from '../components/CsfPage';
import { Dimension, CsfButtonProps, CsfAppIconProps } from '../components';
import CsfActivityIndicator from '../components/CsfActivityIndicator';
import promptAlert from '../components/CsfAlert';
import CsfAppIcon from '../components/CsfAppIcon';
import CsfPressable from '../components/CsfPressable';
import CsfText from '../components/CsfText';
import CsfView from '../components/CsfView';
import MgaButton from '../components/MgaButton';

/** User has not created a Wireless Car PIN yet  */
export const cNoRemoteServicePinExist = 'noRemoteServicePinExist';

let nid = 0;
let receivers: { id: number; resolver: (value: string) => void }[] = [];

const send = (id: number | undefined, message: string) => {
  const receiver = receivers.filter(r => r.id == id)[0];
  receiver?.resolver(message);
};

export interface PINOptions {
  title?: string
  message?: string
  biometricsEnabled?: boolean
  forgotPINEnabled?: boolean
}

/** Show a PIN screen. Callable from outside components. */
export const promptPIN = async (options?: PINOptions): Promise<string> => {
  nid = nid + 1;
  return new Promise(resolve => {
    const storedPin = getStoredPin();
    if (storedPin && storedPin.length == 4) {
      resolve(storedPin);
      return;
    }
    push('PIN', { id: nid, options: options });
    receivers.push({
      id: nid,
      resolver: value => {
        resolve(value);
        receivers = receivers.filter(r => r.id != nid);
      },
    });
  });
};

const MgaPINDigitIndicator = (props: { filled: boolean; testID?: string }) => {
  const r = 4 as Dimension;
  return (
    <CsfView
      width={r * 2}
      height={r * 2}
      borderColor={'copyPrimary'}
      borderRadius={r}
      borderWidth={1}
      m={r}
      bg={props.filled ? 'copyPrimary' : 'background'}
      testID={props.testID}
    />
  );
};

const PinButton: React.FC<
  CsfButtonProps & { text?: boolean; testID?: string }
> = props => {
  const smallDevice = Dimensions.get('window').height < 700;
  const [pressed, setPressed] = useState(false);
  const r = smallDevice ? 32 : 40;

  return (
    <CsfPressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={{ opacity: 1 }}
      aria-label={props.title}
      {...props}>
      <CsfView
        align="center"
        justify="center"
        width={r * 2}
        height={r * 2}
        borderRadius={r}
        testID={props.testID}
        bg={pressed ? 'button' : 'background'}>
        {props.icon ? (
          <CsfAppIcon icon={props.icon} />
        ) : (
          <CsfText
            color={pressed ? 'light' : 'copyPrimary'}
            variant={props.text ? 'button2' : 'pinButton'}>
            {props.title}
          </CsfText>
        )}
      </CsfView>
    </CsfPressable>
  );
};

export const MgaBiometricsIcon: React.FC<CsfAppIconProps> = props => {
  const biometrics = useAppSelector(state => state.biometrics);
  return (
    <CsfAppIcon
      color="button"
      icon={biometrics?.biometryType == 'FaceID' ? 'Faceid' : 'AndroidFingerid'}
      size="xl"
      {...props}
    />
  );
};

export type MgaBiometricsSetupBarProps = CsfAlertBarProps & {
  inProgress?: boolean
  onBiometricSetup?: () => void
}

export const MgaBiometricsSetupBar: React.FC<MgaBiometricsSetupBarProps> = ({
  inProgress,
  onBiometricSetup,
  ...props
}) => {
  const { t } = useTranslation();
  const biometrics = useAppSelector(state => state.biometrics);
  return (
    <CsfAlertBar
      icon={
        <CsfAppIcon
          icon={
            biometrics?.biometryType == 'FaceID' ? 'Faceid' : 'AndroidFingerid'
          }
        />
      }
      title={t(inProgress ? 'biometrics:inProgress' : 'biometrics:notEnrolled')}
      action={
        inProgress ? (
          <CsfView>
            <CsfActivityIndicator />
          </CsfView>
        ) : (
          <MgaButton
            trackingId="PINEnableBiometricsButton"
            size="sm"
            variant="inlineLink"
            title="Enable"
            onPress={onBiometricSetup}
          />
        )
      }
      {...props}
    />
  );
};

/** Modal to request a PIN from user. */
export const MgaPINCheck: React.FC = () => {
  const [PIN, setPIN] = useState('');
  const navigation = useAppNavigation();
  const route = useAppRoute<'PIN'>();
  const isDemo = useAppSelector(s => s.demo);
  const { t } = useTranslation();
  const id = testID('PinCheck');

  const onCancel = () => {
    send(route.params.id, '');
    navigation.goBack();
  };
  const onComplete = (pin: string) => {
    send(route.params.id, pin);
    navigation.goBack();
  };
  const title = route.params.options?.title ?? t('pinPanel:pinRequired');
  const message = route.params.options?.message ?? t('pinPanel:enterYourPin');
  const forgotPINEnabled = route.params.options?.forgotPINEnabled ?? true;
  const pushDigit = (digit: string) => {
    const newPIN = PIN + digit;
    setPIN(newPIN);
    if (newPIN.length == 4) {
      onComplete(newPIN);
    }
  };
  return (
    <CsfPage
      headerShown={false}
      noScroll
      flexDirection="column"
      bg="backgroundSecondary">
      <CsfView flex={1} justify="flex-start" testID={id('cancelContainer')}>
        <CsfView pr={8} align="flex-end" testID={id('cancelInnerContainer')}>
          <MgaButton
            trackingId="PINCancelButton"
            variant="inlineLink"
            icon="Close"
            onPress={onCancel}
            size="lg"
          />
        </CsfView>
      </CsfView>
      <CsfView testID={id()}>
        <CsfView
          flexDirection="column"
          align="center"
          standardSpacing
          pb={20}
          testID={id('pinIndicator')}>
          <CsfText variant="title3" testID={id('title')}>
            {title}
          </CsfText>
          <CsfText color="copySecondary" align="center" testID={id('message')}>
            {message}
          </CsfText>
          <CsfView flexDirection="row" testID={id('pinIndicatorContainer')}>
            <MgaPINDigitIndicator filled={PIN.length >= 1} testID={'pinDot1'} />
            <MgaPINDigitIndicator filled={PIN.length >= 2} testID={'pinDot2'} />
            <MgaPINDigitIndicator filled={PIN.length >= 3} testID={'pinDot3'} />
            <MgaPINDigitIndicator filled={PIN.length >= 4} testID={'pinDot4'} />
          </CsfView>
        </CsfView>
        <CsfView gap={16} testID={id('pin')}>
          <CsfView flexDirection="row" justify="center" gap={16}>
            <PinButton
              title="1"
              onPress={() => pushDigit('1')}
              testID={'pinButton1'}
            />
            <PinButton
              title="2"
              onPress={() => pushDigit('2')}
              testID={'pinButton2'}
            />
            <PinButton
              title="3"
              onPress={() => pushDigit('3')}
              testID={'pinButton3'}
            />
          </CsfView>
          <CsfView flexDirection="row" justify="center" gap={16}>
            <PinButton
              title="4"
              onPress={() => pushDigit('4')}
              testID={'pinButton4'}
            />
            <PinButton
              title="5"
              onPress={() => pushDigit('5')}
              testID={'pinButton5'}
            />
            <PinButton
              title="6"
              onPress={() => pushDigit('6')}
              testID={'pinButton6'}
            />
          </CsfView>
          <CsfView flexDirection="row" justify="center" gap={16}>
            <PinButton
              title="7"
              onPress={() => pushDigit('7')}
              testID={'pinButton7'}
            />
            <PinButton
              title="8"
              onPress={() => pushDigit('8')}
              testID={'pinButton8'}
            />
            <PinButton
              title="9"
              onPress={() => pushDigit('9')}
              testID={'pinButton9'}
            />
          </CsfView>
          <CsfView
            flexDirection="row"
            justify="center"
            gap={16}
            testID={id('buttonContainer')}>
            <PinButton
              title={t('clear')}
              onPress={() => setPIN('')}
              text
              testID={'clear'}
            />
            <PinButton
              title="0"
              onPress={() => pushDigit('0')}
              testID={'pinButton0'}
            />
            <PinButton
              title=""
              icon="Backspace"
              onPress={() => setPIN(PIN.substring(0, PIN.length - 1))}
              testID={'backspace'}
            />
          </CsfView>
          {!isDemo && forgotPINEnabled && (
            <MgaButton
              trackingId="PINForgotPinButton"
              variant="link"
              title={t('forgotPin:forgotPin')}
              onPress={() => {
                onComplete('');
                navigation.push('ResetPin');
              }}
            />
          )}
        </CsfView>
      </CsfView>

      <CsfView flex={1} />
    </CsfPage>
  );
};

export const remoteServicePinPrompt = async (): Promise<NormalResult<null>> => {
  const vehicle = getCurrentVehicle();
  // predicate also repeats here? hmm.....
  while (!vehicle?.remoteServicePinExist) {
    const { t } = i18n;
    const pin = await promptPIN({
      title: t('remoteServicePinPanel:pin'),
      message: t('remoteServicePinPanel:setPin'),
      forgotPINEnabled: false,
    });

    if (!pin) {
      throw {
        errorCode: cNoRemoteServicePinExist,
        success: false,
        data: null,
        dataName: null,
      };
    }

    const confirmPin = await promptPIN({
      title: t('remoteServicePinPanel:confirmPin'),
      forgotPINEnabled: false,
    });
    // Both pins have a value and match
    if (pin && confirmPin) {
      if (pin == confirmPin) {
        const request = profileApi.endpoints.setRemoteServicePin.initiate({
          remoteServicePin: pin,
        });
        const response = await store.dispatch(request).unwrap();
        if (!response.success) {
          await promptAlert(t('common:failed'), t('changePin:unableSet'));
        }
      } else {
        await promptAlert(
          t('common:error'),
          t(
            'changePin:remoteServicePinPanelFormValidateMessages:remoteServicePinConfirmation:equalTo',
          ),
        );
      }
    }
  }

  return { success: true, errorCode: null, data: null, dataName: null };
};
