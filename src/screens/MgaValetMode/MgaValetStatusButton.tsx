/* eslint-disable eol-last */
/* eslint-disable eqeqeq */
/* eslint-disable react/no-unstable-nested-components */
import React, { ReactNode, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Animated } from 'react-native';
import ValetPump from '../../../content/svg/pumps/valet_pump.svg';
import ValetPumpActivatingDeactivating from '../../../content/svg/pumps/activating_deactivating_pump.svg';
import ValetPumpPending from '../../../content/svg/pumps/pending_pump.svg';
import ValetPumpActive from '../../../content/svg/pumps/active_pump.svg';
import { ValetStatus } from '../../../@types';
import { enableValetMode } from '../../features/remoteService/valetMode';
import { RemoteServiceResponse } from '../../features/remoteService/remoteService.api';
import { testID } from '../../components/utils/testID';
import CsfPressable from '../../components/CsfPressable';
import CsfView from '../../components/CsfView';
import CsfText from '../../components/CsfText';

export interface MgaValetStatusButtonProps {
  status: ValetStatus
  handleValetActivating: (valetActivating: boolean) => void
}

interface StatusButtonData {
  labelKey: string
  variant: 'statusLight' | 'button'
  PumpComponent: () => ReactNode
  handlePress?: () => Promise<RemoteServiceResponse>
}

const valetStatusButtonMap: { [key in ValetStatus]: StatusButtonData } = {
  VAL_ON: {
    labelKey: 'valetMode:setup.deactivateButton',
    variant: 'statusLight',
    PumpComponent: () => <ValetPumpActive />,
  },
  VAL_OFF: {
    labelKey: 'valetMode:setup.activateButton',
    variant: 'button',
    PumpComponent: () => <ValetPump />,
    handlePress: enableValetMode,
  },
  VAL_ACTIVATING: {
    labelKey: 'valetMode:activating',
    variant: 'statusLight',
    PumpComponent: () => <ValetPumpActivatingDeactivating />,
  },
  VAL_DEACTIVATING: {
    labelKey: 'valetMode:deactivating',
    variant: 'statusLight',
    PumpComponent: () => <ValetPumpActivatingDeactivating />,
  },
  VAL_ON_PENDING: {
    labelKey: 'valetMode:setup.activateButtonPending',
    variant: 'statusLight',
    PumpComponent: () => <ValetPumpPending />,
  },
  VAL_OFF_PENDING: {
    labelKey: 'valetMode:setup.deactivateButtonPending',
    variant: 'statusLight',
    PumpComponent: () => <ValetPumpPending />,
  },
  NO_RECORDS: {
    labelKey: 'valetMode:setup.activateButton',
    variant: 'button',
    PumpComponent: () => <ValetPump />,
    handlePress: enableValetMode,
    // Leaving this here for now until mga-1719 marked resolved TODO:UA:20240523 -- delete comments if we don't need this
    //  from valetMode.js cordova -- if(response.data == "VAL_OFF" || response.data == "NO_RECORDS" || response.data == "NO_MATCHING_SERVICE_NAME") {
    // labelKey: 'valetMode:valetError',
    // variant: 'statusLight',
    // PumpComponent: () => <ValetPumpNoRecords />,
  },
  NO_MATCHING_SERVICE_NAME: {
    labelKey: 'valetMode:setup.activateButton',
    variant: 'button',
    PumpComponent: () => <ValetPump />,
    handlePress: enableValetMode,
    // Leaving this here for now until mga-1719 marked resolved TODO:UA:20240523 -- delete comments if we don't need this
    // labelKey: 'valetMode:valetError',
    // variant: 'statusLight',
    // PumpComponent: () => <ValetPumpNoRecords />,
  },
};

const MgaValetStatusButton: React.FC<MgaValetStatusButtonProps> = ({
  status,
  handleValetActivating,
}) => {
  const config = valetStatusButtonMap[status];
  const { t } = useTranslation();
  const { labelKey, variant, PumpComponent, handlePress } = config;

  const opacityAnimation = useRef(new Animated.Value(0.5)).current;

  const fadeInOpacity = useRef(
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ),
  ).current;

  useEffect(() => {
    if (status == 'VAL_ON') {
      setTimeout(() => {
        fadeInOpacity.start();
      }, 1000);
    }
  }, [status]);

  const withWrapper = (Pump: React.FC, variant: string): React.FC => {
    const buttonDiameter = 210;
    const pumpDiameter = 240;
    // using a negative `hitSlop` value so the four corners of the rectangle
    // containing the circular Pump are not pressable.
    const hitSlop = -20;
    const styles = StyleSheet.create({
      wrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        // setting `overflow: hidden` when valet status is off so the four corners of the rectangle
        // containing the circular Pump are not pressable. setting is back to `visible` so the pump drop shadow is not clipped.
        // overflow: status === 'VAL_OFF' ? 'hidden' : 'visible',
        // this overflow breaks drop shadow on all of the above. we will need to split the graphic, i think.

        width: buttonDiameter,
        height: buttonDiameter,
        borderRadius: buttonDiameter / 2,
      },
      inner: {
        position: 'absolute',
        zIndex: 1,
      },
      pumpContainer: {
        width: pumpDiameter,
        height: pumpDiameter,
        borderRadius: pumpDiameter / 2,
      },
    });

    const id = testID('ValetStatusButton');

    return () =>
      variant == 'button' ? (
        <CsfPressable
          hitSlop={hitSlop}
          style={styles.wrapper}
          onPress={() => {
            handlePress &&
              handlePress()
                .then(({ errorCode, success }) => {
                  if (
                    !success &&
                    (errorCode == 'cancelled' ||
                      errorCode == 'TimeframePassed' ||
                      errorCode == 'InvalidCredentials' ||
                      errorCode == null)
                  ) {
                    // if the user cancels out of the pin pad or invalid pin
                    handleValetActivating(false);
                  }
                })
                .catch(console.error);
            if (status == 'VAL_OFF') {
              handleValetActivating(true);
            }
          }}>
          <CsfView flex={1} width={150} style={styles.inner}>
            <CsfText
              color="light"
              variant="display3"
              align="center"
              testID={id('valetActivate')}>
              {t(labelKey)}
            </CsfText>
          </CsfView>
          <CsfView style={styles.pumpContainer}>
            <Pump />
          </CsfView>
        </CsfPressable>
      ) : (
        <CsfView style={styles.wrapper} flex={1}>
          <CsfView flex={1} width={150} style={styles.inner} gap={16}>
            <CsfText
              testID={id('valetStatus')}
              color={status == 'VAL_ON' ? 'light' : 'dark'}
              variant="display3"
              align="center">
              {t(labelKey)}
            </CsfText>
          </CsfView>

          <CsfView style={styles.pumpContainer}>
            <Animated.View style={{ opacity: opacityAnimation }}>
              <Pump />
            </Animated.View>
          </CsfView>
        </CsfView>
      );
  };

  const ComponentToRender = withWrapper(PumpComponent, variant);
  return (
    <CsfView flexDirection="row" flex={1}>
      <ComponentToRender />
    </CsfView>
  );
};

export default MgaValetStatusButton;