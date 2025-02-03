import { getCurrentVehicle } from '../auth/sessionSlice'
import {
  executeRemoteCommand,
  RemoteCommand,
  RemoteServiceRequestBase,
  RemoteServiceResponse,
} from './remoteService.api'
import { baseApi, MSAEndpointBuilder, MSAQueryDefinition } from '../../api'
import {
  NormalResult,
  VehicleInfoRequest,
  ValetModeSettings,
  ValetModeSetup,
} from '../../../@types'
import { cNoVehicle } from '../../api/account.api'
import { MgaNavigationFunction, navigationRef } from '../../Controller'
import { store } from '../../store'
import { vehicleApi } from '../../api/vehicle.api'

export const valetModeStart: RemoteCommand = {
  name: 'valetModeStart',
  type: 'valetMode',
  url: '/service/g2/valetMode/execute.json',
  statusUrl: '/service/g2/remoteService/status.json',
}

export const valetModeStop: RemoteCommand = {
  name: 'valetModeStop',
  type: 'valetMode',
  url: '/service/g2/valetMode/execute.json',
  statusUrl: '/service/g2/remoteService/status.json',
}

export const writeValetModeSettings: RemoteCommand = {
  name: 'valetModeSaveSettings',
  type: 'valetMode',
  url: '/service/g2/saveValetCustomSettings/execute.json',
  statusUrl: '/service/g2/remoteService/status.json',
}

export const valetEndpoints: (builder: MSAEndpointBuilder) => {
  valetModeSettings: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<ValetModeSettings>
  >
  valetModeSetup: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<ValetModeSetup>
  >
} = builder => ({
  valetModeSettings: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'service/g2/getValetCustomSettings/fetch.json',
      method: 'GET',
      params: parameters,
    }),
  }),
  valetModeSetup: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'service/g2/valetCustomSettings/fetch.json',
      method: 'GET',
      params: parameters,
    }),
  }),
})

export const valetModeApi = baseApi.injectEndpoints({
  endpoints: valetEndpoints,
})

export const { useValetModeSettingsQuery, useValetModeSetupQuery } =
  valetModeApi

export interface RemoteValetRequest extends RemoteServiceRequestBase {
  valetOn: boolean
}

export interface RemoteValetSettingsRequest extends RemoteServiceRequestBase {
  hysteresisSec: number
  maxSpeedMPS: number
  speedType: string
  enableSpeedFence: boolean
}

export const enableValetMode = async (
  parameters?: RemoteValetRequest,
): Promise<RemoteServiceResponse> => {
  const vehicle = getCurrentVehicle()
  if (!vehicle) {
    return { success: false, errorCode: cNoVehicle }
  }
  const request: RemoteValetRequest = {
    valetOn: true,
    vin: parameters?.vin ?? vehicle.vin,
    pin: parameters?.pin ?? '',
  }
  return await executeRemoteCommand(valetModeStart, request, {
    requires: ['PIN', 'session', 'timestamp'],
  })
}

export const disableValetMode = async (
  parameters?: RemoteValetRequest,
): Promise<RemoteServiceResponse> => {
  const vehicle = getCurrentVehicle()
  if (!vehicle) {
    return { success: false, errorCode: cNoVehicle }
  }
  const request: RemoteValetRequest = {
    valetOn: false,
    vin: parameters?.vin ?? vehicle.vin,
    pin: parameters?.pin ?? '',
  }
  return await executeRemoteCommand(valetModeStop, request, {
    requires: ['PIN', 'session', 'timestamp'],
  })
}

export const updateValetModeSpeedSettings = async (
  parameters?: RemoteValetSettingsRequest,
): Promise<RemoteServiceResponse> => {
  const vehicle = getCurrentVehicle()
  if (!vehicle) {
    return { success: false, errorCode: cNoVehicle }
  }

  const request: RemoteValetSettingsRequest = {
    hysteresisSec: parameters?.hysteresisSec ?? 0,
    maxSpeedMPS: parameters?.maxSpeedMPS ?? 18,
    speedType: parameters?.speedType ?? 'absolute',
    enableSpeedFence: parameters?.enableSpeedFence ?? true,
    vin: vehicle.vin /** TODO:MN:20240123: Revert back to  `vin: parameters?.vin ?? vehicle.vin,` */,
    pin: parameters?.pin ?? '',
  }
  return await executeRemoteCommand(writeValetModeSettings, request, {
    requires: ['PIN', 'session', 'timestamp'],
  })
}

export const redirectIfValetNotConfigured: MgaNavigationFunction = () => {
  const vehicle = getCurrentVehicle()
  // const defaultSpeedMPS = defaultSpeedLimitMPS
  if (vehicle) {
    // go straight ahead if valet is on
    const statusResult = vehicleApi.endpoints.vehicleValetStatus.select({
      vin: vehicle.vin,
    })(store.getState())
    const { data: statusData, isSuccess: statusSuccess } = statusResult

    if (statusSuccess && statusData?.data == 'VAL_ON') {
      return false
    }

    // convoluted first time experience check
    const setupResult = valetModeApi.endpoints.valetModeSetup.select({
      vin: vehicle.vin,
    })(store.getState())
    const { data: setupData, isSuccess: setupSuccess } = setupResult

    const settingsResult = valetModeApi.endpoints.valetModeSettings.select({
      vin: vehicle.vin,
    })(store.getState())
    const { data: _settingsData, isSuccess: settingsSuccess } = settingsResult

    if (setupSuccess && settingsSuccess) {
      // 63 MPS = 141 MPH mga-1136
      if (
        setupData?.data == null // user had settings but they have been deleted

        // No need to check on default speed keeping in comment for future reference
        // || settingsData?.data?.speedFence?.maxSpeedMPS == defaultSpeedMPS || // user has not set speed alerts and value is default 63mps
        // settingsData?.data?.speedFence?.maxSpeedMPS == null // probably not a real car
      ) {
        // First time experience
        navigationRef.navigate('ValetModeSettings', {
          setupStepsCount: 2,
          currentStepIndex: 0,
          setupScreenKeys: ['ValetModeSetPasscode', 'ValetModeSetSpeedAlerts'],
        })
        return true
      } else {
        return false
      }
    }
    return false
  }
  return false
}
