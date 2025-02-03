/* eslint-disable react-native/no-inline-styles */
import React, { useState, ReactNode } from 'react';
import { TextInput, TextInputProps } from 'react-native';
import { useCsfColors } from './useCsfColors';
import CsfPressable, { CsfPressableStyles } from './CsfPressable';
import CsfView from './CsfView';
import CsfText from './CsfText';
import { hasErrors, wrapErrors } from './CsfForm/formUtils';
import { getEditable } from './utils/props';
import
CsfFormInputView, {
  CsfFormInputViewProps,
} from './CsfForm/CsfFormInputView';
import { formatPhone } from '../utils/phone';
import { testID } from './utils/testID';

const CsfInputTypes: { [key: string]: SharedTextInputProps } = {
  text: {
    keyboardType: 'default',
  },
  verificationCode: {
    autoComplete: 'off',
    keyboardType: 'number-pad',
    maxLength: 6,
  },
};

export const CsfInputBoxHeight = 48;

export interface SharedTextInputProps
  extends CsfFormInputViewProps,
  TextInputProps {
  leadingAccessory?: React.FC | ReactNode
  leadingAccessoryOnPress?: () => void
  trailingAccessory?: React.FC | ReactNode
  trailingAccessoryOnPress?: () => void
  /** Type of input. Default is 'text' */
  inputType?: keyof typeof CsfInputTypes
  /** Should control be interactive? Defaults to true.
   *
   * This is distinct from the `editable` property
   * because editable currently confers visual changes.
   * On iOS, this also handled with two properties
   * (isEnabled and isUserInteractionEnabled)
   */
  interactionEnabled?: boolean
  outsideLabel?: boolean
  showMaxLength?: boolean
  multiline?: boolean
  trackingId?: string
}

const CsfTextInput = (props: SharedTextInputProps): JSX.Element => {
  // TODO:VV:29052024: Add a trimOnBlur prop + handler
  const { colors } = useCsfColors();
  const [isFocused, setIsFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(0);
  const {
    label,
    errors: _errors, // See wrapError() below
    inputType: _inputType,
    leadingAccessory,
    leadingAccessoryOnPress,
    trailingAccessory,
    trailingAccessoryOnPress,
    outsideLabel,
    ...textInputProps
  } = props;
  const editable = getEditable(props);
  const inputType = _inputType ?? 'text';
  const interactionEnabled = props.interactionEnabled ?? true;
  const value = props.value ?? '';
  const errors = wrapErrors(props.errors);
  const errorsExist = hasErrors(errors);
  const textRingColor = errorsExist
    ? 'error'
    : isFocused
      ? 'inputBorderActive'
      : 'inputBorder';

  let placeholder = props.placeholder;
  if (!props.outsideLabel) { placeholder = props.label; }

  // if we have a tracking id, we can use it to generate a testID
  const derivedTestID = testID(props?.testID || props?.trackingId);
  return (
    <CsfFormInputView
      testID={derivedTestID()}
      hint={props.hint}
      errors={errors}
      label={outsideLabel ? label : undefined}>
      <CsfView pt={outsideLabel ? 0 : 8}>
        {!props.outsideLabel && (value || props.placeholder) && (
          <CsfView
            style={{
              position: 'absolute',
              top: 0,
              left: 8,
              paddingHorizontal: 4,
              zIndex: 3,
            }}
            bg="backgroundSecondary">
            <CsfText
              testID={derivedTestID('label')}
              disabledAppearance={!editable}
              variant="caption"
              color={
                errorsExist
                  ? 'error'
                  : isFocused
                    ? 'copyPrimary'
                    : 'copySecondary'
              }>
              {label}
            </CsfText>
          </CsfView>
        )}
        <CsfView
          borderRadius={4}
          borderWidth={1}
          bg="backgroundSecondary"
          borderColor={textRingColor}
          flexDirection="row"
          align="center"
          minHeight={CsfInputBoxHeight}
          pv={props.multiline ? 8 : 0}
          style={{ opacity: editable ? 1 : 0.5 }}>
          {leadingAccessory && (
            <CsfPressable
              testID={derivedTestID('leadingAccessory')}
              style={[
                CsfPressableStyles.centerContent,
                CsfPressableStyles.minimumSize,
              ]}
              onPress={leadingAccessoryOnPress}>
              {typeof leadingAccessory !== 'string' && leadingAccessory({})}
            </CsfPressable>
          )}
          <TextInput
            {...CsfInputTypes[inputType]}
            {...textInputProps}
            testID={derivedTestID('input')}
            placeholder={props.placeholder || placeholder}
            placeholderTextColor={colors.copySecondary}
            style={{
              fontFamily: 'Inter-Regular',
              color: value ? colors.copyPrimary : colors.copySecondary,
              fontSize: 14,
              justifyContent: 'center',
              flex: 1,
              paddingHorizontal: leadingAccessory ? 0 : 12,
              height: props.multiline ? inputHeight + 24 : 'auto',
            }}
            maxFontSizeMultiplier={1.2}
            onBlur={() => setIsFocused(false)}
            onFocus={() => setIsFocused(true)}
            editable={interactionEnabled && editable}
            value={value}
            multiline={props.multiline}
            onContentSizeChange={e => {
              setInputHeight(e.nativeEvent.contentSize.height);
            }}
          />
          {trailingAccessory && (
            <CsfPressable
              testID={derivedTestID('trailingAccessory')}
              style={[
                CsfPressableStyles.centerContent,
                CsfPressableStyles.minimumSize,
              ]}
              onPress={trailingAccessoryOnPress}>
              {typeof trailingAccessory === 'function' && trailingAccessory({})}
              {typeof trailingAccessory === 'object' && trailingAccessory}
            </CsfPressable>
          )}
        </CsfView>
      </CsfView>
    </CsfFormInputView>
  );
};



export default CsfTextInput;
