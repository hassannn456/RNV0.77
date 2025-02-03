import {isNumericPIN} from '../../utils/PIN';
import {checkEmail, checkUserEmail} from '../../utils/email';
import {validPhone} from '../../utils/phone';
import {checkAlphanumericSpace} from '../../utils/validate';
import {checkVIN} from '../../utils/vin';
import {CsfFormRules, CsfFormValue, CsfFormValues} from './CsfForm';

export type ValidatorFunction =
  | ((value: string, data?: CsfFormValues) => boolean)
  | ((value: number, data?: CsfFormValues) => boolean)
  | ((value: CsfFormValue, data?: CsfFormValues) => boolean);

const getValidatorFunction = (
  rule: keyof CsfFormRules,
  config: {value?: unknown; validator?: ValidatorFunction},
): ValidatorFunction | undefined => {
  if (!config) config = {};

  switch (rule) {
    //  TODO:UA:20240220 any inline functions here should be moved to utils and get tests.

    case 'required':
      return (v: CsfFormValue) => !!v;
    case 'alphanumericSpace':
      return (v: string) => checkAlphanumericSpace(v);
    case 'email':
      return (v: string) => checkEmail(v);
    case 'userEmail':
      return (v: string) => checkUserEmail(v);
    case 'numeric':
      return (v: string) => isNumericPIN(v);
    case 'phone':
      return (v: string) => validPhone(v);
    case 'regex':
      return (v: string) => ((config?.value as RegExp) || /(.*?)/).test(v);
    case 'min':
      return (v: string | number) => Number(v) >= Number(config.value);
    case 'max':
      return (v: string | number) => Number(v) <= Number(config.value);
    case 'minLength':
      return (v: string) => v.length >= Number(config.value);
    case 'maxLength':
      return (v: string) => v.length <= Number(config.value);
    case 'equalsField':
      return (v: string | number, data?: CsfFormValues) =>
        v === data?.[config.value as string];
    case 'notEqualsField':
      return (v: string | number, data?: CsfFormValues) =>
        v !== data?.[config.value as string];
    case 'equalsValue':
      return (v: string | number) => v === config.value;
    case 'notEqualsValue':
      return (v: string | number) => v !== config.value;
    case 'length':
      return (v?: string) => v?.length === config.value;
    case 'vin':
      return (v: string) => checkVIN(v);
    default:
      return typeof config.validator === 'function'
        ? config.validator
        : () => {
            console.warn(`no validator is configured for ${rule}`);
            return true;
          };
  }
};

export default getValidatorFunction;
