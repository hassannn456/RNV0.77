/* eslint-disable eol-last */
import React from 'react';
import CsfTextInput, { SharedTextInputProps } from './CsfTextInput';

const CsfEmailInput: React.FC<SharedTextInputProps> = props => {
  return (
    <CsfTextInput
      autoComplete="email"
      autoCapitalize="none"
      autoCorrect={false}
      keyboardType="email-address"
      {...props}
    />
  );
};


export default CsfEmailInput;