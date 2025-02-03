/* eslint-disable eol-last */
import React from 'react';
import LinearGradient from 'react-native-linear-gradient';
// import { useColorScheme } from 'react-native'
import { ViewProps } from 'react-native';

const CsfBoxGradient = (props: ViewProps): JSX.Element => {
  //const dark = useColorScheme() === 'dark'
  // dark ? ['#444', '#111'] :
  return (
    <LinearGradient
      colors={['#f7f5f5', '#d6d6d6']}
      start={{ x: 0.25, y: 0 }}
      end={{ x: 0.4, y: 1 }}
      style={props.style || {}}>
      {props.children}
    </LinearGradient>
  );
};

export default CsfBoxGradient;