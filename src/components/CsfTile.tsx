/* eslint-disable eol-last */
import React from 'react';
import { StyleSheet } from 'react-native';

import { boxShadow } from './constants';
import CsfView, { CsfViewProps } from './CsfView';
import { CsfColorPalette } from './useCsfColors';
import { Dimension } from './types';
import CsfActivityIndicator from './CsfActivityIndicator';

export interface CsfTileProps extends CsfViewProps {
  flat?: boolean
  testID?: string
}

const styles = StyleSheet.create({
  shadow: {
    ...boxShadow(1, 2, '#000000', 0.1, 3, 2),
  },
});

export const CsfTileDefaultProps = {
  bg: 'backgroundSecondary' as keyof CsfColorPalette,
  p: 16 as Dimension,
  gap: 16 as Dimension,
  flat: false,
};

const CsfTile: React.FC<CsfTileProps> = props => {
  const {
    bg,
    borderColor,
    children,
    flat,
    isLoading,
    onLayout,
    ...innerViewProps
  } = {
    ...CsfTileDefaultProps,
    ...props,
  };
  return flat ? (
    <CsfView
      borderRadius={4}
      borderColor={borderColor}
      bg={bg}
      {...innerViewProps}
      borderWidth={props.borderWidth || 0}
      style={{ overflow: 'hidden' }}>
      {!isLoading ? children : <CsfActivityIndicator />}
    </CsfView>
  ) : (
    <CsfView
      style={{ ...styles.shadow }}
      borderRadius={8}
      borderWidth={0}
      bg={bg}
      onLayout={onLayout}>
      <CsfView
        // bg={bg}
        borderColor={borderColor}
        borderRadius={8}
        {...innerViewProps}
        borderWidth={borderColor ? 1 : 0}
        style={{ overflow: 'hidden' }}>
        {!isLoading ? children : <CsfActivityIndicator />}
      </CsfView>
    </CsfView>
  );
};


export default CsfTile;