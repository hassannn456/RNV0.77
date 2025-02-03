const {
  isStarlinkCommunicationSubscription,
} = require('./starlinkCommunications')
const g2SafetyOnly = require('./vehicle.g2SafetyOnly')
const g2SafetyPlus = require('./vehicle.g2SafetyPlus')
const g3SafetyPlus = require('./vehicle.g3SafetyPlus')
const g3SafetyOnly = require('./vehicle.g3SafetyOnly')

// Test Cases for driverServicesNotifications
it('MGA-951: Hide driverServicesNotifications subscription for g3SafetyPlus', () => {
  expect(
    ['driverServicesNotifications'].filter(subscription =>
      isStarlinkCommunicationSubscription(subscription, g3SafetyPlus),
    ),
  ).toStrictEqual([])
})
it('MGA-951: Hide driverServicesNotifications subscription for g3SafetyOnly', () => {
  expect(
    ['driverServicesNotifications'].filter(subscription =>
      isStarlinkCommunicationSubscription(subscription, g3SafetyOnly),
    ),
  ).toStrictEqual([])
})
it('MGA-951: Hide driverServicesNotifications subscription for g2SafetyOnly', () => {
  expect(
    ['driverServicesNotifications'].filter(subscription =>
      isStarlinkCommunicationSubscription(subscription, g2SafetyOnly),
    ),
  ).toStrictEqual([])
})
it('MGA-951: Hide driverServicesNotifications subscription for g2SafetyPlus', () => {
  expect(
    ['driverServicesNotifications'].filter(subscription =>
      isStarlinkCommunicationSubscription(subscription, g2SafetyPlus),
    ),
  ).toStrictEqual([])
})

// Test Cases for tripTrackerNotification
it('MGA-951: Show tripTrackerNotification subscription for g3SafetyPlus', () => {
  expect(
    ['tripTrackerNotification'].filter(subscription =>
      isStarlinkCommunicationSubscription(subscription, g3SafetyPlus),
    ),
  ).toStrictEqual(['tripTrackerNotification'])
})
it('MGA-951: Hide tripTrackerNotification subscription for g3SafetyOnly', () => {
  expect(
    ['tripTrackerNotification'].filter(subscription =>
      isStarlinkCommunicationSubscription(subscription, g3SafetyOnly),
    ),
  ).toStrictEqual([])
})

// Test Cases for remoteVehicleControls
it('MGA-951: Show remoteVehicleControls subscription for g3SafetyPlus', () => {
  expect(
    ['remoteVehicleControls'].filter(subscription =>
      isStarlinkCommunicationSubscription(subscription, g3SafetyPlus),
    ),
  ).toStrictEqual(['remoteVehicleControls'])
})
it('MGA-951: Hide remoteVehicleControls subscription for g3SafetyOnly', () => {
  expect(
    ['remoteVehicleControls'].filter(subscription =>
      isStarlinkCommunicationSubscription(subscription, g3SafetyOnly),
    ),
  ).toStrictEqual([])
})

// Test Cases for vehicleMonitoring
it('MGA-951: Show vehicleMonitoring subscription for g3SafetyPlus', () => {
  expect(
    ['vehicleMonitoring'].filter(subscription =>
      isStarlinkCommunicationSubscription(subscription, g3SafetyPlus),
    ),
  ).toStrictEqual(['vehicleMonitoring'])
})
it('MGA-951: Hide vehicleMonitoring subscription for g3SafetyOnly', () => {
  expect(
    ['vehicleMonitoring'].filter(subscription =>
      isStarlinkCommunicationSubscription(subscription, g3SafetyOnly),
    ),
  ).toStrictEqual([])
})
