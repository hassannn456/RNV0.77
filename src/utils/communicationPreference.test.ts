import { RemoteServiceCommunicationsGen2 } from '../features/starlinkcommunications/starlinkcommunications.api'
import { setNotificationPreferenceGen2Response } from './communicationPreference'

describe('Should update Notification Preference Response Optimistically', () => {
  let parameters
  let notificationPreferences
  let expectedNotificationPreferences

  it('Should turn ON all notifications', () => {
    parameters = {
      notificationPreferences: [
        'MILImmediateAttention_text',
        'MILImmediateAttention_push',
        'MILImmediateAttention_email',
        'RemoteServiceCommands_text',
        'RemoteServiceCommands_push',
        'RemoteServiceCommands_email',
      ],
    }

    notificationPreferences = {
      success: true,
      errorCode: null,
      dataName: 'dataMap',
      data: {
        preferences: [
          {
            preferenceName: 'MIL Immediate Attention',
            preferenceValue: '',
            description: '',
            group: 'MIL Warning',
            preferenceDisplayName: 'Immediate Attention',
            preferenceDataType: 'Telematics',
            preferenceTMGenCD: 'TM Gen 3',
            tmPlanType: 'ABC',
            notifyEmailFlag: 'Mock_Test_Value',
            notifyTextFlag: 'Mock_Test_Value',
            notifyPushFlag: 'Mock_Test_Value',
            defaultValue: null,
          },
          {
            preferenceName: 'Remote Service Commands',
            preferenceValue: '',
            description: '',
            group: 'Remote Service Commands',
            preferenceDisplayName: 'Remote Service Commands',
            preferenceDataType: 'Telematics',
            preferenceTMGenCD: 'TM Gen 3',
            tmPlanType: 'ABC',
            notifyEmailFlag: 'Mock_Test_Value',
            notifyTextFlag: 'Mock_Test_Value',
            notifyPushFlag: 'Mock_Test_Value',
            defaultValue: null,
          },
        ],
        phone: '4343434343',
        sendVehicleLocationOnIgnitionOff: false,
        email: 'valetmodetest148@gmail.com',
        termsandconditiontextflag: true,
        inVehicleLanguage: 'en',
      },
    } as unknown as RemoteServiceCommunicationsGen2

    expectedNotificationPreferences = {
      success: true,
      errorCode: null,
      dataName: 'dataMap',
      data: {
        preferences: [
          {
            preferenceName: 'MIL Immediate Attention',
            preferenceValue: '',
            description: '',
            group: 'MIL Warning',
            preferenceDisplayName: 'Immediate Attention',
            preferenceDataType: 'Telematics',
            preferenceTMGenCD: 'TM Gen 3',
            tmPlanType: 'ABC',
            notifyEmailFlag: 'Y',
            notifyTextFlag: 'Y',
            notifyPushFlag: 'Y',
            defaultValue: null,
          },
          {
            preferenceName: 'Remote Service Commands',
            preferenceValue: '',
            description: '',
            group: 'Remote Service Commands',
            preferenceDisplayName: 'Remote Service Commands',
            preferenceDataType: 'Telematics',
            preferenceTMGenCD: 'TM Gen 3',
            tmPlanType: 'ABC',
            notifyEmailFlag: 'Y',
            notifyTextFlag: 'Y',
            notifyPushFlag: 'Y',
            defaultValue: null,
          },
        ],
        phone: '4343434343',
        sendVehicleLocationOnIgnitionOff: false,
        email: 'valetmodetest148@gmail.com',
        termsandconditiontextflag: true,
        inVehicleLanguage: 'en',
      },
    }

    const result = setNotificationPreferenceGen2Response(
      notificationPreferences,
      parameters,
    )
    expect(result).toEqual(expectedNotificationPreferences)
  })

  it('Should turn OFF all notifications', () => {
    parameters = {
      notificationPreferences: [],
    }

    notificationPreferences = {
      success: true,
      errorCode: null,
      dataName: 'dataMap',
      data: {
        preferences: [
          {
            preferenceName: 'MIL Immediate Attention',
            preferenceValue: '',
            description: '',
            group: 'MIL Warning',
            preferenceDisplayName: 'Immediate Attention',
            preferenceDataType: 'Telematics',
            preferenceTMGenCD: 'TM Gen 3',
            tmPlanType: 'ABC',
            notifyEmailFlag: 'Mock_Test_Value',
            notifyTextFlag: 'Mock_Test_Value',
            notifyPushFlag: 'Mock_Test_Value',
            defaultValue: null,
          },
          {
            preferenceName: 'Remote Service Commands',
            preferenceValue: '',
            description: '',
            group: 'Remote Service Commands',
            preferenceDisplayName: 'Remote Service Commands',
            preferenceDataType: 'Telematics',
            preferenceTMGenCD: 'TM Gen 3',
            tmPlanType: 'ABC',
            notifyEmailFlag: 'Mock_Test_Value',
            notifyTextFlag: 'Mock_Test_Value',
            notifyPushFlag: 'Mock_Test_Value',
            defaultValue: null,
          },
        ],
        phone: '4343434343',
        sendVehicleLocationOnIgnitionOff: false,
        email: 'valetmodetest148@gmail.com',
        termsandconditiontextflag: true,
        inVehicleLanguage: 'en',
      },
    } as unknown as RemoteServiceCommunicationsGen2

    expectedNotificationPreferences = {
      success: true,
      errorCode: null,
      dataName: 'dataMap',
      data: {
        preferences: [
          {
            preferenceName: 'MIL Immediate Attention',
            preferenceValue: '',
            description: '',
            group: 'MIL Warning',
            preferenceDisplayName: 'Immediate Attention',
            preferenceDataType: 'Telematics',
            preferenceTMGenCD: 'TM Gen 3',
            tmPlanType: 'ABC',
            notifyEmailFlag: 'N',
            notifyTextFlag: 'N',
            notifyPushFlag: 'N',
            defaultValue: null,
          },
          {
            preferenceName: 'Remote Service Commands',
            preferenceValue: '',
            description: '',
            group: 'Remote Service Commands',
            preferenceDisplayName: 'Remote Service Commands',
            preferenceDataType: 'Telematics',
            preferenceTMGenCD: 'TM Gen 3',
            tmPlanType: 'ABC',
            notifyEmailFlag: 'N',
            notifyTextFlag: 'N',
            notifyPushFlag: 'N',
            defaultValue: null,
          },
        ],
        phone: '4343434343',
        sendVehicleLocationOnIgnitionOff: false,
        email: 'valetmodetest148@gmail.com',
        termsandconditiontextflag: true,
        inVehicleLanguage: 'en',
      },
    }

    const result = setNotificationPreferenceGen2Response(
      notificationPreferences,
      parameters,
    )
    expect(result).toEqual(expectedNotificationPreferences)
  })
})
