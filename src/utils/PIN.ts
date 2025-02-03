/** Determine in PIN is a simple PIN or a signed value connected with biometrics */
export const isPINBiometric = (pin: string | null | undefined): boolean => {
  if (!pin) {
    return false
  }
  return !pin.match(/^[0-9]{4}$/)
}

/** Determine in PIN is a valid Numeric PIN */
export const isNumericPIN = (pin: string | null | undefined): boolean => {
  if (!pin) {
    return false
  }
  return !!pin.match(/^[0-9\b]+$/)
}

/** Determine in PIN is a valid four-digit Numeric PIN */
export const isFourDigitNumericPIN = (
  pin: string | null | undefined,
): boolean => {
  if (!pin) {
    return false
  }
  return !!pin.match(/^[0-9\b]{4}$/)
}

/** Determine in PIN is a invalid deprecated encrypted PIN */
export const isDeprecatedPIN = (pin: string | null | undefined): boolean => {
  if (!pin || typeof pin !== 'string') {
    return false
  }
  return pin.length > 4
}
