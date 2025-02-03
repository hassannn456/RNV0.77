/* eslint-disable eqeqeq */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable curly */
import React from 'react';
import {
  GestureResponderEvent,
  Pressable,
  PressableProps,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import CsfAppIcon from './CsfAppIcon';
import CsfText from './CsfText';
import { CsfColorPalette, useCsfColors } from './useCsfColors';
import CsfActivityIndicator from './CsfActivityIndicator';
import CsfView, { ColorProps } from './CsfView';
import { CsfIcon } from '../../core/res/assets/icons';
import { testID } from './utils/testID';
import { ReactNode } from 'react';
export type CsfButtonType = 'primary' | 'secondary' | 'link' | 'inlineLink'

export type CsfButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type CsfIconPosition = 'start' | 'end'
export type CsfButtonProps = PressableProps &
  ColorProps & {
    disabled?: boolean
    enabled?: boolean
    onPress?: (event?: GestureResponderEvent) => void
    title?: string | ReactNode
    bold?: boolean
    variant?: CsfButtonType
    size?: CsfButtonSize
    isLoading?: boolean
    element?: React.ReactElement
    iconPosition?: CsfIconPosition
    children?: React.ReactNode
    destructive?: boolean
    width?: number | `${number}%`
    height?: number | `${number}%`
    icon?: CsfIcon
  }

const ButtonStyles = StyleSheet.create({
  common: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    flexDirection: 'row',
    borderRadius: 4,
    borderWidth: 0,
    minHeight: 48,
    minWidth: 44,
  },
  secondary: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  primary: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  link: {
    alignSelf: 'center',
  },
  /**
   * Like "link", but stripping 44x44 minimum size on touchable elements.
   * Use with caution.
   **/
  inlineLink: {
    alignSelf: 'center',
    minHeight: 0,
    minWidth: 0,
  },
  iconAndTextButton: {
    paddingHorizontal: 16,
  },
});

const defaultProps = {
  enabled: true,
  disabled: false,
  variant: 'primary' as CsfButtonType,
};

const CsfButton = (props: CsfButtonProps): JSX.Element => {
  const id = testID(props.testID);
  const { enabled, size, element, icon, title, variant, ...pressableProps } = {
    ...defaultProps,
    ...props,
  };

  const { colors } = useCsfColors();
  const isPrimary = variant === 'primary';
  const isDestructive = !!props.destructive;
  const buttonColor = (pressed: boolean): keyof CsfColorPalette =>
    pressed ? 'buttonActive' : props.bg || (isDestructive ? 'error' : 'button');
  const textColor = (pressed: boolean): keyof CsfColorPalette =>
    isPrimary ? 'light' : buttonColor(pressed);
  const hasIcon: boolean = !!props.element || !!props.icon;
  const iconEnd: boolean = hasIcon && props.iconPosition == 'end';
  const styles: ViewStyle[] = [ButtonStyles.common];
  styles.push(ButtonStyles[variant]);
  if (hasIcon && title && variant != 'inlineLink')
    styles.push(ButtonStyles.iconAndTextButton);

  const iconToRender = (pressed: boolean) =>
    element
      ? element
      : icon && (
        <CsfAppIcon
          icon={icon}
          color={textColor(pressed)}
          size={size || 'md'}
        />
      );

  const isEnabled = enabled && !props.disabled;
  //TODO:UA:20240924 find any users of "enabled" prop and remove/replace w/ disabled
  const accessibilityState = {
    disabled: !isEnabled,
    busy: props.isLoading,
  };

  return (
    <Pressable
      {...pressableProps}
      disabled={props.disabled || !enabled}
      accessibilityRole="button"
      accessibilityState={accessibilityState}
      accessibilityLabel={
        typeof props.title == 'string' ? props.title : undefined
      }>
      {({ pressed }) => (
        <CsfView
          testID={id()}
          borderColor={buttonColor(pressed)}
          bg={isPrimary ? buttonColor(pressed) : 'clear'}
          style={[styles, { opacity: isEnabled ? 1 : 0.5 }]}>
          {props.isLoading && (
            <CsfActivityIndicator
              color={colors[textColor(pressed)]}
              style={{ position: 'absolute' }}
            />
          )}
          <CsfView
            flexDirection="row"
            style={{ opacity: props.isLoading ? 0 : 1 }}
            align="center"
            testID={id('textView')}
            gap={8}>
            {hasIcon && !iconEnd && <View>{iconToRender(pressed)}</View>}
            {props.title &&
              (typeof props.title == 'string' ? (
                <CsfText
                  color={textColor(pressed)}
                  variant="button"
                  align="center"
                  testID={id('title')}>
                  {props.title}
                </CsfText>
              ) : (
                props.title
              ))}
            {props.children && <View>{props.children}</View>}
            {hasIcon && iconEnd && <View>{iconToRender(pressed)}</View>}
          </CsfView>
        </CsfView>
      )}
    </Pressable>
  );
};

export default CsfButton