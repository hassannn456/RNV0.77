import React from 'react';
import { CsfColorPalette, useCsfColors } from './useCsfColors';
import { Dimension } from './types';

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export type CsfIconHelperProps = {
  children: (v: {
    colors?: CsfColorPalette;
    getSize?: (size: Size) => Dimension;
  }) => JSX.Element;
};

const sizes: Record<Size, Dimension> = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 72,
};

const getSize = (size: Size) => sizes[size];

/* helper to wrap svg icons so end consumer can use t shirt sizes +  theme color names in correct theme  */
const CsfIconHelper: React.FC<CsfIconHelperProps> = props => {
  const { colors } = useCsfColors();
  return props.children ? props.children({ colors, getSize }) : null;
};

// Default export for CsfIconHelper
export default CsfIconHelper;
