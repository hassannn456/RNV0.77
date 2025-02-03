/* eslint-disable eol-last */
import React, { ReactNode } from 'react';
import CsfView, { CsfViewProps, } from './CsfView';
import CsfText, { CsfTextProps, CsfTextVariant } from './CsfText';
import CsfPressable from './CsfPressable';
import { CsfColorPalette } from './useCsfColors';
import { testID } from './utils/testID';

// TODO:AG:20231012 - pick the ones we need
export interface CsfListItemProps
  extends Pick<CsfViewProps, 'children' | 'ph' | 'pv' | 'testID'> {
  title?: string | ReactNode
  subtitle?: string | ReactNode
  action?: string | ReactNode
  icon?: ReactNode
  onActionPress?: () => void
  onPress?: () => void
  color?: keyof CsfColorPalette
  titleTextVariant?: CsfTextVariant
  subtitleTextVariant?: CsfTextVariant
}

export const csfLayoutTitleTextDefaultProps: Partial<CsfTextProps> = {
  variant: 'heading',
  color: 'copyPrimary',
};

export const csfLayoutSubtitleTextDefaultProps: Partial<CsfTextProps> = {
  variant: 'body2',
  color: 'copySecondary',
};

const Layout: React.FC<CsfListItemProps> = props => {
  const id = testID(props?.testID);
  return (
    <CsfView
      flexDirection="row"
      justify="flex-start"
      gap={12}
      align="center"
      ph={props.ph === 0 ? props.ph : props.ph || 16}
      pv={props.pv === 0 ? props.pv : props.pv || 16}>
      <CsfView flex={1} flexDirection="row" gap={8} align="center">
        {props.icon && <CsfView maxWidth={44}>{props.icon}</CsfView>}
        <CsfView flex={1}>
          {props.title &&
            (typeof props.title == 'string' ? (
              <CsfText
                testID={id('title')}
                variant={
                  props.titleTextVariant ||
                  csfLayoutTitleTextDefaultProps.variant
                }
                color={props.color || csfLayoutTitleTextDefaultProps.color}>
                {props.title}
              </CsfText>
            ) : (
              props.title
            ))}
          {props.subtitle &&
            (typeof props.subtitle == 'string' ? (
              <CsfText
                testID={id('subtitle')}
                variant={
                  props.subtitleTextVariant ||
                  csfLayoutSubtitleTextDefaultProps.variant
                }
                color={props.color || csfLayoutSubtitleTextDefaultProps.color}>
                {props.subtitle}
              </CsfText>
            ) : (
              props.subtitle
            ))}
        </CsfView>
      </CsfView>
      {props.action && <CsfView>{props.action}</CsfView>}
    </CsfView>
  );
};

const CsfListItem: React.FC<CsfListItemProps> = props => {
  return props.onPress ? (
    <CsfPressable onPress={props.onPress}>
      <Layout {...props} />
    </CsfPressable>
  ) : (
    <Layout {...props} />
  );
};

export default CsfListItem;