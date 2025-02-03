const {
  getVehicleGeneration,
  getPINLockoutTimeMinutes,
  getVehicleType,
  hasMoonroof,
  getVehicleConditionCheck,
  hasActiveStarlinkSubscription,
  displayVehicleMileage,
} = require('./vehicle')
const session = require('./vehicle.test.session.json')
const twoDoorHealth = require('./vehicle.test.rvcc.twodoor.health.json')
const twoDoorStatus = require('./vehicle.test.rvcc.twodoor.status.json')
const liveTrafficOnly = require('./vehicle.subs.tomtom.nostarlink.json')
const allDoorClosedAndTailgateOpenStatus = require('./vehicle.test.rvcc.alldoorsClosedBootUnlocked.status.json')
const g0NoSub = session.data.vehicles.filter(
  v => v.vin == '4S3BMCF6XC3014484',
)[0]
const g2Concierge = session.data.vehicles.filter(
  v => v.vin == '4S4BRBLC7C3271104',
)[0]
const g2RemotePhev = session.data.vehicles.filter(
  v => v.vin == 'JF2GPABC5G8209108',
)[0]
const g3Concierge = session.data.vehicles.filter(
  v => v.vin == '4S3BMAA64D1006910',
)[0]
const twoDoor = session.data.vehicles.filter(
  v => v.vin == '4S4BRDKC4D2296594',
)[0]
const g4CompanionPlus = session.data.vehicles.filter(
  v => v.vin == 'JF2NB8305U4000411',
)[0]

const mileage = session.data.vehicles.filter(v => v.vehicleMileage == null)[0]

it('Returns correct generations', () => {
  expect(getVehicleGeneration(g0NoSub)).toStrictEqual(0)
  expect(getVehicleGeneration(g2Concierge)).toStrictEqual(2)
  expect(getVehicleGeneration(g3Concierge)).toStrictEqual(3)
  expect(getVehicleGeneration(g4CompanionPlus)).toStrictEqual(4)
})

it('Returns PIN lockout times', () => {
  expect(getPINLockoutTimeMinutes(g0NoSub)).toStrictEqual(60)
  expect(getPINLockoutTimeMinutes(g2Concierge)).toStrictEqual(10)
  expect(getPINLockoutTimeMinutes(g3Concierge)).toStrictEqual(10)
  expect(getPINLockoutTimeMinutes(g4CompanionPlus)).toStrictEqual(10)
})

it('Checks for PHEV', () => {
  expect(getVehicleType(g0NoSub)).toStrictEqual('gas')
  expect(getVehicleType(g2Concierge)).toStrictEqual('gas')
  expect(getVehicleType(g2RemotePhev)).toStrictEqual('phev')
  expect(getVehicleType(g3Concierge)).toStrictEqual('gas')
})

it('Checks Moonroof', () => {
  expect(hasMoonroof(g0NoSub)).toStrictEqual(false)
  expect(hasMoonroof(g2Concierge)).toStrictEqual(false)
  expect(hasMoonroof(g2RemotePhev)).toStrictEqual(true)
  expect(hasMoonroof(g3Concierge)).toStrictEqual(false)
  expect(hasMoonroof(g4CompanionPlus)).toStrictEqual(true)
})

it('Cleans up invalid window data', () => {
  const vcc = getVehicleConditionCheck(
    twoDoor,
    twoDoorHealth.data,
    twoDoorStatus.data,
  )
  expect(vcc.windowRearLeftStatus).toBeFalsy()
  expect(vcc.windowRearRightStatus).toBeFalsy()
})

it('MGA-804', () => {
  expect(hasActiveStarlinkSubscription(g0NoSub)).toBeFalsy()
  expect(hasActiveStarlinkSubscription(g2Concierge)).toBeTruthy()
  expect(hasActiveStarlinkSubscription(g2RemotePhev)).toBeTruthy()
  expect(hasActiveStarlinkSubscription(g3Concierge)).toBeTruthy()
  expect(hasActiveStarlinkSubscription(g4CompanionPlus)).toBeTruthy()
  expect(hasActiveStarlinkSubscription(liveTrafficOnly)).toBeFalsy()
})

it('Get Vehicle Mileage', () => {
  const vehicle = { vehicleMileage: 2 }
  const vehicleMileage = { vehicleMileage: 0 }
  expect(displayVehicleMileage(vehicle)).toEqual('2')
  expect(displayVehicleMileage(vehicleMileage)).toStrictEqual('-')
  //checking for null value
  expect(displayVehicleMileage(mileage)).toStrictEqual('-')
})

it('WOR-246', () => {
  const vehicle = {
    vehicleMileage: 2,
    features: [
      'TAIL_OC_STAT',
      'TAIL_LU_STAT',
      'DOORALL',
      'DOOR_OC_STAT',
      'DOOR_LU_STAT',
    ],
  }
  const vehicleHealth = {
    vehicleHealthItems: [],
  }

  const conditionCheck = getVehicleConditionCheck(
    vehicle,
    vehicleHealth,
    allDoorClosedAndTailgateOpenStatus.data,
  )

  expect(conditionCheck.doorBootOpen).toBeTruthy()
  expect(conditionCheck.doorBootUnlocked).toBeTruthy()
})
