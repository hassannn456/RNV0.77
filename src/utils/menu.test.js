const g1SafetyOnly = require('./vehicle.g1SafetyOnly')
const g2SafetyOnly = require('./vehicle.g2SafetyOnly')
const g2SafetyPlus = require('./vehicle.g2SafetyPlus')
const g3SafetyPlus = require('./vehicle.g3SafetyPlus')
const g3SafetyOnly = require('./vehicle.g3SafetyOnly')
const g2RemoteNotProvisioned = require('./vehicle.g2Remote.notProvisioned')
const g3RemoteAccessLevel2 = require('./vehicle.g3Remote.accessLevel2')
const g3TrafficOnly = require('./vehicle.g3TrafficOnly')
const g3NoSubRightToRepair = require('./vehicle.g3NoSub.rightToRepair')
const { canAccessScreen } = require('./menu')

it('MGA-473', () => {
  expect(
    ['DriverAlerts'].filter(screen =>
      canAccessScreen(screen, g3RemoteAccessLevel2),
    ),
  ).toStrictEqual([])
})

it('MGA-500', () => {
  expect(
    ['SubscriptionEnrollment', 'SubscriptionManage'].filter(screen =>
      canAccessScreen(screen, g1SafetyOnly),
    ),
  ).toStrictEqual([])
})

it('MGA-501', () => {
  expect(
    ['ValetMode'].filter(screen => canAccessScreen(screen, g1SafetyOnly)),
  ).toStrictEqual([])
})

it('MGA-827: Provision Error should not block Starlink Communications', () => {
  expect(
    ['RemoteServiceCommunications'].filter(screen =>
      canAccessScreen(screen, g2RemoteNotProvisioned),
    ),
  ).toStrictEqual(['RemoteServiceCommunications'])
})

it('MGA-856: Live Traffic only sub needs Billing access', () => {
  expect(
    ['BillingInformationView'].filter(screen =>
      canAccessScreen(screen, g3TrafficOnly),
    ),
  ).toStrictEqual(['BillingInformationView'])
})

it('MGA-920: Hide remote commands on right to repair vehicles', () => {
  expect(
    ['RemoteService'].filter(screen =>
      canAccessScreen(screen, g3NoSubRightToRepair),
    ),
  ).toStrictEqual([])
})
it('MGA-951: Show vehicle VehicleLocationTracking menu option for g3SafetyPlus', () => {
  expect(
    ['VehicleLocationTracking'].filter(screen =>
      canAccessScreen(screen, g3SafetyPlus),
    ),
  ).toStrictEqual(['VehicleLocationTracking'])
})
it('MGA-951: Show vehicle VehicleLocationTracking menu option for g3SafetyOnly', () => {
  expect(
    ['VehicleLocationTracking'].filter(screen =>
      canAccessScreen(screen, g3SafetyOnly),
    ),
  ).toStrictEqual(['VehicleLocationTracking'])
})
it('MGA-951: Show vehicle VehicleLocationTracking menu option for g2SafetyOnly', () => {
  expect(
    ['VehicleLocationTracking'].filter(screen =>
      canAccessScreen(screen, g2SafetyOnly),
    ),
  ).toStrictEqual(['VehicleLocationTracking'])
})
it('MGA-951: Show vehicle VehicleLocationTracking menu option for g2SafetyPlus', () => {
  expect(
    ['VehicleLocationTracking'].filter(screen =>
      canAccessScreen(screen, g2SafetyPlus),
    ),
  ).toStrictEqual(['VehicleLocationTracking'])
})
it('MGA-1079: Show authorized user menu option for g2SafetyOnly', () => {
  expect(
    ['AuthorizedUsers'].filter(screen => canAccessScreen(screen, g2SafetyOnly)),
  ).toStrictEqual(['AuthorizedUsers'])
})
it('MGA-1079: Show authorized user menu option for g3SafetyOnly', () => {
  expect(
    ['AuthorizedUsers'].filter(screen => canAccessScreen(screen, g3SafetyOnly)),
  ).toStrictEqual(['AuthorizedUsers'])
})
it('MGA-1079: Hide authorized user menu option for g1SafetyOnly', () => {
  expect(
    ['AuthorizedUsers'].filter(screen => canAccessScreen(screen, g1SafetyOnly)),
  ).toStrictEqual([])
})
