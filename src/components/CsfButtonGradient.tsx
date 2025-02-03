import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { useCsfColors } from './useCsfColors';
import { ViewProps } from 'react-native';

const CsfButtonGradient = (props: ViewProps): JSX.Element => {
  const { colors } = useCsfColors();
  return (
    <LinearGradient
      colors={['#4a9cfa', colors.button]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={props.style || {}}>
      {props.children}
    </LinearGradient>
  );
};

export default CsfButtonGradient;
