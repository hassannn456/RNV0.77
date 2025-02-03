import { computeVINCheckDigit, checkVIN } from './vin'

it('Checks standard VIN', () => {
  expect(computeVINCheckDigit('11111111111111111')).toBe('1') // Standard test
  expect(computeVINCheckDigit('5GZCZ43D13S812715')).toBe('1') // Valid VIN
  expect(computeVINCheckDigit('SGZCZ43D13S812715')).toBe('X') // Invalid VIN, actual check digit
})

it('Rejects Invalid VINs', () => {
  expect(checkVIN('ABC')).toBe(false) // Obviously wrong
  expect(checkVIN('A@C')).toBe(false) // Invalid character
  expect(checkVIN('SGZCZ43D13S812715')).toBe(false) // From Wikipedia
})

it('Accepts Valid VINs', () => {
  expect(checkVIN('1FADP3F20EL425205')).toBe(true) // My old ford
  expect(checkVIN('5GZCZ43D13S812715')).toBe(true) // From Wikipedia
  expect(checkVIN('4S3BMAA66D1038385')).toBe(true) // QA vehicle
  expect(checkVIN('4S3BWGG68P3995016')).toBe(true) // QA vehicle
  expect(checkVIN('JF2GPABC1G8201636')).toBe(true) // QA PHEV SIMCA
})
