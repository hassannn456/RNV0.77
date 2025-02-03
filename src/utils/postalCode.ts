import { CountryCodes, getCountryCode } from './regions'

const postalCodeValidators = {
  [CountryCodes.canada]: (zip: string) =>
    /[a-zA-Z][0-9][a-zA-Z](-| |)[0-9][a-zA-Z][0-9]/.test(zip),
  [CountryCodes.usa]: (zip: string) => /\d{5}-\d{4}$|^\d{5}$/.test(zip),
}

/** Check postal code based on country */
export const isValidPostalCode = (
  countryCode?: string | null | undefined,
  zip?: string,
): boolean => {
  if (!zip) return false
  const cc = countryCode ?? getCountryCode()
  if (!cc) return false
  if (!zip) return false
  const check = postalCodeValidators[cc]
  if (!check) return false
  return check(zip)
}
