/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import CsfPressable, { CsfPressableStyles } from './CsfPressable';
import { useCsfColors } from './useCsfColors';
import {
  CsfCheckBoxBase as CsfCheckBoxBaseProps,
  CsfGroupValue,
} from './CsfCheckbox';
import { testID } from './utils/testID';
import CsfInputDetails from './CsfForm/CsfIInputDetails';
import CsfText from './CsfText';
import CsfView from './CsfView';

export interface CsfRadioButtonProps extends CsfCheckBoxBaseProps {
  onChangeValue?: (newValue: CsfGroupValue) => void
  /** Value of *this* radio button. Reported on tap. */
  value?: CsfGroupValue
  /** Current selected value of the group.
   *
   * To make radio groups work, all controls in a group read from one value. */
  selected?: CsfGroupValue
  disabled?: boolean
}

export interface CsfRadioButtonRingProps {
  checked: boolean
  testID?: string
}

const outerRingSize = 24;
const innerRingSize = 16;

export const CsfRadioButtonRing: React.FC<CsfRadioButtonRingProps> = props => {
  const { colors } = useCsfColors();
  const id = testID(props.testID);
  return (
    <CsfView
      testID={id()}
      style={{
        width: outerRingSize,
        height: outerRingSize,
        backgroundColor: colors.background,
        borderColor: colors.copySecondary,
        borderRadius: outerRingSize / 2,
        borderWidth: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      {props.checked && (
        <CsfView
          style={{
            width: innerRingSize,
            height: innerRingSize,
            backgroundColor: colors.button,
            borderRadius: innerRingSize / 2,
            borderWidth: 0,
          }}
          testID={id('inner')}
        />
      )}
    </CsfView>
  );
};

const CsfRadioButton: React.FC<CsfRadioButtonProps> = props => {
  const isChecked = !!props.value && props.value === props.selected;
  const id = testID(props.testID);
  const onPress = () => {
    if (props.value) {
      props.onChangeValue && props.onChangeValue(props.value);
    }
  };
  return (
    <CsfView
      justify="center"
      style={[
        !props.inline && CsfPressableStyles.minimumSize,
        { opacity: props.disabled ? 0.5 : 1 },
      ]}
      {...props}
      testID={id()}>
      <CsfPressable disabled={props.disabled} onPress={onPress}>
        <CsfView
          align="center"
          flexDirection={props.flexDirection ?? 'row'}
          gap={12}>
          <CsfRadioButtonRing checked={isChecked} testID={id('radio')} />
          {props.label && (
            <CsfText wrap testID={id('label')}>
              {props.label}
            </CsfText>
          )}
        </CsfView>
      </CsfPressable>
      <CsfInputDetails errors={props.errors} hint={props.hint} />
    </CsfView>
  );
};

export default CsfRadioButton;
