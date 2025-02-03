/* eslint-disable semi */
import React from 'react';

import CsfListItem, { CsfListItemProps } from './CsfListItem';
import CsfTile, { CsfTileProps } from './CsfTile';
import { CsfColorPalette } from './useCsfColors';
import { CsfIcon } from '../../core/res/assets/icons';
import CsfView from './CsfView';
import { testID } from './utils/testID';

export type AlertBarTypes = 'information' | 'success' | 'error' | 'warning'
export interface CsfAlertBarProps extends CsfListItemProps, CsfTileProps {
  type?: AlertBarTypes
  flat?: boolean
}

const bgColors: Record<string, keyof CsfColorPalette> = {
  information: 'highlightInfo',
  success: 'highlightSuccess',
  warning: 'highlightWarning',
  error: 'highlightError',
};

const borderColors: Record<string, keyof CsfColorPalette> = {
  information: 'button',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

/** TODO:AG:20240103: Add other icons, remove partial */
export const CsfAlertBarIcons: Partial<Record<AlertBarTypes, CsfIcon>> = {
  information: 'InformationColor',
  success: 'SuccessColor',
  warning: 'WarningColor',
  error: 'ErrorColor',
};

export const CsfAlertBarIconColors: Partial<
  Record<AlertBarTypes, keyof CsfColorPalette>
> = {
  information: 'button',
  success: 'success',
  warning: 'warning',
  error: 'error',
};

export const CsfAlertBar: React.FC<CsfAlertBarProps> = props => {
  const type = props.type || 'information';
  const borderColor = borderColors[type];
  const derivedTestID = testID(props?.testID || props?.trackingId);
  return (
    <CsfTile
      p={0}
      borderRadius={4}
      testID={derivedTestID()}
      borderColor={borderColor}
      bg={bgColors[type]}
      borderWidth={props.borderWidth || props.flat ? 0 : 1}
      flat={props.flat}>
      <CsfListItem
        title={props.title}
        testID={derivedTestID('text')}
        titleTextVariant={'button'}
        subtitleTextVariant={'body2'}
        subtitle={props.subtitle}
        icon={props.action && props.icon}
        action={(!props.action && props.icon && props.icon) || props.action}
      />
    </CsfTile>
  );
};

const CsfStatusBar: React.FC<CsfAlertBarProps> = props => {
  const derivedTestID = testID(props?.testID || props?.trackingId);
  return (
    <CsfView
      theme="dark"
      bg="backgroundSecondary"
      borderRadius={4}
      testID={derivedTestID('view')}>
      <CsfListItem
        testID={derivedTestID()}
        onPress={props.onPress}
        title={props.title}
        subtitle={props.subtitle}
        titleTextVariant="button"
        subtitleTextVariant="body2"
        icon={props.icon}
        action={props.action}
      />
    </CsfView>
  );
};

export default CsfStatusBar
