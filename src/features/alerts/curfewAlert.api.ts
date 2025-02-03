import { cNoVehicle } from '../../api/account.api'
import {
  MSAEndpointBuilder,
  MSAMutationDefinition,
  MSAQueryDefinition,
  MSASuccess,
  baseApi,
} from '../../api'
import { store } from '../../store'
import { currentVehicleReducer } from '../auth/sessionSlice'
import {
  RemoteCommand,
  RemoteServiceResponse,
  executeRemoteCommand,
} from '../remoteService/remoteService.api'

export interface Curfew {
  startHour: string
  startMinute: string
  endHour: string
  endMinute: string
  days: number[]
}

export interface CurfewAlert {
  name: string
  active: boolean
  timeZoneId: string
  curfews: Curfew[]
}

export interface CurfewAlertFetchResponse {
  success: true
  data: CurfewAlert[]
}

export const g2CurfewAlert: RemoteCommand = {
  name: 'curfewAlert',
  type: 'timeFence',
  url: 'service/g2/curfew/execute.json',
  statusUrl: 'service/g2/timeFence/status.json',
}

export const g2CurfewAlertDeactivate: RemoteCommand = {
  name: 'curfewAlertDeactivate',
  type: 'timeFence',
  url: 'service/g2/curfew/execute.json',
  statusUrl: 'service/g2/timeFence/status.json',
}

export const curfewAlertEndpoints: (builder: MSAEndpointBuilder) => {
  curfewAlertFetch: MSAQueryDefinition<undefined, CurfewAlertFetchResponse>
  curfewAlertSave: MSAMutationDefinition<CurfewAlert[], MSASuccess>
} = builder => ({
  curfewAlertFetch: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'service/g2/curfew/fetch.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    providesTags: ['curfew'],
    extraOptions: {
      demoFetchTag: 'curfew',
      requires: ['session', 'timestamp'],
    },
    transformResponse: (response: CurfewAlertFetchResponse) => {
      if (response.success && !response.data) {
        // Convert null to []
        return { ...response, data: [] }
      } else if (typeof response.data == 'string') {
        // Parse JSON
        const parsed = JSON.parse(response.data) as CurfewAlert[]
        return { success: true, data: parsed }
      } else {
        return response
      }
    },
  }),
  curfewAlertSave: builder.mutation({
    invalidatesTags: ['curfew'],
    query: parameters => ({
      body: parameters,
      url: 'service/g2/curfew/save.json',
      method: 'POST',
    }),
    extraOptions: {
      demoSaveTag: 'curfew',
      requires: ['session'],
    },
  }),
})

export const curfewAlertApi = baseApi.injectEndpoints({
  endpoints: curfewAlertEndpoints,
})
export const { useCurfewAlertFetchQuery, useCurfewAlertSaveMutation } =
  curfewAlertApi

export const curfewAlertSaveAndSend = async (
  alerts: CurfewAlert[],
  index?: number,
  target?: CurfewAlert,
): Promise<RemoteServiceResponse> => {
  const vin = currentVehicleReducer(store.getState())?.vin
  if (!vin) {
    return { success: false, errorCode: cNoVehicle }
  }
  // Only send to vehicle if alert is newly active or if deleted alert was the active one
  if (target || (index != undefined && alerts[index].active)) {
    const parameters = target?.active
      ? { ...target, pin: '', vin: vin }
      : { pin: '', vin: vin }
    const send = target?.active
      ? await executeRemoteCommand(g2CurfewAlert, parameters, {
          requires: ['PIN', 'session'],
        })
      : await executeRemoteCommand(g2CurfewAlertDeactivate, parameters, {
          requires: ['PIN', 'session'],
        })
    if (!send.data?.success) {
      return send
    }
  }
  // On Update: splice in new alert, deactivating others if active
  // On Insert: add alert to end of array
  // On Delete: splice out old alert
  const newAlerts = target
    ? alerts
        .map((alert, i) => {
          // Update / deactivate
          if (i == index) {
            return target
          } else {
            return Object.assign({}, alert, { active: false })
          }
        })
        .concat(index == undefined ? [target] : []) // Insert
    : alerts.filter((_, i) => index != i) // Delete
  const save = await store.dispatch(
    curfewAlertApi.endpoints.curfewAlertSave.initiate(newAlerts),
  )
  return save.data as RemoteServiceResponse
}
