import {
  NormalResult,
  RemoteServiceStatusBase,
  VehicleConditionStatusResponse,
} from '../../../@types'
import { MSAEndpointBuilder, MSAQueryDefinition, baseApi } from '../../api'

export type ChargeTimerSettingTimerType = 'START' | 'DEPARTURE'

export interface ChargeTimerSetting {
  timerId: number
  timerType: ChargeTimerSettingTimerType
  timerEnabled: boolean
  precondition: boolean
  chargeTime: {
    hour: number
    minute: number
  }
  repeatSchedule: {
    monday: boolean
    tuesday: boolean
    wednesday: boolean
    thursday: boolean
    friday: boolean
    saturday: boolean
    sunday: boolean
  }
}

interface GetChargeTimerSettingsResponse {
  success: boolean
  data: {
    result: {
      success: boolean
      errorCode: null
      notes: {
        failureReason: null
        failureDescription: null
        errorDescription: null
        errorCode: null
        errorLabel: null
      }
      data: {
        chargeTimerSettings: ChargeTimerSetting[]
      }
    }
  }
}

export const phevEndpoints: (builder: MSAEndpointBuilder) => {
  condition: MSAQueryDefinition<
    undefined,
    NormalResult<RemoteServiceStatusBase<VehicleConditionStatusResponse>>
  >
  phevGetTimerSettings: MSAQueryDefinition<
    undefined,
    GetChargeTimerSettingsResponse
  >
} = builder => ({
  condition: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'service/g2/condition/execute.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  phevGetTimerSettings: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'service/g2/phevGetTimerSettings/execute.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    providesTags: ['chargeSchedule'],
  }),
})

export const phevApi = baseApi.injectEndpoints({
  endpoints: phevEndpoints,
})
export const { useConditionQuery, usePhevGetTimerSettingsQuery } = phevApi
