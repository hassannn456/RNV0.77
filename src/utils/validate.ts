// cSpell:ignore maxlength, typecheck, pluggable
import { checkEmail } from './email'
import { checkPassword } from './password'
import { validPhone } from './phone'
import { checkVIN } from './vin'

export const reAlphanumericNoQuotes = /^[A-Za-z0-9.@_&\-\s]+$/i
export const reAlphanumericSpace = /^[A-Za-z0-9\u00C0-\u00FF.@_-\s]+$/i
export const reAlphanumericSpaceWithQuotesAmp = /^[A-Za-z0-9.@_'"‘’”“&\-\s]+$/i
export const reDigits = /^[\d]*$/i

export interface CustomValidator {
  [key: string]: () => boolean
}

/** List of supported rules. All fields are optional. Undefined causes rule to be ignored. */
export interface ValidationRuleList {
  alphanumericNoQuotes?: boolean
  alphanumericSpace?: boolean
  alphanumericSpaceWithQuotesAmp?: boolean
  /** Set keys to map to names of errors. Return true from error function to show error. */
  custom?: CustomValidator
  digits?: boolean
  email?: boolean
  equalTo?: unknown
  required?: boolean
  maxlength?: number
  minlength?: number
  noSpaceStart?: boolean
  noSpaceEnd?: boolean
  nameAlreadyExists?: string[]
  password?: boolean
  phone?: boolean
  vin?: boolean
}
/** Ex: "required" or {required: true, maxLength: 4} */
export type ValidationRule = keyof ValidationRuleList | ValidationRuleList
/** Ex: [] (no errors) or ["required", "minlength"] */
export type ValidationErrorList = Array<keyof ValidationRuleList>
/** Ex: {} or { name: ['maxlength'], vin: ['vin'] } */
export type ValidationResult<T> = Partial<Record<keyof T, ValidationErrorList>>
/** Port of jQuery's $(form).validate()
 *
 * This is designed to make it easier to port MySubaru's use of validation to React.
 * Changes include:
 * - validate() is now strongly-typed and generic (on type of object).
 *   Type signature is a little hairy, but needed for typecheck to work.
 * - validate() is no longer pluggable.
 *   In lieu of validator.addMethod:
 *      1. Use the custom property to add bespoke rules.
 *      2. Extend this file with new cases if custom results in code duplication. */
export const validate = <T extends Partial<Record<keyof T, unknown>>>(
  object: T,
  rules: Partial<Record<keyof T, ValidationRule>>,
  transformFn?: (key: string, rule: ValidationRule) => string,
): ValidationResult<T> => {
  const output: ValidationResult<T> = {}
  for (const k of Object.keys(rules)) {
    const key = k as keyof T
    const rule = rules[key]
    if (rule) {
      const errors: ValidationErrorList = []
      const value = object[key] ?? ''
      const string = value.toString()
      const ruleObject: ValidationRuleList =
        typeof rule === 'string' ? { [rule]: true } : rule
      if (
        ruleObject.alphanumericNoQuotes &&
        string &&
        !reAlphanumericNoQuotes.test(string)
      ) {
        errors.push('alphanumericNoQuotes')
      }
      if (
        ruleObject.alphanumericSpace &&
        string &&
        !reAlphanumericSpace.test(string)
      ) {
        errors.push('alphanumericSpace')
      }
      if (
        ruleObject.alphanumericSpaceWithQuotesAmp &&
        string &&
        !reAlphanumericSpaceWithQuotesAmp.test(string)
      ) {
        errors.push('alphanumericSpaceWithQuotesAmp')
      }
      if (ruleObject.custom) {
        const keys = Object.keys(ruleObject.custom)
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i]
          if (ruleObject.custom[keys[i]](object)) {
            errors.push(key)
          }
        }
      }
      if (ruleObject.digits && string && !reDigits.test(string)) {
        errors.push('digits')
      }
      if (ruleObject.email && !checkEmail(string)) {
        errors.push('email')
      }
      //Fix this issue
      if (ruleObject.password && !checkPassword(string)) {
        errors.push('password')
      }
      if (ruleObject.phone && !validPhone(string)) {
        errors.push('phone')
      }
      if (ruleObject.required && !value) {
        errors.push('required')
      }
      if (ruleObject.maxlength && string.length > ruleObject.maxlength) {
        errors.push('maxlength')
      }
      if (ruleObject.minlength && string.length < ruleObject.minlength) {
        errors.push('minlength')
      }
      if (
        ruleObject.nameAlreadyExists &&
        ruleObject.nameAlreadyExists.includes(string)
      ) {
        errors.push('nameAlreadyExists')
      }
      if (ruleObject.noSpaceStart && string.trimStart() != string) {
        errors.push('noSpaceStart')
      }
      if (ruleObject.noSpaceEnd && string.trimEnd() != string) {
        errors.push('noSpaceEnd')
      }
      if (ruleObject.equalTo && value !== ruleObject.equalTo) {
        errors.push('equalTo')
      }
      if (ruleObject.vin && value && !checkVIN(string)) {
        errors.push('vin')
      }
      if (errors.length > 0) {
        if (transformFn) {
          output[key] = errors.map(e => transformFn(key, e))
        } else {
          output[key] = errors
        }
      }
    }
  }
  return output
}

/** Inspect a ValidationResult for the presence of errors */
export const hasErrors = <T>(
  validationResult: ValidationResult<T>,
): boolean => {
  return Object.keys(validationResult).length > 0
}

/** Translate a validation result within a translation function and optional context */
export const translateErrors = (
  errorList: ValidationErrorList | undefined,
  translationFn: (key: string) => string,
  ...contexts: string[]
): string | undefined => {
  if (!errorList) {
    return undefined
  }
  return errorList
    .map(e => {
      for (let i = 0; i < contexts.length; i++) {
        const context = contexts[i]
        const value = translationFn(`${context}.${e}`)
        if (value) return value
      }
    })
    .join('\n')
}

export const checkAlphanumericSpace = (v: string): boolean =>
  /^[A-Za-z0-9\u00C0-\u00FF.@_-\s]+$/i.test(v)

export const checkAlphabetSpace = (v: string): boolean =>
  /^[A-Za-z][A-Za-z\s]*$/.test(v)
