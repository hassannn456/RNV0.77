import React from 'react'
import { formatPhone } from '../utils/phone'
import { CsfButtonProps, CsfButton } from './CsfButton'
import { mgaOpenURL } from './utils/linking'
import MgaButton from './MgaButton'
import { testID } from './utils/testID'

export interface PhoneNumberProps extends CsfButtonProps {
  phone: string
}
export const CsfPhoneNumber: React.FC<PhoneNumberProps> = props => {
  return (
    <CsfButton
      onPress={() => mgaOpenURL(`tel:${props.phone}`)}
      title={formatPhone(props.phone)}
      variant="link"
      {...props}
    />
  )
}

export const MgaPhoneNumber: React.FC<
  PhoneNumberProps & { trackingId?: string }
> = props => {
  const derivedTestID = testID(props.trackingId || props.testID)
  return (
    <MgaButton
      onPress={() => mgaOpenURL(`tel:${props.phone}`)}
      title={formatPhone(props.phone)}
      variant="link"
      testID={derivedTestID()}
      {...props}
      trackingVars={{ e8: 1 }}
    />
  )
}
