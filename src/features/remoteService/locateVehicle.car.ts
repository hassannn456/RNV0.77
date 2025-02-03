import { LocateResponseData } from '../../../@types'
import { cNoVehicle } from '../../api/account.api'
import { navigate } from '../../Controller'
import { store } from '../../store'
import { getVehicleGeneration } from '../../utils/vehicle'
import { getCurrentVehicle } from '../auth/sessionSlice'
import {
  RemoteCommand,
  RemoteServiceRequestBase,
  RemoteServiceResponse,
  RemoteServiceState,
  RemoteServiceType,
  executeRemoteCommand,
} from './remoteService.api'

export interface VehicleStatusRequest extends RemoteServiceRequestBase {
  delay: number
}

export interface VehicleStatusResponse extends RemoteServiceResponse {
  data?: {
    serviceRequestId: string
    success: boolean
    cancelled: boolean
    remoteServiceState: RemoteServiceState
    remoteServiceType: RemoteServiceType
    subState: null
    errorCode: string | null
    result: LocateResponseData | null
    updateTime: number | null
    vin: string
    errorDescription: string | null
  }
}

const locateG1: RemoteCommand = {
  name: 'locateVehicle',
  type: 'locate',
  url: 'service/g1/vehicleLocate/execute.json',
  statusUrl: 'service/g1/vehicleLocate/status.json',
}

const locateG2: RemoteCommand = {
  name: 'locateVehicle',
  type: 'locate',
  url: 'service/g2/vehicleStatus/execute.json',
  statusUrl: 'service/g2/vehicleStatus/locationStatus.json',
}

export const locateVehicle = async (
  parameters?: Partial<VehicleStatusRequest>,
): Promise<VehicleStatusResponse> => {
  const vehicle = getCurrentVehicle()
  if (!vehicle) {
    return { success: false, errorCode: cNoVehicle }
  }
  const request: VehicleStatusRequest = {
    delay: parameters?.delay ?? 0,
    vin: parameters?.vin ?? vehicle.vin,
    pin: parameters?.pin ?? '',
  }
  const command = getVehicleGeneration(vehicle) == 1 ? locateG1 : locateG2
  const response = (await executeRemoteCommand(command, request, {
    allowSessionRenewal: true,
    requires: ['PIN', 'session', 'timestamp'],
  })) as VehicleStatusResponse
  if (response.success && response.data?.result) {
    const vehicle = getCurrentVehicle()
    // Re-check vehicle in case user logged out
    if (vehicle) {
      store.dispatch({
        type: 'session/updateVehicle',
        payload: {
          vin: response.data.vin,
          vehicleGeoPosition: response.data.result,
        },
      })
      navigate('StarlinkLocation')
    }
  }
  return response
}
