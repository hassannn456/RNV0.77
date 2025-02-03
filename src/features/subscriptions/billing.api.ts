// cSpell:ignore termsandconditiontextflag, iccid
/* eslint-disable camelcase */
import {
  MSAContentTypeForm,
  MSAEndpointBuilder,
  MSAMutationDefinition,
  MSAQueryDefinition,
  MSASuccess,
  baseApi,
} from '../../api'

export interface NotificationPreference {
  preferenceName: string
  preferenceValue: string
  description: string
  group: string
  preferenceDisplayName: string
  preferenceDataType: string
  preferenceTMGenCD: string
  tmPlanType: string
  notifyEmailFlag: string
  notifyTextFlag: string
  notifyPushFlag: string
  defaultValue: string | null
}

export interface FetchNotificationPreferencesG2Response {
  success: true
  dataName: 'dataMap'
  data: {
    phone: string
    sendVehicleLocationOnIgnitionOff: boolean
    email: string
    termsandconditiontextflag: boolean
    inVehicleLanguage: string
    preferences: NotificationPreference[]
  }
}

export const transformNotificationPreferences: (
  preferences: NotificationPreference[],
) => string[] = preferences => {
  const result: string[] = []
  for (let i = 0; i < preferences.length; i++) {
    const preference = preferences[i]
    const notificationId = preference.preferenceName.replace(/\s+/g, '')
    if (preference.notifyEmailFlag == 'Y') {
      result.push(`${notificationId}_email`)
    }
    if (preference.notifyPushFlag == 'Y') {
      result.push(`${notificationId}_push`)
    }
    if (preference.notifyTextFlag == 'Y') {
      result.push(`${notificationId}_text`)
    }
  }
  return result
}

export interface SaveNotificationPreferencesGen2Request {
  notificationPreferences: string[]
}

export const billingEndpoints: (builder: MSAEndpointBuilder) => {
  fetchNotificationPreferencesGen2: MSAQueryDefinition<
    undefined,
    FetchNotificationPreferencesG2Response
  >
  saveNotificationPreferencesGen2: MSAMutationDefinition<
    SaveNotificationPreferencesGen2Request,
    MSASuccess
  >
  trafficConnectTrialEligible: MSAQueryDefinition<undefined, MSASuccess>
} = builder => ({
  fetchNotificationPreferencesGen2: builder.query({
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
  saveNotificationPreferencesGen2: builder.mutation({
    query: parameters => ({
      body: parameters,
      url: 'notificationPreferencesGen2.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeForm,
      requires: ['session'],
    },
  }),
  trafficConnectTrialEligible: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'manageEnrollment/traffic-connect/trial-eligible.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
})

export const billingApi = baseApi.injectEndpoints({
  endpoints: billingEndpoints,
})
export const {
  useLazyFetchNotificationPreferencesGen2Query,
  useSaveNotificationPreferencesGen2Mutation,
  useTrafficConnectTrialEligibleQuery,
} = billingApi
