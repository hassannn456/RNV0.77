const { formatPhone, validPhone } = require('./phone')

it('Formats phone numbers', () => {
  expect(formatPhone('P1')).toBe('1')
  expect(formatPhone('P1234')).toBe('(123) 4')
  expect(formatPhone('P1234567')).toBe('(123) 456-7')
  expect(formatPhone('P1234567890')).toBe('(123) 456-7890')
  expect(formatPhone('11234567890')).toBe('1 (123) 456-7890')
})

it('Checks Valid Phone Number', () => {
  expect(validPhone('1234')).toBe(false)
  expect(validPhone('12345678')).toBe(false)
  expect(validPhone('1234567899')).toBe(true)
})
