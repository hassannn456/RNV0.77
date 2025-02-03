import React from 'react';
import
CsfFormInputView,
{
  CsfFormInputViewProps,
} from './CsfForm/CsfFormInputView';
import { CsfIcon } from '../../core/res/assets/icons';
import { testID } from './utils/testID';
import CsfRadioButton from './CsfRadioButton';

export type CsfGroupValue = string | number | undefined
export type CsfOption = {
  label: string
  value: CsfGroupValue
  icon?: CsfIcon
}
export interface CsfRadioGroupProps extends CsfFormInputViewProps {
  disabled?: boolean
  /** options as an array */
  options?: CsfOption[] | undefined
  value?: CsfGroupValue
  onChange?: (item: CsfGroupValue) => void
  testID?: string
}

const CsfRadioGroup: React.FC<CsfRadioGroupProps> = props => {
  const { disabled, options, value, onChange, ...formProps } = props;
  const id = testID(formProps.testID);
  return (
    <CsfFormInputView {...formProps} gap={0}>
      {options &&
        options.map((e, i) => (
          <CsfRadioButton
            key={i}
            label={e.label}
            value={e.value}
            disabled={disabled}
            onChangeValue={value => {
              onChange && onChange(value);
            }}
            testID={id(`radio-${i}`)}
            selected={value}
          />
        ))}
    </CsfFormInputView>
  );
};

export default CsfRadioGroup;
