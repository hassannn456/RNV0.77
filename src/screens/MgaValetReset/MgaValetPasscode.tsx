/* eslint-disable semi */
/* eslint-disable eol-last */
/* eslint-disable react-native/no-inline-styles */
// cSpell:ignore valetmodePwReset1, toresetValetPasscode
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Vehicle from '../../../content/svg/passcode-step1.svg';
import VehicleTwo from '../../../content/svg/passcode-step2.svg';
import VehicleThree from '../../../content/svg/passcode-step3.svg';
import VehicleFour from '../../../content/svg/passcode-step4.svg';
import VehicleFive from '../../../content/svg/passcode-step5.svg';
import { CsfCheckBox } from '../../components/CsfCheckbox';
import { promptPIN } from '../MgaPINCheck';
import { useAppNavigation } from '../../Controller';
import { CsfProgressDots } from '../../components/CsfProgressDots';
import { testID } from '../../components/utils/testID';
import CsfSimpleAlert from '../../components/CsfSimpleAlert';
import MgaPage from '../../components/MgaPage';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';
import MgaButton from '../../components/MgaButton';

export interface ValetModePasscode {
  screen: string
  onConfirm?: (pin?: string) => void
  onCancel?: () => void
  showConfirmButton?: boolean
  showCancelButton?: boolean
  title?: string
  subTitle?: string
  buttonLabel?: string
  testID?: string
}

const MgaValetPasscode: React.FC<ValetModePasscode> = props => {
  const [isChecked, setIsChecked] = useState(false);
  const { t } = useTranslation();
  const navigation = useAppNavigation();
  const firstScreen = props.screen == '1' || false;
  const imageProps = {
    width: 50,
    height: 50,
  };

  const onGetPin = async () => {
    try {
      const pin = await promptPIN({
        biometricsEnabled: true,
        title: t('pinPanel:enterYourPin'),
        message: t('pinPanel:pinRequired'),
      });
      if (!pin) {
        return;
      }
      props.onConfirm && props.onConfirm(pin);
    } catch {
      CsfSimpleAlert(t('common:error'), t('biometrics:unableToSetup'), {
        type: 'error',
      });
    }
  };
  const id = testID(props.testID);
  return (
    <MgaPage bg="clear" noScroll>
      <CsfView
        edgeInsets
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingBottom: 16,
        }}>
        <CsfView
          edgeInsets
          standardSpacing
          style={{
            flex: 1,
            gap: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {firstScreen && <Vehicle {...imageProps} />}
          {props.screen == '2' && <VehicleTwo {...imageProps} />}
          {props.screen == '3' && <VehicleThree {...imageProps} />}
          {props.screen == '4' && <VehicleFour {...imageProps} />}
          {props.screen == '5' && <VehicleFive {...imageProps} />}
          <CsfView mt={20} gap={12}>
            <CsfText
              variant="title"
              color={firstScreen ? 'light' : 'dark'}
              align="center"
              testID={id('title')}>
              {props.title}
            </CsfText>
            <CsfText
              color={firstScreen ? 'light' : 'dark'}
              align="center"
              testID={id('subTitle')}>
              {props.subTitle}
            </CsfText>
          </CsfView>
          {props.screen == '2' && (
            <CsfView edgeInsets flexDirection="row">
              <CsfCheckBox
                testID={id('readyToProceed')}
                label={t('valetMode:valetModeReset.readyToProceed')}
                onChangeValue={e => setIsChecked(e)}
                checked={!!isChecked}
              />
            </CsfView>
          )}
        </CsfView>
        <CsfView
          style={{
            flex: 0.25,
            width: '100%',
            gap: 10,
            justifyContent: 'flex-end',
          }}>
          {props.showConfirmButton && (
            <MgaButton
              trackingId="ValetConfirmPasscode"
              variant="primary"
              enabled={props.screen == '2' && !isChecked ? false : true}
              onPress={async () => {
                if (props.screen == '3') {
                  await onGetPin();
                } else if (props.screen == '5') {
                  navigation.navigate('Dashboard');
                } else {
                  props.onConfirm && props.onConfirm();
                }
              }}
              title={props.buttonLabel}
            />
          )}
          {props.showCancelButton && (
            <MgaButton
              trackingId="ValetPasscodeCancelButton"
              style={{ flex: 1 }}
              title={t('common:cancel')}
              variant="link"
              onPress={() => {
                props.onCancel && props.onCancel();
              }}
            />
          )}
        </CsfView>
        <CsfProgressDots
          count={5}
          index={Number(props.screen) - 1}
          variant="classic"
        />
      </CsfView>
    </MgaPage>
  );
};

export default MgaValetPasscode