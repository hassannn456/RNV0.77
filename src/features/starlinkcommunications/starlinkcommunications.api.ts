// cSpell:ignore termsandconditiontextflag
import { VehicleInfoRequest } from '../../../@types'
import {
  MSASuccess,
  MSAEndpointBuilder,
  MSAQueryDefinition,
  baseApi,
  MSAMutationDefinition,
} from '../../api'
import { getCurrentVehicle } from '../auth/sessionSlice'
import { setNotificationPreferenceGen2Response } from '../../utils/communicationPreference'

export interface TelematicsPreferences {
  preferenceName: string
  preferenceValue: string
  preferenceLabelName: string
  description: string
}

export interface Carrier {
  referenceKey: number
  type: string
  name: string
  value: string
  displayOrder: null | string | number
  createdDate: number
  modifiedDate: number
}

export interface CommonPreference {
  primaryEmail: string
  primaryEmailConfirm: string
  additionalEmail: string
  additionalEmailConfirm: string
  smsPhone1: number
  smsCarrier1: string
  smsPhone2?: string | null
  smsCarrier2?: string | null
  primaryPhone: string
  secondaryPhone?: string
  otherPhone?: string | null
  alarmNotifications?: string[]
  remoteDoorLockNotifications?: string[]
  remoteDoorUnlockNotifications?: string[]
  stolenVehicleNotifications?: string[]
  hornLightsNotifications?: string[]
  telematicsPreferenceMap?: {
    VehicleHealthUsageReport?: string
    WarningLightCommunications?: string
  }
  'telematicsPreferenceMap[VehicleHealthUsageReport]'?: string
  'telematicsPreferenceMap[WarningLightCommunications]'?: string
}

export interface PreferenceFormData extends CommonPreference {
  WarningLightCommunications?: boolean
  VehicleHealthUsageReport?: boolean
}

export interface PreferenceData {
  defaultValue: string
  description: string
  group: string
  notifyEmailFlag: string
  notifyPushFlag: string
  notifyTextFlag: string
  preferenceDataType: string
  preferenceDisplayName: string
  preferenceName: string
  preferenceTMGenCD: string
  preferenceValue: string
  tmPlanType: string
}

export interface NotificationPreference extends CommonPreference {
  telematicsPreferenceList: TelematicsPreferences[]
  siebelEmail: string
  timezone: string
  carrierList: Carrier[]
  hasEmail: boolean
  hasSMS: boolean
  hasVoice: boolean
  email?: string
  phone?: string
}

export interface UpdateNotificationPreferenceGen2 {
  notificationPreferences: string[]
}

export interface NotificationPreferenceGen2Plus {
  preferences?: PreferenceData[]
  sendVehicleLocationOnIgnitionOff: boolean
  termsandconditiontextflag: boolean
  email?: string
  inVehicleLanguage?: string
  phone?: string
}

export interface RemoteServiceCommunicationsGen2 extends MSASuccess {
  dataName?: string
  data: NotificationPreferenceGen2Plus | undefined
}

export interface RemoteServiceCommunications extends MSASuccess {
  dataName?: string
  data: NotificationPreference | undefined
}

export const notificationEndpoints: (builder: MSAEndpointBuilder) => {
  updateNotificationPreferences: MSAMutationDefinition<
    CommonPreference,
    MSASuccess
  >
  updateNotificationPreferencesGen2: MSAMutationDefinition<
    UpdateNotificationPreferenceGen2,
    MSASuccess
  >
  notificationPreferences: MSAQueryDefinition<
    VehicleInfoRequest,
    RemoteServiceCommunications
  >
  notificationPreferencesGen2: MSAQueryDefinition<
    VehicleInfoRequest,
    RemoteServiceCommunicationsGen2
  >
} = builder => ({
  notificationPreferences: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'notificationPreferences.json',
      method: 'GET',
    }),
    providesTags: ['notificationPreferences'],
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  notificationPreferencesGen2: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'notificationPreferencesGen2.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  updateNotificationPreferences: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: 'notificationPreferences.json',
      method: 'POST',
    }),
    invalidatesTags: ['notificationPreferences'],
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  updateNotificationPreferencesGen2: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: 'notificationPreferencesGen2.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    onQueryStarted: async (parameters, { dispatch, queryFulfilled }) => {
      try {
        const vehicle = getCurrentVehicle()
        const result = dispatch(
          starlinkCommunicationsApi.util.updateQueryData(
            'notificationPreferencesGen2',
            { vin: vehicle?.vin ?? '' },
            draft => {
              setNotificationPreferenceGen2Response(draft, parameters)
            },
          ),
        )

        try {
          await queryFulfilled
        } catch {
          result.undo()
        }
      } catch (error) {
        console.error(error)
      }
    },
  }),
})

export const starlinkCommunicationsApi = baseApi.injectEndpoints({
  endpoints: notificationEndpoints,
  overrideExisting: true,
})
export const {
  useNotificationPreferencesQuery,
  useNotificationPreferencesGen2Query,
  useUpdateNotificationPreferencesMutation,
  useUpdateNotificationPreferencesGen2Mutation,
} = starlinkCommunicationsApi
