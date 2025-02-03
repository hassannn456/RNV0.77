import { normalizeFuelPercent } from './normalizeFuel'

it('Returns  zero for undefined and out of range', () => {
  expect(normalizeFuelPercent(undefined)).toBe(0)
  expect(normalizeFuelPercent(101)).toBe(0)
  expect(normalizeFuelPercent(-1)).toBe(0)
})

it('Returns same value for numbers in range', () => {
  expect(normalizeFuelPercent(70)).toBe(70)
  expect(normalizeFuelPercent(5)).toBe(5)
  expect(normalizeFuelPercent(5.0)).toBe(5.0)
})
