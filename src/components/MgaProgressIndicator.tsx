/* eslint-disable eqeqeq */
import React from 'react';
import CsfView, { CsfViewProps } from './CsfView';
import CsfText from './CsfText';
import { Dimension } from './types';

export interface MgaProgressIndicatorProps extends CsfViewProps {
  current?: number;
  length?: number;
  radius?: number;
  bg?: 'background' | 'backgroundSecondary';
}

const defaultProps = {
  current: 1,
  length: 1,
  radius: 11,
  bg: 'background' as 'background' | 'backgroundSecondary',
};

/** Master Component Library - Progress Indicator */
const MgaProgressIndicator: React.FC<MgaProgressIndicatorProps> = props => {
  const { current, length, radius, bg, ...viewProps } = {
    ...defaultProps,
    ...props,
  };
  return (
    <CsfView
      bg={bg}
      flexDirection="row"
      justify="center"
      gap={4}
      {...viewProps}>
      {new Array(length).fill(0).map((_value, index) => {
        return (
          <CsfView
            align="center"
            justify="center"
            key={index + 1}
            width={radius * 2}
            height={radius * 2}
            borderRadius={radius as Dimension}
            bg={(() => {
              if (current == index + 1) {
                return 'button';
              } else {
                return bg == 'background' ? 'backgroundSecondary' : 'background';
              }
            })()}>
            <CsfText color={current == index + 1 ? 'light' : 'dark'}>
              {index + 1}
            </CsfText>
          </CsfView>
        );
      })}
    </CsfView>
  );
};

export default MgaProgressIndicator;
