import { CountryCodes } from './regions'
import { isValidPostalCode } from './postalCode'

// USA Zipcode Validation

it('Rejects Blank US Zipcode', () => {
  expect(isValidPostalCode(CountryCodes.usa, '')).toBe(false)
  expect(isValidPostalCode(CountryCodes.usa, '    ')).toBe(false)
})

it('Rejects Invalid US Zipcode', () => {
  // Invalid format
  expect(isValidPostalCode(CountryCodes.usa, '12300003')).toBe(false)
  expect(isValidPostalCode(CountryCodes.usa, '123')).toBe(false)
  //  Zipcode Too long including "-"
  expect(
    isValidPostalCode(
      CountryCodes.usa,
      '12342-44181222222222211111111111111-23445',
    ),
  ).toBe(false)
})

it('Accepts Valid US Zipcode', () => {
  // Normal Zipcode
  expect(isValidPostalCode(CountryCodes.usa, '94086')).toBe(true)
  // Zipcode including "-"
  expect(isValidPostalCode(CountryCodes.usa, '08865-4418')).toBe(true)
})

// Canadian Zipcode Validation

it('Rejects Blank CA Zipcode', () => {
  expect(isValidPostalCode(CountryCodes.canada, '')).toBe(false)
  expect(isValidPostalCode(CountryCodes.canada, '    ')).toBe(false)
})

it('Rejects Invalid CA Zipcode', () => {
  // Invalid format
  expect(isValidPostalCode(CountryCodes.canada, '12222')).toBe(false)
  expect(isValidPostalCode(CountryCodes.canada, '08865-4418')).toBe(false)
  //  Zipcode Too long including "-"
  expect(
    isValidPostalCode(CountryCodes.canada, '08865-4418-112223333333'),
  ).toBe(false)
})

it('Accepts Valid CA Zipcode', () => {
  // Normal Zipcode
  expect(isValidPostalCode(CountryCodes.canada, 'H0H 0H0')).toBe(true)
})
