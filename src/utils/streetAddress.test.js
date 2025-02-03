import { checkStreetAddress } from './streetAddress'

it('Rejects Blank Street Address', () => {
  expect(checkStreetAddress('')).toBe(false)
})

it('Rejects Invalid Street Address', () => {
  // Invalid format.
  expect(checkStreetAddress('test#$')).toBe(false)
})

it('Accepts Valid Street Address', () => {
  // Acceptable street address
  expect(checkStreetAddress('Test')).toBe(true)
  expect(checkStreetAddress('Test ')).toBe(true)
  expect(checkStreetAddress('Test01')).toBe(true)
  expect(checkStreetAddress('Test@')).toBe(true)
})
