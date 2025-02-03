const {
  isPINBiometric,
  isNumericPIN,
  isFourDigitNumericPIN,
  isDeprecatedPIN,
} = require('./PIN')

it('Checks standard VIN', () => {
  expect(isPINBiometric('1234')).toBe(false)
  expect(isPINBiometric('hRbQb+Imhldlpb108iqSZIKHASMLRkTNf9Rz/ltUhJ0=')).toBe(
    true,
  )
})

it('Checks Numeric PIN', () => {
  expect(isNumericPIN('1234')).toBe(true)
  expect(isNumericPIN('123.')).toBe(false)
})

it('Checks Four Digit Numeric PIN', () => {
  expect(isFourDigitNumericPIN('1234')).toBe(true)
  expect(isFourDigitNumericPIN('hello')).toBe(false)
  expect(isFourDigitNumericPIN('12345')).toBe(false)
})

it('Checks Deprecated Encrypted PIN', () => {
  expect(isDeprecatedPIN('')).toBe(false)
  expect(isDeprecatedPIN('/CVTtTarCUS+vwarZ/1UYQ==')).toBe(true)
  expect(isDeprecatedPIN('1234')).toBe(false)
})
