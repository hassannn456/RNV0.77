const {
  getVehicleConditionCheck,
  getVehicleConditionCheckCount,
} = require('./vehicle')

const info_nostat = require('./vehicle.rvcc.nostat.info.json')
const info_stat = require('./vehicle.rvcc.stat.info.json')
const health = require('./vehicle.rvcc.nostat.health.json')
const status = require('./vehicle.rvcc.nostat.status.json')

const vcc_nostat = getVehicleConditionCheck(
  info_nostat.data.vehicle,
  health.data,
  status.data,
)

it('Strips window data', () => {
  expect(vcc_nostat.windowFrontLeftStatus).toBeFalsy()
  expect(vcc_nostat.windowFrontRightStatus).toBeFalsy()
  expect(vcc_nostat.windowRearLeftStatus).toBeFalsy()
  expect(vcc_nostat.windowRearRightStatus).toBeFalsy()
  expect(vcc_nostat.windowSunroofStatus).toBeFalsy()
})

it('Strips fuel data', () => {
  expect(vcc_nostat.remainingFuelPercent).toBeFalsy()
})

const vcc_stat = getVehicleConditionCheck(
  info_stat.data.vehicle,
  health.data,
  status.data,
)

it('Preserves window data', () => {
  expect(vcc_stat.windowFrontLeftStatus).toBeTruthy()
  expect(vcc_stat.windowFrontRightStatus).toBeTruthy()
  expect(vcc_stat.windowRearLeftStatus).toBeTruthy()
  expect(vcc_stat.windowRearRightStatus).toBeTruthy()
  expect(vcc_stat.windowSunroofStatus).toBeTruthy()
})

it('Preserves fuel data', () => {
  expect(vcc_stat.remainingFuelPercent).toBeTruthy()
})

it('Check for 1 Door Open and unlocked ', () => {
  expect(vcc_stat.doorFrontLeftPosition).toBe('OPEN')
  expect(vcc_stat.doorFrontLeftLockStatus).toBe('UNLOCKED')
  expect(vcc_stat.issues).toContain('doorUnlocked')
  expect(vcc_stat.issues).toContain('doorOpen')
})

const mga_1333_health = require('./vehicle.rvcc.tireanddoors.health.json')
const mga_1333_status = require('./vehicle.rvcc.tireanddoors.status.json')

it('MGA-1333 - Tire issue double counted', () => {
  const mga_1333_vcc = getVehicleConditionCheck(
    info_stat.data.vehicle, // Vehicle must have sensors (stat)
    mga_1333_health,
    mga_1333_status,
  )
  expect(getVehicleConditionCheckCount(mga_1333_health, mga_1333_vcc)).toBe(4)
})
