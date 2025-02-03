/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react'
import { useTranslation } from 'react-i18next'
import { CsfFormInputViewProps } from './CsfForm/CsfFormInputView'
import { CsfCheckboxGroup } from './CsfCheckboxGroup'

interface MgaDayPickerProps extends CsfFormInputViewProps {
  daysValue?: number[]
  canAddDays?: boolean
  editable?: boolean
  onChangeDays?: (days: number[]) => void
  //  label?: string
}

const MgaDayPicker: React.FC<MgaDayPickerProps> = props => {
  const { t } = useTranslation()
  const {
    canAddDays: __canAddDays,
    daysValue: __daysValue,
    editable: __editable,
    onChangeDays,
  } = props
  const daysValue = __daysValue ?? []
  const _canAddDays = __canAddDays ?? true
  const editable = __editable ?? true
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

  return (
    <CsfCheckboxGroup
      errors={props.errors}
      row
      label={props.label}
      options={days.map((day, i) => ({
        label: t(`common:days.${day}`),
        value: i,
      }))}
      editable={editable}
      value={daysValue}
      testID={props.testID}
      onChange={v => {
        onChangeDays && onChangeDays(v)
      }}
    />
  )
}

export default MgaDayPicker
