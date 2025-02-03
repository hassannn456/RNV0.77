import {
  ConfigurePhevTimerSettingRequest,
  VehicleConditionStatusResponse,
} from '../../../@types'
import { cNoVehicle } from '../../api/account.api'
import i18n from '../../i18n'
import { store } from '../../store'
import { promptPIN } from '../../screens/MgaPINCheck'
import { getCurrentVehicle } from '../auth/sessionSlice'
import { phevApi } from './phev.api'
import {
  executeRemoteCommand,
  g2VehicleStatusRefresh,
  RemoteCommand,
  RemoteServiceRequestBase,
  RemoteServiceResponse,
} from './remoteService.api'

const g2PhevDeleteTimerSetting: RemoteCommand = {
  name: 'deleteChargeSchedule',
  type: 'phevDeleteTimerSetting',
  url: '/service/g2/phevDeleteTimerSetting/execute.json',
  statusUrl: '/service/g2/remoteService/status.json',
}

const g2PhevSendTimerSetting: RemoteCommand = {
  name: 'saveChargeSchedule',
  type: 'phevSendTimerSetting',
  url: '/service/g2/phevSendTimerSetting/execute.json',
  statusUrl: '/service/g2/remoteService/status.json',
}

const g2PhevRetrieveTimerSettings: RemoteCommand = {
  name: 'fetchChargeSettings',
  type: 'phevRetrieveTimerSettings',
  url: '/service/g2/phevRetrieveTimerSettings/execute.json',
  statusUrl: '/service/g2/remoteService/status.json',
}

const g2VehicleChargeNowStatus: RemoteCommand = {
  name: 'fetchVehicleStatus',
  type: 'vehicleStatus',
  url: '/service/g2/vehicleStatus/execute.json',
  statusUrl: '/service/g2/vehicleCondition/status.json',
}

const g2VehicleChargeNowNotConnected: RemoteCommand = {
  name: 'chargeNowNotConnected',
  type: 'phevChargeNow',
  url: '/service/g2/vehicleStatus/execute.json',
  statusUrl: '/service/g2/vehicleCondition/status.json',
}

const g2VehicleChargeNow: RemoteCommand = {
  name: 'chargeNow',
  type: 'phevChargeNow',
  url: '/service/g2/phevChargeNow/execute.json',
  statusUrl: '/service/g2/vehicleCondition/status.json',
}

export interface PhevDeleteTimerSettingRequest
  extends RemoteServiceRequestBase {
  timerSettingId: number
}

export const phevDeleteTimerSetting = async (
  parameters?: PhevDeleteTimerSettingRequest,
): Promise<RemoteServiceResponse> => {
  const vehicle = getCurrentVehicle()
  if (!vehicle) {
    return { success: false, errorCode: cNoVehicle }
  }
  if (!parameters?.timerSettingId) {
    return { success: false, errorCode: 'NoTimerSettingId' }
  }
  const request: PhevDeleteTimerSettingRequest = {
    ...parameters,
    vin: parameters?.vin ?? vehicle.vin,
    pin: parameters?.pin ?? '',
  }
  const response = await executeRemoteCommand(
    g2PhevDeleteTimerSetting,
    request,
    {
      requires: ['PIN', 'session', 'timestamp'],
    },
  )
  // After delete, re-trigger fetch
  if (response.success) {
    phevApi.util.invalidateTags(['chargeSchedule'])
    store
      .dispatch(phevApi.endpoints.phevGetTimerSettings.initiate(undefined))
      .unwrap()
      .then()
      .catch(console.error)
  }
  return response
}

export const phevSendTimerSetting = async (
  parameters: ConfigurePhevTimerSettingRequest,
): Promise<RemoteServiceResponse> => {
  const vehicle = getCurrentVehicle()
  if (!vehicle) {
    return { success: false, errorCode: cNoVehicle }
  }
  const request: ConfigurePhevTimerSettingRequest = {
    ...parameters,
    vin: parameters?.vin ?? vehicle.vin,
    pin: parameters?.pin ?? '',
  }
  const response = await executeRemoteCommand(g2PhevSendTimerSetting, request, {
    requires: ['PIN', 'session', 'timestamp'],
  })
  // After update, re-trigger fetch
  if (response.success) {
    phevApi.util.invalidateTags(['chargeSchedule'])
    store
      .dispatch(phevApi.endpoints.phevGetTimerSettings.initiate(undefined))
      .unwrap()
      .then()
      .catch(console.error)
  }
  return response
}

export const phevChargeNowStatus = async (): Promise<RemoteServiceResponse> => {
  const vehicle = getCurrentVehicle()
  if (!vehicle) {
    return { success: false, errorCode: cNoVehicle }
  }
  return await executeRemoteCommand(
    g2VehicleChargeNowStatus,
    {
      pin: '',
      vin: vehicle.vin,
    },
    {
      requires: ['PIN', 'session', 'timestamp'],
    },
  )
}

export const phevChargeNowNotConnected =
  async (): Promise<RemoteServiceResponse> => {
    const vehicle = getCurrentVehicle()
    if (!vehicle) {
      return { success: false, errorCode: cNoVehicle }
    }
    return await executeRemoteCommand(
      g2VehicleChargeNowNotConnected,
      {
        pin: '',
        vin: vehicle.vin,
      },
      {
        requires: ['PIN', 'session', 'timestamp'],
      },
    )
  }

export const phevChargeNow = async (): Promise<RemoteServiceResponse> => {
  const vehicle = getCurrentVehicle()
  if (!vehicle) {
    return { success: false, errorCode: cNoVehicle }
  }
  return await executeRemoteCommand(
    g2VehicleChargeNow,
    {
      pin: '',
      vin: vehicle.vin,
    },
    {
      allowSessionRenewal: true,
      requires: ['PIN', 'session', 'timestamp'],
    },
  )
}

export const phevFetchVehicleStatus =
  async (): Promise<RemoteServiceResponse> => {
    const vehicle = getCurrentVehicle()
    if (!vehicle) {
      return { success: false, errorCode: cNoVehicle }
    }
    const { t } = i18n
    const pin = await promptPIN({
      title: t(`command:${g2PhevRetrieveTimerSettings.name}.name`),
    })
    if (!pin) {
      return { success: false, errorCode: 'cancelled' }
    }
    const retrieve = await executeRemoteCommand(
      g2PhevRetrieveTimerSettings,
      {
        pin: pin,
        vin: vehicle.vin,
      },
      {
        requires: ['PIN', 'session', 'timestamp'],
      },
    )
    if (!retrieve.success || retrieve.data?.errorCode) {
      return retrieve
    }
    const get = await store
      .dispatch(phevApi.endpoints.phevGetTimerSettings.initiate(undefined))
      .unwrap()
    if (!get.success) {
      return get as RemoteServiceResponse
    }
    const condition = await store
      .dispatch(phevApi.endpoints.condition.initiate(undefined))
      .unwrap()
    if (!condition.success) {
      return condition as RemoteServiceResponse
    }
    const refresh = await executeRemoteCommand(
      g2VehicleStatusRefresh,
      {
        pin: pin,
        vin: vehicle.vin,
      },
      {
        allowSessionRenewal: true,
        requires: ['PIN', 'session', 'timestamp'],
      },
    )
    return refresh
  }

export const phevIsCharging = (
  status: VehicleConditionStatusResponse,
): boolean => {
  return (
    status?.evChargerStateType.toUpperCase() == 'CHARGING' ||
    status?.evChargerStateType.toUpperCase() == 'IS_CHARGING'
  )
}

export const phevIsUnplugged = (
  status: VehicleConditionStatusResponse,
): boolean => {
  return (
    status?.evIsPluggedIn.toUpperCase() != 'LOCKED_CONNECTED' &&
    status?.evIsPluggedIn.toUpperCase() != 'LOCKED_AND_CONNECTED' &&
    status?.evIsPluggedIn.toUpperCase() != 'UNLOCKED_CONNECTED' &&
    status?.evIsPluggedIn.toUpperCase() != 'UNLOCKED_AND_CONNECTED'
  )
}
