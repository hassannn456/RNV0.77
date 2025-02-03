import React from 'react'
import { CsfTextInput, SharedTextInputProps } from './CsfTextInput'

export const CsfNumericInput: React.FC<SharedTextInputProps> = props => {
  return <CsfTextInput keyboardType="numeric" autoCorrect={false} {...props} />
}
