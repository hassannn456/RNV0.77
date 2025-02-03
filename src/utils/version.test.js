import { highestVersion } from './version'

it('Returns the highest version', () => {
  expect(highestVersion('0.0.0', '2.5.1')).toBe('2.5.1')
  expect(highestVersion('2.5.1', '0.0.0')).toBe('2.5.1')
  expect(highestVersion('0.0.0', '2.5.1')).toBe('2.5.1')

  expect(highestVersion('0.0.0', '2.5.1')).toBe('2.5.1')
  expect(highestVersion('0.1.0', '0.1.0')).toBe('0.1.0')
})

it('handles matching versions', () => {
  expect(highestVersion('0.0.1', '0.0.1')).toBe('0.0.1')
})

it('Handles pre-release versions', () => {
  expect(highestVersion('0.0.1-rc1', '0.0.1')).toBe('0.0.1')
  expect(highestVersion('0.0.1-rc1', '0.0.1-rc2')).toBe('0.0.1-rc2')
  expect(highestVersion('0.0.1-alpha', '0.0.1-beta')).toBe('0.0.1-beta')
})
