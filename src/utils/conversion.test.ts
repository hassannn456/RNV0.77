import { mpsToRegionalSpeed, metersToMiles } from './conversion'

it('Converts mps to regional units', () => {
  expect(mpsToRegionalSpeed(11, 'MPH')).toBe(25)
  expect(mpsToRegionalSpeed(11, 'KPH')).toBe(40)
})

it('Converts meters to miles with one decimal precision', () => {
  expect(metersToMiles(20.12345)).toBe('0.0')
  expect(metersToMiles(43.455317)).toBe('0.0')
  expect(metersToMiles(123.701685)).toBe('0.1')
  expect(metersToMiles(2301.185029)).toBe('1.4')
  expect(metersToMiles(2379.687555)).toBe('1.5')
  expect(metersToMiles(2458.519582)).toBe('1.5')
  expect(metersToMiles(4392.135833)).toBe('2.7')
})

it('Returns a String miles value from any Number meter value', () => {
  expect(typeof metersToMiles(20.12345)).toBe('string')
})
