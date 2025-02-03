import { checkEmail, checkUserEmail } from './email'

it('Rejects Blank Email Address', () => {
  expect(checkEmail('')).toBe(false)
  expect(checkEmail('    ')).toBe(false)
})

it('Rejects Invalid Email Address', () => {
  // Invalid format
  expect(checkEmail('test')).toBe(false)
  expect(checkEmail('test@')).toBe(false)
  expect(checkEmail('@')).toBe(false)
  expect(checkEmail('test@.com')).toBe(false)
  // Too long Email
  expect(
    checkEmail(
      '123456789_123456789_123456789_123456789_123456789_123456789_123456789_1234567890@example.com',
    ),
  ).toBe(false)
  // Too long Domain
  expect(
    checkEmail(
      '123456789_123456789_@exampleDomainexampleDomainexamplDomaineexampleDomainexampleDomainexampleDomainexample.com',
    ),
  ).toBe(false)
})

it('Accepts Valid Email', () => {
  // Normal e-mail address
  expect(checkEmail('tlucke@subaru.com')).toBe(true)
  // Gmail + trick
  expect(checkEmail('spamfilter+tluckenbaugh@gmail.com')).toBe(true)
  // Technically valid, difficult to route
  expect(checkEmail('root@localhost')).toBe(true)
  expect(checkEmail('spamfilter+tluckenbaugh@validlongDomainTest.com')).toBe(
    true,
  )
})

it('Valid User Email', () => {
  // Normal e-mail address
  expect(checkUserEmail('tlucke@subaru.com')).toBe(true)
  // Gmail + trick
  expect(checkUserEmail('spamfilter+tluckenbaugh@gmail.com')).toBe(true)
  // Without domain
  expect(checkUserEmail('tlucke@s')).toBe(false)
  expect(checkUserEmail('tlucke@subaru.123')).toBe(false)
})
