/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable @typescript-eslint/no-shadow */
import React from 'react';
import { useCsfColors } from './useCsfColors';
import CsfText from './CsfText';
import CsfView, { CsfFlexDirection, CsfViewProps } from './CsfView';
import CsfAppIcon from './CsfAppIcon';
import CsfPressable, { CsfPressableStyles } from './CsfPressable';
import CsfInputDetails from './CsfForm/CsfIInputDetails';
import * as CsfIcons from '../../core/res/assets/icons';
import { testID } from './utils/testID';
import { AccessibilityRole } from 'react-native';

export type CsfGroupValue = string | number | undefined

/** Shared props between check boxes, radio buttons, and toggles. */
export interface CsfCheckBoxBase extends CsfViewProps {
  label?: CsfGroupValue
  hint?: string
  /** Current state of checkbox. Default value is false. */
  checked?: boolean
  /** If false, checkbox is not editable. Default value is true. */
  editable?: boolean
  /** Disable minimum 44px x 44px pressable area. Defaults to false. Use when other controls provide spacing. */
  inline?: boolean
  errors?: false | string | string[]
  vertical?: boolean
  /** Custom icon for check indicator. Leave undefined for default checkmark. */
  customIcon?: undefined | keyof typeof CsfIcons
}

export const CsfCheckBoxDefaultProps = {
  checked: false,
  editable: true,
  flexDirection: 'row' as CsfFlexDirection,
  inline: false,
};

export default interface CsfCheckBoxProps extends CsfCheckBoxBase {
  onChangeValue?: (newValue: boolean) => void
};

export const CsfCheckBox = (props: CsfCheckBoxProps): JSX.Element => {
  const { colors } = useCsfColors();
  const {
    checked,
    customIcon: checkIcon,
    editable,
    errors,
    hint,
    inline,
    label,
    onChangeValue,
    vertical,
    ...viewProps
  } = {
    ...CsfCheckBoxDefaultProps,
    ...props,
  };
  const backgroundColor: string | undefined = checked
    ? colors.button
    : undefined;

  const borderColor = checked ? colors.button : colors.copySecondary;

  const id = testID(props.testID);
  const image = checked ? (
    <CsfAppIcon icon={checkIcon ?? 'Success'} color="light" />
  ) : undefined;
  const onPress = editable
    ? () => {
      onChangeValue ? onChangeValue(!checked) : undefined;
    }
    : undefined;

  const CheckBox: React.FC<{ testID: string }> = props => (
    <CsfView
      testID={testID(props.testID)()}
      style={{
        alignItems: 'center',
        borderWidth: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        width: 24,
        height: 24,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
      }}>
      {image}
    </CsfView>
  );

  const accessibilityProps = {
    accessibilityRole: 'checkbox' as AccessibilityRole,
    accessibilityState: { checked },
    accessibilityLabel: props.label as string | undefined,
  };

  return vertical ? (
    <CsfView
      justify="center"
      {...props}
      style={{ opacity: editable ? 1 : 0.5 }}>
      <CsfPressable
        {...accessibilityProps}
        onPress={onPress}
        style={[CsfPressableStyles.minimumSize, { justifyContent: 'center' }]}>
        <CsfView
          justify="center"
          align="center"
          gap={8}
          flexDirection="column"
          testID={id()}>
          <CheckBox testID={id('checkbox')} />
          {label && (
            <CsfText wrap testID={id('label')}>
              {label}
            </CsfText>
          )}
          {props.children && <CsfView>{props.children}</CsfView>}
        </CsfView>
      </CsfPressable>
      <CsfInputDetails errors={errors} hint={hint} testID={id('details')} />
    </CsfView>
  ) : (
    <CsfView
      justify="center"
      {...props}
      width={'100%'}
      style={{ opacity: editable ? 1 : 0.5 }}>
      <CsfPressable
        {...accessibilityProps}
        onPress={onPress}
        style={[
          !inline && CsfPressableStyles.minimumSize,
          { justifyContent: 'center' },
        ]}>
        <CsfView
          justify="center"
          align="flex-start"
          gap={12}
          {...viewProps}
          testID={id()}>
          <CheckBox />
          {label && (
            <CsfText wrap testID={id('label')}>
              {label}
            </CsfText>
          )}
          {props.children && <CsfView>{props.children}</CsfView>}
        </CsfView>
      </CsfPressable>
      <CsfInputDetails errors={errors} hint={hint} testID={id('details')} />
    </CsfView>
  );
};
