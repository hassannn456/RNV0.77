/* eslint-disable eol-last */
import React from 'react';
import { TextProps } from 'react-native';
import * as CsfIcons from '../../core/res/assets/icons';
import { CsfColorPalette } from './useCsfColors';

const CsfAppIconSizes = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 72,
  h6: 32,
  h5: 40,
  h4: 48,
  h3: 56,
  h2: 64,
  h1: 72,
};

export interface CsfAppIconProps extends TextProps {
  color?: keyof CsfColorPalette
  size?: keyof typeof CsfAppIconSizes
  icon?: keyof typeof CsfIcons
  testID?: string
}

/** Icon set used by MySubaru app (Subiestrap) */
const CsfAppIcon: React.FC<CsfAppIconProps> = props => {
  if (props.icon) {
    try {
      const Icon = CsfIcons[props.icon];
      if (!Icon) {
        console.error(`Icon <<${props.icon}>> not found in resource bundle!`);
        return;
      }
      return <Icon {...props} />;
    } catch (_e) {
      console.error('Missing icon');
      return null;
    }
  }

  return null;
};

export default CsfAppIcon;