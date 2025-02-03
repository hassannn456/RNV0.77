/* eslint-disable curly */
import React from 'react';
import { ViewProps } from 'react-native';
import { CsfView } from './CsfView';
import { CsfText, CsfTextVariant } from './CsfText';
import { testID } from './utils/testID';
import { DealerInfo } from '../../@types';

export interface AddressProps extends ViewProps {
  title?: string;
  address?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  textAlign?: 'right' | 'left' | 'center' | 'auto' | 'justify';
  textVariant?: CsfTextVariant;
  testID?: string;
}

/** Map service address to address object, if present. */
export const getServiceAddressFromDealer = (
  dealer: DealerInfo | null | undefined,
): AddressProps | null => {
  if (!dealer?.serviceAddress) {
    return null;
  }

  return {
    address: dealer.serviceAddress,
    city: dealer.serviceCity,
    state: dealer.serviceState,
    zip: dealer.serviceZip,
  };
};

export const MgaAddress: React.FC<AddressProps> = ({
  title,
  address,
  address2,
  city,
  state,
  zip,
  textAlign = 'left',
  textVariant = 'heading',
  testID: testId,
}) => {
  const id = testID(testId);

  if (!address) return null; // Return null early if address is not provided

  return (
    <CsfView testID={id()}>
      {title && (
        <CsfText align={textAlign} variant={textVariant} testID={id('title')}>
          {title}
        </CsfText>
      )}
      {address && (
        <CsfText align={textAlign} variant={textVariant} testID={id('address')}>
          {address}
        </CsfText>
      )}
      {address2 && (
        <CsfText align={textAlign} variant={textVariant} testID={id('address2')}>
          {address2}
        </CsfText>
      )}
      {city && state && zip && (
        <CsfText align={textAlign} variant={textVariant} testID={id('cityStateZip')}>
          {city}, {state} {zip}
        </CsfText>
      )}
    </CsfView>
  );
};

export default MgaAddress;
