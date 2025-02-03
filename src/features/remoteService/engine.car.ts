import { cNoVehicle } from '../../api/account.api'
import { store } from '../../store'
import { EngineStartSettings, getVehicleType } from '../../utils/vehicle'
import { getCurrentVehicle } from '../auth/sessionSlice'
import {
  RemoteCommand,
  RemoteServiceRequestBase,
  RemoteServiceResponse,
  executeRemoteCommand,
} from './remoteService.api'

export const g2EngineStart: RemoteCommand = {
  name: 'remoteEngineStart',
  type: 'engineStart',
  url: 'service/g2/engineStart/execute.json',
  statusUrl: 'service/g2/engineStart/status.json',
  cancel: {
    name: 'cancelEngineStart',
    type: 'engineStart',
    url: 'service/g2/engineStart/cancel.json',
    statusUrl: 'service/g2/engineStart/status.json',
  },
}

export const g2ClimateControlStart: RemoteCommand = {
  name: 'climateControlStart',
  type: 'engineStart',
  url: '/service/g2/engineStart/execute.json',
  statusUrl: '/service/g2/engineStart/status.json',
  cancel: {
    name: 'climateControlCancel',
    type: 'engineStart',
    url: '/service/g2/engineStart/cancel.json',
    statusUrl: '/service/g2/engineStart/status.json',
  },
}

export const g2EngineStop: RemoteCommand = {
  name: 'remoteEngineStop',
  type: 'engineStop',
  url: 'service/g2/engineStop/execute.json',
  statusUrl: 'service/g2/remoteService/status.json',
}
export const g2ClimateControlStop: RemoteCommand = {
  name: 'climateControlStop',
  type: 'engineStop',
  url: '/service/g2/engineStop/execute.json',
  statusUrl: '/service/g2/remoteService/status.json',
}

export interface EngineRequest extends RemoteServiceRequestBase {
  delay: number
}

export const engineStart = async (
  settings: EngineStartSettings,
  parameters?: EngineRequest,
): Promise<RemoteServiceResponse> => {
  const vehicle = getCurrentVehicle()
  const vin = parameters?.vin ? parameters.vin : vehicle?.vin
  if (!vin || vin != vehicle?.vin) {
    return { success: false, errorCode: cNoVehicle }
  }
  const command =
    getVehicleType(vehicle) == 'gas' ? g2EngineStart : g2ClimateControlStart
  const request: EngineRequest = {
    ...settings,
    delay: parameters?.delay ?? 0,
    vin,
    pin: parameters?.pin ?? '',
  }
  const response = await executeRemoteCommand(command, request, {
    allowSessionRenewal: true,
    requires: ['PIN', 'session', 'timestamp'],
  })
  if (
    response.success &&
    !response.data.cancelled &&
    response.data.remoteServiceType == 'engineStart'
  ) {
    store.dispatch({
      type: 'preferences/triggerAppReview',
      payload: {
        key: 'appRating',
        value: 'remoteRccResCount',
      },
    })
    const now = response.data.updateTime ?? new Date().getTime()
    const delay =
      response.data.remoteServiceState == 'scheduled'
        ? (parameters?.delay ?? 0) * 60 * 1000
        : 0
    const remoteStartBeginTime = now + delay
    const remoteStartEndTime =
      remoteStartBeginTime + parseInt(settings.runTimeMinutes) * 60 * 1000
    const status = {
      engineRunStatus: true,
      remoteStartBeginTime,
      remoteStartEndTime,
    }
    store.dispatch({
      type: 'remoteStatus/setEngineStatus',
      payload: { vin, status },
    })
  }
  return response
}

export const engineStop = async (
  parameters?: EngineRequest,
): Promise<RemoteServiceResponse> => {
  const vehicle = getCurrentVehicle()
  const vin = parameters?.vin ? parameters.vin : vehicle?.vin
  if (!vin || vin != vehicle?.vin) {
    return { success: false, errorCode: cNoVehicle }
  }
  const command =
    getVehicleType(vehicle) == 'gas' ? g2EngineStop : g2ClimateControlStop
  const request: EngineRequest = {
    delay: parameters?.delay ?? 0,
    vin: vin,
    pin: parameters?.pin ?? '',
  }
  const response = await executeRemoteCommand(command, request, {
    requires: ['PIN', 'session', 'timestamp'],
  })
  if (response.success) {
    const status = {
      engineRunStatus: false,
      remoteStartBeginTime: 0,
      remoteStartEndTime: 0,
    }
    store.dispatch({
      type: 'remoteStatus/setEngineStatus',
      payload: { vin, status },
    })
  }
  return response
}
