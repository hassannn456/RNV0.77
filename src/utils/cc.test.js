import { checkCC, formatCC, getIssuer } from './cc'

it('Checks credit card numbers', () => {
  expect(checkCC(undefined)).toBe(false)
  expect(checkCC('')).toBe(false)
  expect(checkCC('1234')).toBe(false) // Too short
  expect(checkCC('1234 5768 9012 3456 1234')).toBe(false) // Too long
  expect(checkCC('4444444444444448')).toBe(true) // Valid
  expect(checkCC('4444 4444 4444 4448')).toBe(true) // Valid, handle space removal
  expect(checkCC('4444 4444 4444 4449')).toBe(false) // Invalid checksum
})

it('Formats credit card numbers', () => {
  expect(formatCC('4444')).toBe('4444')
  expect(formatCC('444444')).toBe('4444 44')
  expect(formatCC('444444444444444A')).toBe('4444 4444 4444 444')
  expect(formatCC('4444444444444448')).toBe('4444 4444 4444 4448')
  expect(formatCC('4444 4444 4444 4448')).toBe('4444 4444 4444 4448')
})

it('Identifies card issuer', () => {
  expect(getIssuer('2222 2222 2222 2220')).toBe('mastercard')
  expect(getIssuer('3711 111111 11114')).toBe('amex') // Paypal test CC
  expect(getIssuer('6222 2222 2222 2223')).toBe('discover')
  expect(getIssuer('4444 4444 4444 4448')).toBe('visa')
  expect(getIssuer('9999 9999 9999 9999')).toBe(undefined) // Outside range
  expect(getIssuer('****-****-****-4448')).toBe(undefined) // Handle masked numbers
  expect(getIssuer('4')).toBe('visa') // Handle partial numbers
})

it('MGA-140 | DMND0004001: Amex format is 4-6-5', () => {
  expect(checkCC('3711 111111 11114')).toBe(true) // Paypal test CC
  expect(formatCC('344444444444447')).toBe('3444 444444 44447') // Test 34* range
  expect(formatCC('371111111111114')).toBe('3711 111111 11114') // Test 37* range
})

it('GIIMA-4217: CC numbers from document', () => {
  const visa = '4111 1111 1111 1111'
  expect(checkCC(visa)).toBe(true)
  expect(formatCC(visa)).toBe(visa)
  expect(getIssuer(visa)).toBe('visa')

  const discover = '6011 0009 9013 9424'
  expect(checkCC(discover)).toBe(true)
  expect(formatCC(discover)).toBe(discover)
  expect(getIssuer(discover)).toBe('discover')

  const amex = '3714 496353 98431'
  expect(checkCC(amex)).toBe(true)
  expect(formatCC(amex)).toBe(amex)
  expect(getIssuer(amex)).toBe('amex')

  const mastercard = '5555 5555 5555 4444'
  expect(checkCC(mastercard)).toBe(true)
  expect(formatCC(mastercard)).toBe(mastercard)
  expect(getIssuer(mastercard)).toBe('mastercard')
})
