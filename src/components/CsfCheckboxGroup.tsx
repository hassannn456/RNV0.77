import React from 'react';
import { CsfCheckBox } from './CsfCheckbox';
import {
  CsfFormInputView,
  CsfFormInputViewProps,
} from './CsfForm/CsfFormInputView';
import CsfView from './CsfView';

export interface CsfCheckboxGroupProps extends CsfFormInputViewProps {
  /** options as an array */
  editable?: boolean
  options?:
  | { label: string | undefined; value: string | undefined }[]
  | undefined

  row?: boolean
  value?: string[] | number[]
  onChange: (item: string[] | number[]) => void
}

export const CsfCheckboxGroup: React.FC<CsfCheckboxGroupProps> = props => {
  const checkboxList =
    props.options?.map(option => {
      return {
        label: option.label,
        value: option.value,
        checked: props.value?.includes(option.value) || false,
      };
    }) || [];
  const toggleCheckbox = (item: string, checked: boolean) => {
    const newValue = props.value?.filter(value => value !== item);
    if (checked) { newValue?.push(item); }
    props?.onChange(newValue || []);
  };
  const editable = props.editable != false;
  const CheckboxesGroup = checkboxList.map((cb, index) => {
    return (
      <CsfCheckBox
        key={index}
        editable={!props.disabled && editable}
        checked={cb.checked}
        label={cb?.label}
        vertical={props.row}
        onChangeValue={() => {
          toggleCheckbox(cb.value, !cb.checked);
        }}
      />
    );
  });

  return (
    <CsfFormInputView
      label={props.label}
      hint={props.hint}
      errors={props.errors}
      gap={0}
      testID={props.testID}>
      {props.row ? (
        <CsfView flexDirection="row" justify="space-between">
          {CheckboxesGroup}
        </CsfView>
      ) : (
        CheckboxesGroup
      )}
    </CsfFormInputView>
  );
};
