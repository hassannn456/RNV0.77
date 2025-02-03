const vehicleG3 = require('../../utils/vehicle.g3SafetyPlus.json')
const vehicleSafety = require('../../utils/vehicle.g3SafetyOnly.json')
const vehicleG4CompanionPlus = require('../../utils/vehicle.g4CompanionPlus.json')
const vehicleG4NoRes = require('../../utils/vehicle.g4.json')
const { hasRemoteService } = require('./rules')

it('Passes g2/g3 vehicles w/ REMOTE subscription ', () => {
  expect(hasRemoteService('RCC', vehicleG3, true)).toStrictEqual(true)
  expect(hasRemoteService('*', vehicleG3, true)).toStrictEqual(true)
})
it('Rejects g2/g3 vehicles w/out REMOTE subscription ', () => {
  expect(hasRemoteService('RCC', vehicleSafety, true)).toStrictEqual(false)
  expect(hasRemoteService('*', vehicleSafety, true)).toStrictEqual(false)
})

it('Passes g4 vehicles w/ COMPANION_PLUS subscription ', () => {
  expect(hasRemoteService('RES', vehicleG4CompanionPlus, true)).toStrictEqual(
    true,
  )
  //  expect(hasRemoteService('*', vehicleG4CompanionPlus)).toStrictEqual(true)
})

it('Rejects g4 vehicles w/ COMPANION_PLUS subscription but no matching capability ', () => {
  expect(hasRemoteService('RES', vehicleG4NoRes, true)).toStrictEqual(false)
  //  expect(hasRemoteService('*', vehicleG4CompanionPlus)).toStrictEqual(true)
})
