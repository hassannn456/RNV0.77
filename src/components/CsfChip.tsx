/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import CsfView from './CsfView';
import { Dimension } from './types';
import { CsfIcon } from '../../core/res/assets/icons';
import CsfText from './CsfText';
import CsfAppIcon from './CsfAppIcon';
import { CsfDot } from './CsfDot';
import { FlexAlignType } from 'react-native';
import CsfPressable from './CsfPressable';
import { testID } from './utils/testID';
import { CsfColorPalette } from './useCsfColors';

export type CsfChipProps = {
  label: string
  value?: string
  icon?: CsfIcon
  onPress?: () => void
  active?: boolean
  align?: FlexAlignType
  testID?: string
  color?: keyof CsfColorPalette
  size?: 'small' | 'medium' | 'large'
}
export const CsfChip: React.FC<CsfChipProps> = props => {
  const sizeMap = {
    small: 24,
    medium: 32,
    large: 40,
  };
  const size = sizeMap[props.size || 'medium'];
  const color = props.color || (props.active ? 'copyPrimary' : undefined);
  const borderColor = props.color || 'copyPrimary';

  const id = testID(props.testID || 'Chip');

  const Chip: React.FC = () => (
    <CsfView
      pr={12}
      pl={props.icon ? 8 : 12}
      gap={4}
      flexDirection="row"
      align="center"
      style={{ alignSelf: 'flex-start' }}
      bg={color || 'clear'}
      height={size}
      borderRadius={(size / 2) as Dimension}
      borderWidth={color ? 0 : 1}
      borderColor={borderColor}>
      {props.icon && (
        <CsfAppIcon
          icon={props.icon}
          color={props.active ? 'light' : borderColor}
        />
      )}
      <CsfText
        variant="subheading"
        color={props.active ? 'light' : borderColor}
        testID={id('label')}>
        {props.label}
      </CsfText>
    </CsfView>
  );

  return props.onPress ? (
    <CsfPressable onPress={props.onPress} accessibilityLabel={props.label}>
      <Chip />
    </CsfPressable>
  ) : (
    <Chip />
  );
};

const CsfStatusChip: React.FC<CsfChipProps> = props => {
  const size = 32;
  const color = props.active ? 'highlightSuccess' : 'clear';
  const borderColor = props.active ? 'highlightSuccess' : 'inputBorder';
  const align = props.align || 'flex-start';
  const id = testID(props.testID || 'StatusChip');

  return (
    <CsfView
      pr={12}
      pl={props.icon ? 8 : 12}
      gap={4}
      flexDirection="row"
      align="center"
      style={{ alignSelf: align }}
      bg={color}
      height={size}
      borderRadius={(size / 2) as Dimension}
      borderWidth={props.active ? 0 : 1}
      borderColor={borderColor}>
      {props.active && <CsfDot size={8} color="success" />}
      {props.icon && (
        <CsfAppIcon icon={props.icon} size="sm" color="copySecondary" />
      )}
      <CsfText
        variant="subheading"
        color={'copySecondary'}
        testID={id('label')}>
        {props.label}
      </CsfText>
    </CsfView>
  );
};


export default CsfStatusChip;