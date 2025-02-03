import { VehicleConditionStatusResponse } from '../../../@types'
import { cNoVehicle } from '../../api/account.api'
import { cNetworkError } from '../../api'
import i18n from '../../i18n'
import { store } from '../../store'
import { alertBadConnection, CsfSimpleAlert } from '../../components'
import { getVehicleGeneration } from '../../utils/vehicle'
import { getCurrentVehicle } from '../auth/sessionSlice'
import {
  executeRemoteCommand,
  RemoteCommand,
  RemoteServiceRequestBase,
  RemoteServiceResponse,
} from './remoteService.api'

const g1Lock: RemoteCommand = {
  name: 'lockDoors',
  type: 'lock',
  url: 'service/g1/lock/execute.json',
  statusUrl: 'service/g1/remoteService/status.json',
}

const g2Lock: RemoteCommand = {
  name: 'lockDoors',
  type: 'lock',
  url: 'service/g2/lock/execute.json',
  statusUrl: 'service/g2/remoteService/status.json',
}

const doorAjar: RemoteCommand = {
  name: 'lockDoors',
  type: 'condition',
  url: 'service/g2/condition/execute.json',
  statusUrl: 'service/g2/remoteService/status.json',
}

export interface RemoteLockRequest extends RemoteServiceRequestBase {
  delay: number
  forceKeyInCar: boolean
}

export const lockDoors = async (
  parameters?: RemoteLockRequest,
): Promise<RemoteServiceResponse> => {
  const vehicle = getCurrentVehicle()
  if (!vehicle) {
    return { success: false, errorCode: cNoVehicle }
  }
  const request: RemoteLockRequest = {
    delay: parameters?.delay ?? 0,
    forceKeyInCar: parameters?.forceKeyInCar ?? false,
    vin: parameters?.vin ?? vehicle.vin,
    pin: parameters?.pin ?? '',
  }
  const generation = getVehicleGeneration(vehicle)
  const command = generation == 1 ? g1Lock : g2Lock
  const response = await executeRemoteCommand(command, request, {
    allowSessionRenewal: true,
    requires: ['PIN', 'session', 'timestamp'],
  })
  if (response.success && response.data?.success) {
    store.dispatch({
      type: 'preferences/triggerAppReview',
      payload: {
        key: 'appRating',
        value: 'lockCommandCount',
      },
    })
    if (generation != 1) {
      await doorAjarCheck()
    }
  } else if (response?.errorCode == cNetworkError) {
    alertBadConnection()
  }
  return response
}

/** Check doors after lock command. Only used on gen 2 or newer. */
export const doorAjarCheck = async (): Promise<void> => {
  // PIN and VIN are unused here. May make optional in interface.
  const condition = await executeRemoteCommand(
    doorAjar,
    { pin: '', vin: '' },
    {
      requires: ['session', 'timestamp'],
    },
  )
  const result = condition.data?.result as VehicleConditionStatusResponse
  if (!result) {
    return
  }
  const { t } = i18n
  const openDoors: string[] = []
  result.doorFrontLeftPosition == 'OPEN' &&
    openDoors.push(t('lockDoors:frontLeft'))
  result.doorFrontRightPosition == 'OPEN' &&
    openDoors.push(t('lockDoors:frontRight'))
  result.doorRearLeftPosition == 'OPEN' &&
    openDoors.push(t('lockDoors:rearLeft'))
  result.doorRearRightPosition == 'OPEN' &&
    openDoors.push(t('lockDoors:rearRight'))
  result.doorEngineHoodPosition == 'OPEN' &&
    openDoors.push(t('lockDoors:engineHood'))
  result.doorBootPosition == 'OPEN' && openDoors.push(t('lockDoors:trunk'))
  if (openDoors.length > 0) {
    CsfSimpleAlert(
      t('common:alert'),
      t('lockDoors:doorsAjar', {
        count: openDoors.length,
        doors: openDoors,
        defaultValue: '',
      }),
      {
        type: 'warning',
      },
    )
  }
}
