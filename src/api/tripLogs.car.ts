import { getCurrentVehicle } from '../features/auth/sessionSlice'
import {
  executeRemoteCommand,
  RemoteCommand,
  RemoteServiceRequestBase,
  RemoteServiceResponse,
} from '../features/remoteService/remoteService.api'
import { cNoVehicle } from './account.api'

const g2TripStartCommand: RemoteCommand = {
  name: 'tripStart',
  type: 'triplogCommand',
  url: 'service/g2/triplogCommand/execute.json',
  statusUrl: 'service/g2/remoteService/status.json',
}

const g2TripStopCommand: RemoteCommand = {
  name: 'tripStop',
  type: 'triplogCommand',
  url: 'service/g2/triplogCommand/execute.json',
  statusUrl: 'service/g2/remoteService/status.json',
}

export interface TripTrackerRequest extends RemoteServiceRequestBase {
  expirationDate?: string
  triplogOn: boolean
}

/** Backend requires strings in a specific format */
export const formatExpirationDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${month}/${day}/${year}`
}

export const startTrip = async (
  expirationDate: string,
): Promise<RemoteServiceResponse> => {
  const vehicle = getCurrentVehicle()
  if (!vehicle) {
    return { success: false, errorCode: cNoVehicle }
  }
  const request: TripTrackerRequest = {
    expirationDate: expirationDate,
    triplogOn: true,
    vin: vehicle.vin,
    pin: '',
  }
  const response = await executeRemoteCommand(g2TripStartCommand, request, {
    requires: ['PIN', 'session', 'timestamp'],
  })
  return response
}

export const stopTrip = async (): Promise<RemoteServiceResponse> => {
  const vehicle = getCurrentVehicle()
  if (!vehicle) {
    return { success: false, errorCode: cNoVehicle }
  }
  const request: TripTrackerRequest = {
    triplogOn: false,
    vin: vehicle.vin,
    pin: '',
  }
  const response = await executeRemoteCommand(g2TripStopCommand, request, {
    requires: ['PIN', 'session', 'timestamp'],
  })
  return response
}
