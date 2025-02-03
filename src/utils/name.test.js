import { checkMiddleInitial, checkName } from './name'

it('Rejects Blank Name', () => {
  expect(checkName('')).toBe(false)
  expect(checkName('    ')).toBe(false)
})

it('Rejects Invalid Name', () => {
  // Invalid format with front and end spacings.
  expect(checkName('a')).toBe(false)
  expect(checkName(' test')).toBe(false)
  expect(checkName('test ')).toBe(false)
  expect(checkName(' test ')).toBe(false)
})

it('Accepts Valid Name', () => {
  // Acceptable name
  expect(checkName('Test')).toBe(true)
})

it('Accepts Valid Middle Initial', () => {
  expect(checkMiddleInitial('T')).toBe(true)
})

it('Rejects invalid Middle Initial', () => {
  expect(checkMiddleInitial('1')).toBe(false)
})

it('Rejects blank Middle Initial', () => {
  expect(checkMiddleInitial(' ')).toBe(false)
})

it('Accepts null value ', () => {
  expect(checkMiddleInitial(null)).toBe(true)
})

it('Accepts falsy value ', () => {
  expect(checkMiddleInitial(false)).toBe(true)
})
