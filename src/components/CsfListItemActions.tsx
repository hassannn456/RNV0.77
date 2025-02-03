import React from 'react'
import {
  MgaModalSelectOption,
  MgaModalSelectOptions,
  promptSelect,
} from '../screens/MgaModalSelect'
import { CsfButton } from './CsfButton'
import { CsfIcon } from '../../core/res/assets/icons'
import { testID } from './utils/testID'

export type CsfListItemActionOption = MgaModalSelectOption & {
  handleSelect?: () => void
  icon?: CsfIcon
}
export type CsfListItemActionsProps = Omit<MgaModalSelectOptions, 'options'> & {
  options: (CsfListItemActionOption | undefined)[]
  trackingId?: string
  testID?: string
}

// TODO:UA:20240523 -- rename MgaListItemActions
export const CsfListItemActions: React.FC<CsfListItemActionsProps> = ({
  title,
  options,
  message,
  trackingId,
  ...props
}) => {
  const derivedTestID = testID(props?.testID || trackingId)
  return (
    <CsfButton
      variant="inlineLink"
      icon="More"
      testID={derivedTestID()}
      bg="copySecondary"
      onPress={async () => {
        const value = await promptSelect({
          trackingId: trackingId || 'PromptSelect',
          title: title,
          message: message,
          options: options
            .filter(option => !!option) // sometimes we might need to pass in empty options due to access rules
            .map(
              (option): MgaModalSelectOption => ({
                label: option?.label || '',
                value: option?.value || '',
                variant: option?.variant,
                icon: option?.icon,
                destructive: option?.destructive,
              }),
            ),
        })

        const result = options.find(
          option => option?.value && option.value === value,
        )
        if (result?.handleSelect) result.handleSelect()
        else console.warn(`no handler for ${value}`)
      }}
    />
  )
}
