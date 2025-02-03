/* eslint-disable eol-last */
// cSpell:ignore Moonroof, PANPM, TUIRWAOC, PANMRF, FGTU, INTRETR, PWRSHD
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet } from 'react-native';
import { CsfView, CsfViewProps } from '../components';
import { useCsfColors } from '../components/useCsfColors';
import { useCurrentVehicle } from '../features/auth/sessionSlice';
import WindowDriverFront from '../../content/svg/VehicleConditionCheck/window-driver-front.svg';
import WindowDriverRear from '../../content/svg/VehicleConditionCheck/window-driver-rear.svg';
import WindowMoonroof from '../../content/svg/VehicleConditionCheck/window-moonroof.svg';
import WindowPassengerFront from '../../content/svg/VehicleConditionCheck/window-passenger-front.svg';
import WindowPassengerRear from '../../content/svg/VehicleConditionCheck/window-passenger-rear.svg';
import DoorFrontLeft from '../../content/svg/VehicleConditionCheck/door-driver-side-front.svg';
import DoorFrontRight from '../../content/svg/VehicleConditionCheck/door-passenger-side-front.svg';
import DoorRearLeft from '../../content/svg/VehicleConditionCheck/door-driver-side-rear.svg';
import DoorRearRight from '../../content/svg/VehicleConditionCheck/door-passenger-side-rear.svg';
import DoorBoot from '../../content/svg/VehicleConditionCheck/door-tailgate.svg';
import DoorEngineHood from '../../content/svg/VehicleConditionCheck/door-hood.svg';
import { hasMoonroof } from '../utils/vehicle';

const carStyles = StyleSheet.create({
  pageContainer: { height: 444 },
  carContainer: { backgroundColor: '#00000000', width: '100%' },
  tireShape: {
    backgroundColor: '#E22828CF',
    position: 'absolute',
    width: '5.5%',
    height: '15%',
  },
});

export interface MgaCarViewProps extends CsfViewProps {
  tirePressureFrontLeftWarning?: boolean
  tirePressureFrontRightWarning?: boolean
  tirePressureRearLeftWarning?: boolean
  tirePressureRearRightWarning?: boolean
  windowFrontLeft?: boolean
  windowFrontRight?: boolean
  windowRearLeft?: boolean
  windowRearRight?: boolean
  windowSunroof?: boolean
  doorFrontLeftOpen?: boolean
  doorFrontRightOpen?: boolean
  doorRearLeftOpen?: boolean
  doorRearRightOpen?: boolean
  doorBootOpen?: boolean
  doorEngineHoodOpen?: boolean
}

const MgaCarView: React.FC<MgaCarViewProps> = props => {
  const { colors } = useCsfColors();
  const vehicle = useCurrentVehicle();
  const vehicleImageSource = (
    hasMoonroof(vehicle)
      ? require('../../content/img/VehicleWithMoonroof.png')
      : require('../../content/img/VehicleWithoutMoonroof.png')
  ) as ImageSourcePropType;
  const errorFill = colors.error + '7F'; // Add transparency
  const errorStroke = colors.error;
  return (
    <CsfView align="center">
      <CsfView style={{ width: 329, height: 424 }}>
        <Image source={vehicleImageSource} style={carStyles.carContainer} />
        {props.tirePressureFrontLeftWarning && (
          <CsfView style={[carStyles.tireShape, { top: '21%', left: '28%' }]} />
        )}
        {props.tirePressureFrontRightWarning && (
          <CsfView style={[carStyles.tireShape, { top: '21%', left: '61%' }]} />
        )}
        {props.tirePressureRearLeftWarning && (
          <CsfView style={[carStyles.tireShape, { top: '66%', left: '28%' }]} />
        )}
        {props.tirePressureRearRightWarning && (
          <CsfView style={[carStyles.tireShape, { top: '66%', left: '61%' }]} />
        )}
        {props.windowFrontLeft && (
          <WindowDriverFront
            fill={errorFill}
            stroke={errorStroke}
            style={{
              position: 'absolute',
              top: 155,
              left: '30%',
              width: 12,
              height: 75,
            }}
          />
        )}
        {props.windowFrontRight && (
          <WindowPassengerFront
            fill={errorFill}
            stroke={errorStroke}
            style={{
              position: 'absolute',
              top: 162,
              left: 205,
              width: 12,
              height: 75,
            }}
          />
        )}
        {props.windowRearLeft && (
          <WindowDriverRear
            fill={errorFill}
            stroke={errorStroke}
            style={{
              position: 'absolute',
              top: '55%',
              left: '30%',
              width: 13,
              height: 45,
            }}
          />
        )}
        {props.windowRearRight && (
          <WindowPassengerRear
            fill={errorFill}
            stroke={errorStroke}
            style={{
              position: 'absolute',
              top: '55%',
              left: 205,
              width: '3.95%',
              height: 46,
            }}
          />
        )}
        {props.windowSunroof && (
          <WindowMoonroof
            fill={errorFill}
            stroke={errorStroke}
            style={{
              position: 'absolute',
              top: 196,
              left: 119,
              width: 79,
              height: 36,
            }}
          />
        )}
        {props.doorFrontLeftOpen && (
          <DoorFrontLeft
            fill={errorFill}
            stroke={errorStroke}
            style={{
              position: 'absolute',
              top: 148,
              left: 82,
              width: 30,
              height: 75,
            }}
          />
        )}
        {props.doorFrontRightOpen && (
          <DoorFrontRight
            fill={errorFill}
            stroke={errorStroke}
            style={{
              position: 'absolute',
              top: 148,
              left: 206,
              width: 24.5,
              height: 75,
            }}
          />
        )}
        {props.doorRearLeftOpen && (
          <DoorRearLeft
            fill={errorFill}
            stroke={errorStroke}
            style={{
              position: 'absolute',
              top: 230,
              left: 90,
              width: 23,
              height: 75,
            }}
          />
        )}
        {props.doorRearRightOpen && (
          <DoorRearRight
            fill={errorFill}
            stroke={errorStroke}
            style={{
              position: 'absolute',
              top: 230,
              left: 203,
              width: 21,
              height: 75,
            }}
          />
        )}
        {props.doorBootOpen && (
          <DoorBoot
            fill={errorFill}
            stroke={errorStroke}
            style={{ position: 'absolute', top: '78.5%', left: '34%' }}
          />
        )}
        {props.doorEngineHoodOpen && (
          <DoorEngineHood
            fill={errorFill}
            stroke={errorStroke}
            style={{ position: 'absolute', top: '14%', left: '33.5%' }}
          />
        )}
      </CsfView>
    </CsfView>
  );
};


export default MgaCarView;