/* eslint-disable eol-last */
import React from 'react';
import { View, ViewStyle } from 'react-native';
import { CsfColorPalette, useCsfColors } from './useCsfColors';
import { Dimension } from './types';

export interface CsfRuleProps {
  /** Line direction. Default is horizontal. */
  orientation?: 'horizontal' | 'vertical'
  /** Color of rule. Default is 'rule' (neutral gray) */
  color?: keyof CsfColorPalette
  inset?: Dimension
  testID?: string
}

export const CsfRuleDefaultProps = {
  orientation: 'horizontal' as 'horizontal' | 'vertical',
  color: 'rule' as keyof CsfColorPalette,
};

const CsfRule: React.FC<CsfRuleProps> = props => {
  const { colors } = useCsfColors();
  const { orientation, color } = { ...CsfRuleDefaultProps, ...props };
  // Default is horizontal so ('horizontal' or undefined) = not vertical
  const horizontal = orientation !== 'vertical';
  const box: ViewStyle = horizontal
    ? { flexDirection: 'row', height: 1, paddingHorizontal: props.inset || 0 }
    : { flexDirection: 'column', width: 1, paddingVertical: props.inset || 0 };
  const line: ViewStyle = horizontal
    ? {
      height: 1,
      flexBasis: 'auto',
      flexGrow: 1,
      flexShrink: 0,
      backgroundColor: colors[color],
    }
    : {
      width: 1,
      flexBasis: 'auto',
      flexGrow: 1,
      flexShrink: 0,
      backgroundColor: colors[color],
    };
  const spacer: ViewStyle = {
    flexBasis: 0,
    flexGrow: 0,
    flexShrink: 1,
  };
  return (
    <View style={box} testID={props.testID}>
      <View style={spacer} />
      <View style={line} />
      <View style={spacer} />
    </View>
  );
};

export default CsfRule;