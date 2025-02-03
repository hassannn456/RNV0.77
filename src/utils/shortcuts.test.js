const { getAllowedShortcutsByVehicle } = require('./shortcuts')
const g0_hawaii = require('./vehicle.g0.hawaii.json')
const g2Remote_notProvisioned = require('./vehicle.g2Remote.notProvisioned.json')

it('MGA-1173: Hide shortcuts for PROV-A', () => {
  expect(getAllowedShortcutsByVehicle(g2Remote_notProvisioned)).toStrictEqual(
    [],
  )
})

it('MGA-1175: Hide retailer shortcuts for Hawaii', () => {
  expect(getAllowedShortcutsByVehicle(g0_hawaii)).toStrictEqual([
    'roadside_assistance',
    'enter_service',
    'schedule_service',
  ])
})
