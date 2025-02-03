/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-unused-vars */
// cSpell:ignore miblanchard
import React from 'react';
// import { Slider } from '@miblanchard/react-native-slider'

import { useCsfColors } from './useCsfColors';
import LinearGradient from 'react-native-linear-gradient';
import CsfView from './CsfView';

interface MgaTemperatureSliderProps {
  min?: number;
  max?: number;
  onChange?: (v: string) => void;
  step?: number;
  value: number;
  disabled?: boolean;
}

const MgaTemperatureSlider: React.FC<MgaTemperatureSliderProps> = ({
  min,
  max,
  onChange,
  step,
  value,
  disabled,
}) => {
  const { colors } = useCsfColors();

  return (
    <CsfView>
      <LinearGradient
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        colors={[colors.button, colors.error]}
        style={{ borderRadius: 16, height: 32, paddingHorizontal: 6 }}>
        {/* <Slider
          disabled={disabled}
          minimumValue={min}
          maximumValue={max}
          minimumTrackTintColor={'transparent'}
          maximumTrackTintColor={'transparent'}
          onSlidingComplete={
            onChange
              ? (v) => {
                  const getValue = Array.isArray(v) ? v[0] : v;
                  const stringedValue = getValue.toString();
                  onChange(stringedValue);
                }
              : undefined
          }
          value={value}
          step={step ?? 1}
          thumbTintColor="#fff"
          containerStyle={{ height: 32 }}
          trackClickable={true}
        /> */}
      </LinearGradient>
    </CsfView>
  );
};

export default MgaTemperatureSlider;
