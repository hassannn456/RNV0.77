import { encodeFormData } from './encode'

it('Encodes form data', () => {
  expect(
    encodeFormData({
      email: 'janie.rios@gmail.com',
      emailConfirm: 'janie.rios@gmail.com',
      password: 'Password1',
      updateAction: 'EMAIL_UPDATE',
    }),
  ).toBe(
    'email=janie.rios%40gmail.com&emailConfirm=janie.rios%40gmail.com&password=Password1&updateAction=EMAIL_UPDATE',
  )
  expect(
    encodeFormData({
      cellularPhone: '(717) 858-5409',
      homePhone: '(888) 809-3211',
      workPhone: '(888) 809-3211',
      password: 'Password1',
      verificationCode: 187520,
    }),
  ).toBe(
    'cellularPhone=(717)+858-5409&homePhone=(888)+809-3211&workPhone=(888)+809-3211&password=Password1&verificationCode=187520',
  )
})

it('Encodes arrays in forms', () => {
  expect(
    encodeFormData({
      notificationPreferences: ['Billing_text', 'Billing_push'],
    }),
  ).toBe(
    'notificationPreferences=Billing_text&notificationPreferences=Billing_push',
  )
})

it('Encodes null to empty string', () => {
  expect(
    encodeFormData({
      serviceProvider: 'Dotties Garage',
      vehicleOwnerServiceId: 7160,
      vehicleId: 311753,
      serviceType: 'USER_ENTERED_SERVICE',
      serviceHeaderKey: null,
      ownerRepairServiceId: null,
      maintenanceInterval: 90000,
      serviceDate: 'Aug 01, 2023',
      mileage: 90505,
      vehicleNotes: 'TEST',
      comments: null,
    }),
  ).toBe(
    'serviceProvider=Dotties+Garage&vehicleOwnerServiceId=7160&vehicleId=311753&serviceType=USER_ENTERED_SERVICE&serviceHeaderKey=&ownerRepairServiceId=&maintenanceInterval=90000&serviceDate=Aug+01,+2023&mileage=90505&vehicleNotes=TEST&comments=',
  )
})

it('Encodes spaces', () => {
  expect(
    encodeFormData({
      cc_no: '4444 4444 4444 4448',
    }),
  ).toBe('cc_no=4444+4444+4444+4448')
})
