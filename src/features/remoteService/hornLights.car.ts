import { cNoVehicle } from '../../api/account.api'
import i18n from '../../i18n'
import { store } from '../../store'
import { promptSelect } from '../../screens/MgaModalSelect'
import { getVehicleGeneration } from '../../utils/vehicle'
import { getCurrentVehicle } from '../auth/sessionSlice'
import {
  dispatchRemoteCommandStatus,
  executeRemoteCommand,
  RemoteCommand,
  RemoteServiceRequestBase,
  RemoteServiceResponse,
} from './remoteService.api'
import { remoteStatusReducer } from './remoteStatus.slice'

export const g1HornLights: RemoteCommand = {
  name: 'hornLights',
  type: 'hornLights',
  url: '/service/g1/hornLights/execute.json',
  statusUrl: '/service/g1/hornLights/status.json',
  stop: {
    name: 'stopHornLights',
    type: 'hornLights',
    // MGA-2025: G1 Lights use cancel as a "stop"
    url: 'service/g1/hornLights/cancel.json',
    statusUrl: 'service/g1/hornLights/status.json',
  },
}
export const g1LightsOnly: RemoteCommand = {
  name: 'lightsOnly',
  type: 'hornLights',
  url: 'service/g1/lightsOnly/execute.json',
  statusUrl: 'service/g1/hornLights/status.json',
  stop: {
    name: 'stopLights',
    type: 'hornLights',
    // MGA-2025: G1 Lights use cancel as a "stop"
    url: 'service/g1/hornLights/cancel.json',
    statusUrl: 'service/g1/hornLights/status.json',
  },
}
export const g2HornLights: RemoteCommand = {
  name: 'hornLights',
  type: 'hornLights',
  url: 'service/g2/hornLights/execute.json',
  statusUrl: 'service/g2/hornLights/status.json',
  stop: {
    name: 'stopHornLights',
    type: 'hornLights',
    url: 'service/g2/hornLights/stop.json',
    statusUrl: 'service/g2/remoteService/status.json',
  },
}
export const g2LightsOnly: RemoteCommand = {
  name: 'lightsOnly',
  type: 'hornLights',
  url: 'service/g2/lightsOnly/execute.json',
  statusUrl: 'service/g2/lightsOnly/status.json',
  stop: {
    name: 'stopLights',
    type: 'hornLights',
    url: 'service/g2/hornLights/stop.json',
    statusUrl: 'service/g2/remoteService/status.json',
  },
}
export interface HornLightsRequest extends RemoteServiceRequestBase {
  delay: number
}
export const hornLights = async (
  parameters?: HornLightsRequest,
): Promise<RemoteServiceResponse> => {
  const vehicle = getCurrentVehicle()
  const { t } = i18n
  if (!vehicle) {
    return { success: false, errorCode: cNoVehicle }
  }
  const request: HornLightsRequest = {
    delay: parameters?.delay ?? 0,
    vin: parameters?.vin ?? vehicle.vin,
    pin: parameters?.pin ?? '',
  }
  const lightsType = await promptSelect({
    trackingId: 'SelectHornLights',
    title: t('hornLights:title'),
    options: [
      { label: t('hornLights:hornLights'), value: 'hornLights' },
      { label: t('hornLights:lightsOnly'), value: 'lightsOnly' },
    ],
  })
  if (!lightsType) {
    return { success: false, errorCode: 'cancelled' }
  }
  const gen = getVehicleGeneration(vehicle)
  const command =
    (lightsType == 'hornLights' && gen == 1 && g1HornLights) ||
    (lightsType == 'lightsOnly' && gen == 1 && g1LightsOnly) ||
    (lightsType == 'hornLights' && gen >= 1 && g2HornLights) ||
    (lightsType == 'lightsOnly' && gen >= 1 && g2LightsOnly) ||
    undefined
  if (!command) {
    return { success: false, errorCode: 'NYI' }
  }
  const response = await executeRemoteCommand(command, request, {
    allowSessionRenewal: true,
    requires: ['PIN', 'session', 'timestamp'],
  })
  setTimeout(() => {
    const status = remoteStatusReducer(store.getState())
    if (!status) return
    if (command == status.command) {
      dispatchRemoteCommandStatus({
        ...status,
        remoteServiceState: 'completed',
      })
    }
  }, 30000)
  return response
}
