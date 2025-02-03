import { checkPassword } from './password'

it('Rejects Blank Password', () => {
  expect(checkPassword('')).toBe(false)
  expect(checkPassword('    ')).toBe(false)
})

it('Rejects Invalid Password', () => {
  // Invalid format with front and end spacings.
  expect(checkPassword('a')).toBe(false)
  expect(checkPassword(' test')).toBe(false)
  expect(checkPassword('test ')).toBe(false)
  expect(checkPassword(' test ')).toBe(false)
})

it('Accepts Valid Password', () => {
  // Acceptable password
  expect(checkPassword('Testpassword1')).toBe(true)
})
