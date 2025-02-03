/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import CsfTextInput, { SharedTextInputProps } from './CsfTextInput';
import { formatCC, getIssuer } from '../utils/cc';
import Amex from '../../content/svg/amex-card.svg';
import Discover from '../../content/svg/discover-card.svg';
import MasterCard from '../../content/svg/mastercard.svg';
import Visa from '../../content/svg/visa-card.svg';
import { getEditable } from './utils/props';

const CsfCreditCardNumberInput: React.FC<SharedTextInputProps> = props => {
  const editable = getEditable(props);
  return (
    <CsfTextInput
      autoComplete="cc-number"
      autoCapitalize="none"
      autoCorrect={false}
      keyboardType="number-pad"
      maxLength={19}
      trailingAccessory={() => {
        switch (getIssuer(props.value)) {
          case 'amex':
            return <Amex width={32} height={32} />;
          case 'discover':
            return <Discover width={32} height={32} />;
          case 'mastercard':
            return <MasterCard width={32} height={32} />;
          case 'visa':
            return <Visa width={32} height={32} />;
          default:
            return null;
        }
      }}
      {...props}
      value={editable ? formatCC(props.value) : props.value}
    />
  );
};

// Default export for CsfCreditCardNumberInput
export default CsfCreditCardNumberInput;
