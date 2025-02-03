/* eslint-disable react-native/no-inline-styles */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react/no-unstable-nested-components */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  useForm,
  Controller,
  ResolverResult,
  UseFormSetValue,
  UseFormGetValues,
  FieldValues,
} from 'react-hook-form';
import CsfTextInput from '../CsfTextInput';
import CsfRadioGroup from '../CsfRadioGroup';
import { CsfCheckboxGroup } from '../CsfCheckboxGroup';
import { CsfCheckBox } from '../CsfCheckbox';
import CsfButton from '../CsfButton';
import CsfPassword from '../CsfPassword';
import CsfEmailInput from '../CsfEmailInput';
import {
  CsfFormRule,
  CsfFormRuleAny,
  CsfFormRuleCustom,
  CsfFormRuleNumber,
  CsfFormRuleRegex,
  CsfFormRuleString,
} from './formUtils';
import { CsfNumericInput } from '../CsfNumericInput';
import CsfCard from '../CsfCard';
import CsfView, { CsfViewProps } from '../CsfView';
import { testID } from '../utils/testID';
import { Text } from 'react-native';
import CsfDatePicker from '../CsfDatePicker';
import CsfSelect from '../CsfSelect';
import CsfToggle from '../CsfToggle';
import getValidatorFunction from './getValidatorFunction';
import CsfPhoneInput from '../CsfPhoneInput';

export type CsfInputControlTypes =
  | 'email'
  | 'numeric'
  | 'date'
  | 'text'
  | 'radio'
  | 'select'
  | 'checkbox'
  | 'checkboxGroup'
  | 'password'
  | 'toggle'
  | 'phone';

// sometimes the rules need to be a function so we can do stuff to the form values from the field definition
export type CsfFormRules = {
  required?: CsfFormRule;
  email?: CsfFormRule;
  userEmail?: CsfFormRule;
  phone?: CsfFormRule;
  regex?: CsfFormRuleRegex;
  min?: CsfFormRuleNumber;
  max?: CsfFormRuleNumber;
  minLength?: CsfFormRuleNumber;
  maxLength?: CsfFormRuleNumber;
  length?: CsfFormRuleNumber;
  alphanumericSpace?: CsfFormRule;
  equalsValue?: CsfFormRuleAny;
  equalsField?: CsfFormRuleString;
  notEqualsValue?: CsfFormRuleAny;
  notEqualsField?: CsfFormRuleString;
  vin?: CsfFormRule;
  numeric?: CsfFormRule;
  validate?: CsfFormRuleCustom;
  // TODO:UA:20240220 accept array for 'validate' if multiple custom validations are needed OR handle string return from custom validator
};

export interface CsfFormControllerProps {
  name: string;
  value?: string | boolean | string[] | number[] | Date;
  label?: string | undefined;
  type?: CsfInputControlTypes | undefined;
  hint?: string | undefined;
  placeholder?: string | undefined;
  error?: string | undefined;
  disabled?: boolean;
  component?: React.FC;
  componentProps?: Record<string, unknown> | undefined;
  options?:
  | {
    label: string | undefined;
    value: string | undefined;
  }[]
  | undefined;

  rules?: CsfFormRules;
  meta?: string | string[]; // used for filtering form fields
  testID?: string;
}

export type CsfFormItemProps = CsfFormControllerProps & {
  onChange?: (item: string | boolean | string[] | number[] | Date) => void;
};

export type CsfFormFieldList = CsfFormControllerProps[];

export type CsfFormFieldGroup = {
  fieldGroupTitle: string;
  fields: CsfFormFieldList;
};

export type CsfFormFieldFunctionPayload = {
  setValue: UseFormSetValue<FieldValues>;
  getValues: UseFormGetValues<FieldValues>;
};
export type CsfFormValue =
  | string
  | number
  | Date
  | string[]
  | number[]
  | boolean
  | null // TODO:UA:20140216 ideally we don't need this but just adding it bc some validators accept null value
  | undefined;
export type CsfFormValues = Record<string, CsfFormValue>;
export interface CsfFormProps
  extends Pick<CsfViewProps, 'children' | 'testID'> {
  cancelLabel?: string;
  initialValues?: CsfFormValues;
  onSubmit: ((data: any) => void) | ((data: any) => Promise<void>);
  onCancel?: () => void;
  fields:
  | CsfFormFieldList
  | CsfFormFieldGroup[]
  | ((
    c: CsfFormFieldFunctionPayload,
  ) => CsfFormFieldList | CsfFormFieldGroup[]);
  rules?: CsfFormRules;
  isLoading?: boolean;
  disabled?: boolean;
  submitLabel?: string | undefined;
  title?: string;
  subtitle?: string;
  trackingId?: string;
}

interface ControllerProps {
  item: CsfFormControllerProps;
  control: object;
  errors: Array<{ message: string }>;
}

export interface DetailsProps {
  error?: string;
  hint?: string;
}

export const formatLabel = (rest: CsfFormControllerProps): string => {
  return rest.rules?.required && rest.label ? `${rest.label} * ` : rest.label;
};
const CsfFormItem = (props: CsfFormItemProps): JSX.Element => {
  const { value, onChange, type, ...rest } = props;

  // if (rest?.component) {
  //   const ComponentToRender = rest.component;
  //   return (
  //     <CsfView>
  //       <ComponentToRender
  //         {...props}
  //         label={formatLabel(rest)}
  //         {...rest.componentProps}
  //         errors={rest?.error}
  //         value={value}
  //       />
  //     </CsfView>
  //   );
  // }

  // TODO: 05/02/2023: PhoneNumber, PinPad, Slider, Autocomplete
  const component = (type: string | undefined) => {
    switch (type) {
      case 'email':
        return (
          <CsfEmailInput
            {...rest}
            {...rest.componentProps}
            onChangeText={value => onChange(value)}
            value={value?.toString()}
            errors={rest?.error}
            maxLength={50}
            editable={!props.disabled}
            label={formatLabel(rest)}
          />
        );
      case 'numeric':
        return (
          <CsfNumericInput
            {...rest}
            {...rest.componentProps}
            disabled={rest?.disabled}
            onChangeText={value => onChange(value)}
            value={value?.toString()}
            errors={rest?.error}
            label={formatLabel(rest)}
          />
        );
      case 'password':
        return (
          <CsfPassword
            {...rest}
            {...rest.componentProps}
            onChangeText={value => onChange(value)}
            value={value?.toString()}
            errors={rest?.error}
            label={formatLabel(rest)}
          />
        );
      case 'radio':
        return (
          <CsfRadioGroup
            {...rest}
            {...rest.componentProps}
            options={rest?.options}
            value={value?.toString()}
            onChange={value => onChange(value)}
            errors={rest?.error}
            label={formatLabel(rest)}
          />
        );
      case 'select':
        return (
          <CsfSelect
            {...rest}
            {...rest.componentProps}
            options={rest?.options}
            onSelect={(data: string | boolean | string[] | number[] | Date) => {
              rest?.componentProps?.onChange &&
                rest.componentProps.onChange(data);
              onChange(data);
            }}
            value={value?.toString()}
            errors={rest?.error}
            label={formatLabel(rest)}
          />
        );
      case 'text':
        return (
          <CsfTextInput
            {...rest}
            {...rest.componentProps}
            onChangeText={value => onChange(value)}
            value={value?.toString()}
            errors={rest?.error}
            label={formatLabel(rest)}
          />
        );

      case 'phone':
        return (
          <CsfPhoneInput
            {...rest}
            {...rest.componentProps}
            onChangeText={value => onChange(value)}
            value={value?.toString()}
            errors={rest?.error}
            label={formatLabel(rest)}
          />
        );

      case 'date':
        return (
          <CsfDatePicker
            {...rest}
            {...rest.componentProps}
            onChangeDate={(value: string | boolean | string[] | number[] | Date) => onChange(value)}
            date={value as Date | undefined}
            errors={rest?.error}
            inputType="date"
            label={formatLabel(rest)}
          />
        );
      case 'toggle':
        return (
          <CsfToggle
            {...rest}
            {...rest.componentProps}
            onChangeValue={(e: string | boolean | string[] | number[] | Date) => {
              // TODO:20220721:AG this sort of seems flakey, maybe should establish generic handlers for predefined components.
              if (rest?.componentProps?.onChangeValue) {
                rest.componentProps.onChangeValue(e);
              }
              onChange(e);
            }}
            checked={!!value}
            editable={!props.disabled}
            errors={rest?.error}
            label={formatLabel(rest)}
          />
        );

      case 'checkbox':
        return (
          <CsfCheckBox
            {...rest}
            {...rest.componentProps}
            onChangeValue={e => {
              // TODO:20220721:AG this sort of seems flakey, maybe should establish generic handlers for predefined components.
              if (rest?.componentProps?.onChangeValue) {
                rest.componentProps.onChangeValue(e);
              }
              onChange(e);
            }}
            checked={!!value}
            editable={!rest.disabled}
            errors={rest?.error}
            label={formatLabel(rest)}
          />
        );

      case 'checkboxGroup':
        return (
          <CsfCheckboxGroup
            {...rest}
            {...rest.componentProps}
            options={rest?.options}
            value={value}
            onChange={value => onChange(value)}
            errors={rest?.error}
            label={formatLabel(rest)}
          />
        );
      default:
        console.warn('unhandled input type in CsfForm: ', props.name, type);
        return (
          <CsfTextInput
            {...rest}
            {...rest.componentProps}
            onChangeText={value => onChange(value)}
            value={value?.toString()}
            errors={rest?.error}
            label={formatLabel(rest)}
          />
        );
    }
  };

  return <CsfView>{component(type)}</CsfView>;

};

const getError = (
  name: string,
  errors: Array<{ message: string }>,
): { message: string } => errors[name as keyof object] || undefined;

const ControllerItem = ({
  item,
  errors,
  control,
}: ControllerProps): JSX.Element => {
  const { name, value } = item;
  const controllerError = getError(name, errors);
  const hasError = controllerError !== undefined;
  const dynamicError = controllerError?.message || 'Invalid';
  const errorMessage = hasError ? dynamicError : undefined;
  return (
    <Controller
      name={name}
      key={name}
      control={control}
      rules={item?.rules}
      defaultValue={value}
      render={({ field }) => (
        <CsfFormItem
          {...item}
          name={name || ''}
          value={field.value}
          error={errorMessage}
          onChange={field.onChange}
        />
      )}
    />
  );
};

export type RefObjType = { current?: unknown };

const CsfForm = (props: CsfFormProps): JSX.Element => {
  const [previousValues, setPreviousValues] = useState({});
  const previousValuesRef = useRef<RefObjType>({
    current: {},
  });
  useEffect(() => {
    previousValuesRef.current = { ...previousValues };
  }, [previousValues]);

  const id = testID(props.trackingId || props.testID);
  type ResolverConfig = {
    previousValuesRef: RefObjType;
    setPreviousValues: (data: object) => void;
    rules: CsfFormRules;
  };

  type ResolverError = {
    message: string;
  };

  const resolver =
    (config: ResolverConfig) =>
      async (data: object, _context: object): Promise<ResolverResult> => {
        const resolverErrors: Record<string, ResolverError> = {};

        // TODO:UA:061223 update eslint rules, we should be able to await sync values when necessary.
        // TODO:UA:061223 implement RHF context provider so we can get errors from _context and import from ./resolver.ts
        // disable eslint temporarily in here til i figure out how to allow awaiting sync

        await true;

        Object.entries(data).forEach(([key, value]) => {
          if (config.rules[key]) {
            const rules = Object.entries(config.rules[key]).sort((a, _b) => {
              return a[0] != 'required' ? -1 : 0;
            });

            rules.forEach(([rule, validatorConfig]) => {
              // grab validator function
              const validatorFunction = getValidatorFunction(
                rule as keyof CsfFormRules,
                validatorConfig,
              );

              if (!validatorFunction(value, data)) {
                resolverErrors[key] = {
                  message: validatorConfig.message || 'Invalid',
                };
              }
            });
          }
        });
        config.setPreviousValues({ ...data });
        return {
          values: { ...data },
          errors: resolverErrors,
        };
      };

  // sometimes the fields prop is a function that returns a field list
  const fieldsAreFunction = typeof props.fields === 'function';

  const mergedRules = useMemo<object>(() => {
    // TODO:UA:060823 merge rules per item, rather than overwrite item
    // TODO:UA:060823 add implicit validations ie email, numeric for input types

    // reduce field list to object
    const ruleFields: CsfFormFieldList = fieldsAreFunction
      ? props?.fields({}) // we can pass and empty object to fields function because we don't care about getting/setting values here
      : props.fields;
    const fieldRulesObject = ruleFields.reduce((acc, field) => {
      const { name, rules } = field;
      return field.rules ? { ...acc, [name]: { ...rules } } : { ...acc };
    }, {});

    // merge from rules prop
    return props.rules
      ? { ...fieldRulesObject, ...props.rules }
      : fieldRulesObject;
  }, [props.fields, props.rules]);

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isValidating },
  } = useForm({
    defaultValues: props.initialValues,
    resolver: resolver({
      previousValuesRef,
      setPreviousValues,
      rules: mergedRules,
    }),
  });

  const fields: CsfFormFieldList | CsfFormFieldGroup[] = fieldsAreFunction
    ? props.fields({ setValue, getValues })
    : props.fields;

  //  if fields are a function,
  const newFields: CsfFormControllerProps[] | CsfFormFieldGroup[] =
    typeof fields === 'function' ? fields({ setValue, getValues }) : fields;

  const ActionButtons = () => {
    return (
      <CsfView gap={16}>
        <CsfButton
          variant="primary"
          isLoading={props.isLoading || isValidating}
          disabled={props.disabled || props.isLoading || isValidating}
          title={props.submitLabel || 'Submit'}
          onPress={async () => {
            await handleSubmit((data: object) => props.onSubmit(data))();
          }}
          testID={id('submit')}
        />

        {props.onCancel && (
          <CsfButton
            variant="link"
            title={props.cancelLabel || 'Cancel'}
            disabled={props.disabled || props.isLoading || isValidating}
            onPress={() => {
              props.onCancel && props?.onCancel();
            }}
            testID={id('cancel')}
          />
        )}
      </CsfView>
    );
  };

  const disabled = props.isLoading || props.disabled;

  const mapFields = (fields: CsfFormItemProps[]) => {
    return fields.map((item, index) => {
      const itemProps = {
        ...item,
        disabled: disabled || item.disabled,
        testID: id(item.name),
      };

      return (
        <ControllerItem
          item={itemProps}
          errors={errors}
          control={control}
          key={index}
        />
      );
    });
  };


  return newFields.length > 0 ? (
    <CsfView gap={24}>
      {newFields[0]?.fieldGroupTitle ? (
        <CsfView gap={16}>
          <Text style={{ color: 'red' }}>Form</Text>
          {newFields.map((fieldGroup, i) => (
            <CsfCard title={fieldGroup.fieldGroupTitle} key={i}>
              <CsfView gap={8}>{mapFields(fieldGroup.fields)}</CsfView>
            </CsfCard>
          ))}
        </CsfView>
      ) : (
        <CsfCard title={props.title} subtitle={props.subtitle}>
          <CsfView gap={8}>{mapFields(newFields)}</CsfView>
        </CsfCard>
      )}
      <ActionButtons />
    </CsfView>
  ) : (
    <>{props.children}</>
  );
};

export default CsfForm;
