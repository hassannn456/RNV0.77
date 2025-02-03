import React from 'react';
import {
  ActivityIndicator,
  ActivityIndicatorProps,
  ColorValue,
} from 'react-native';
import { CsfColorPalette, useCsfColors } from './useCsfColors';

const CsfActivityIndicator = (
  props: ActivityIndicatorProps,
): JSX.Element => {
  const { colors } = useCsfColors();
  const color: ColorValue =
    colors[(props?.color as keyof CsfColorPalette) || 'button'];
  return <ActivityIndicator {...props} color={color} />;
};

export default CsfActivityIndicator;
