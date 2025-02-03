/* eslint-disable eqeqeq */
import {CsfFormValues} from './CsfForm';

export type CsfFormRule = {
  // all rules have a message property
  message?: string;
};

export type CsfFormRuleAny = CsfFormRule & {
  // expects comparable by value for 'value'
  value?: boolean | number | string;
};
export type CsfFormRuleString = CsfFormRule & {
  // expects a string for 'value'
  value?: string;
};

export type CsfFormRuleNumber = CsfFormRule & {
  // expects value to be a  number
  value?: number;
};

export type CsfFormRuleRegex = CsfFormRule & {
  // expects a regex
  value?: RegExp;
};

export type CsfFormRuleCustom = CsfFormRuleAny & {
  validator?: // TODO:UA:20240220 maybe make this return a string
  | ((item: number) => boolean)
    | ((item: string) => boolean)
    | ((item: string | number | undefined) => boolean)
    | ((item: string | number | undefined, data?: CsfFormValues) => boolean);
};

export const wrapErrors = (error?: string | string[]): string[] => {
  return typeof error == 'string' ? [error] : error ?? [];
};

export const hasErrors = (errors?: string[]): boolean =>
  errors ? errors.length > 0 : false;
