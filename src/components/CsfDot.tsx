import React from 'react';
import CsfView from './CsfView';
import { CsfColorPalette } from './useCsfColors';
import { Dimension } from './types';

export type CsfDotProps = {
  color?: keyof CsfColorPalette;
  size?: Dimension;
  outline?: boolean;
};

const CsfDot: React.FC<CsfDotProps> = props => {
  const size = props.size || 8;
  const color = props.outline ? 'clear' : props.color || 'copyPrimary';
  const borderColor = props.outline ? props.color || 'copyPrimary' : 'clear';

  return (
    <CsfView
      bg={color}
      width={size}
      height={size}
      borderRadius={(size / 2) as Dimension}
      borderWidth={props.outline ? 2 : 0}
      borderColor={borderColor}
    />
  );
};

export default CsfDot;
