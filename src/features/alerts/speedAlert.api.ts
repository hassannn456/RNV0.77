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

/** Only one of maxSpeedKph | maxSpeedMph will have a value. */
export interface SpeedFence {
  exceedMinimumSeconds: string
  maxSpeedKph?: string
  maxSpeedMph?: string
  name: string
  active: boolean
}

export interface SpeedFenceFetchResponse {
  success: true
  data: SpeedFence[]
}

export const g2SpeedFence: RemoteCommand = {
  name: 'speedAlert',
  type: 'speedFence',
  url: 'service/g2/speedFence/execute.json',
  statusUrl: 'service/g2/speedFence/status.json',
}

export const g2SpeedFenceDeactivate: RemoteCommand = {
  name: 'speedAlertDeactivate',
  type: 'speedFence',
  url: 'service/g2/speedFence/execute.json',
  statusUrl: 'service/g2/speedFence/status.json',
}

export const speedFenceEndpoints: (builder: MSAEndpointBuilder) => {
  speedFenceFetch: MSAQueryDefinition<undefined, SpeedFenceFetchResponse>
  speedFenceSave: MSAMutationDefinition<SpeedFence[], MSASuccess>
} = builder => ({
  speedFenceFetch: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'service/g2/speedFence/fetch.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    providesTags: ['speedFence'],
    extraOptions: {
      demoFetchTag: 'speedFence',
      requires: ['session', 'timestamp'],
    },
    transformResponse: (response: SpeedFenceFetchResponse) => {
      if (response.success && !response.data) {
        // Convert null to []
        return { ...response, data: [] }
      } else if (typeof response.data == 'string') {
        // Parse JSON
        const parsed = JSON.parse(response.data) as SpeedFence[]
        return { success: true, data: parsed }
      } else {
        return response
      }
    },
  }),
  speedFenceSave: builder.mutation({
    invalidatesTags: ['speedFence'],
    query: parameters => ({
      body: parameters,
      url: 'service/g2/speedFence/save.json',
      method: 'POST',
    }),
    extraOptions: {
      demoSaveTag: 'speedFence',
      requires: ['session'],
    },
  }),
})

export const speedFenceApi = baseApi.injectEndpoints({
  endpoints: speedFenceEndpoints,
})
export const { useSpeedFenceFetchQuery, useSpeedFenceSaveMutation } =
  speedFenceApi

export const speedFenceSaveAndSend = async (
  alerts: SpeedFence[],
  index?: number,
  target?: SpeedFence,
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
      ? await executeRemoteCommand(g2SpeedFence, parameters, {
          requires: ['PIN', 'session'],
        })
      : await executeRemoteCommand(g2SpeedFenceDeactivate, parameters, {
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
    speedFenceApi.endpoints.speedFenceSave.initiate(newAlerts),
  )
  return save.data as RemoteServiceResponse
}
