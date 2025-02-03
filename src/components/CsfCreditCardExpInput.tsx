import React from 'react';
import CsfTextInput, { SharedTextInputProps } from './CsfTextInput';
import { testID } from './utils/testID';

const ccExpSeparator = ' / ';

// Extracts the month and year from the credit card expiration input
export const extractCCExp = (input: string | undefined): [string, string] => {
  if (!input) { return ['', '']; }
  const digits = input.replaceAll(/\D/g, '');
  return [digits.substring(0, 2) ?? '', digits.substring(2) ?? ''];
};

const CsfCreditCardExpInput: React.FC<SharedTextInputProps> = props => {
  const [month, year] = extractCCExp(props.value);
  const id = testID(props?.testID);
  return (
    <CsfTextInput
      autoCapitalize="none"
      autoCorrect={false}
      keyboardType="number-pad"
      placeholder="MM / YYYY"
      maxLength={6 + ccExpSeparator.length}
      {...props}
      onChangeText={text => {
        if (props.onChangeText) {
          props.onChangeText(text);
        }
      }}
      testID={id()}
      value={year ? month + ccExpSeparator + year : month}
    />
  );
};

export default CsfCreditCardExpInput;
