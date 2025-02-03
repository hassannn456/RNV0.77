// cSpell:ignore RTGU
import { cNoVehicle } from '../../api/account.api'
import i18n from '../../i18n'
import { promptSelect } from '../../screens/MgaModalSelect'
import { getVehicleGeneration } from '../../utils/vehicle'
import { getCurrentVehicle } from '../auth/sessionSlice'
import {
  executeRemoteCommand,
  RemoteCommand,
  RemoteServiceRequestBase,
  RemoteServiceResponse,
} from './remoteService.api'

export const g1Unlock: RemoteCommand = {
  name: 'unlockDoors',
  type: 'unlock',
  url: 'service/g1/unlock/execute.json',
  statusUrl: 'service/g1/remoteService/status.json',
}

export const g2Unlock: RemoteCommand = {
  name: 'unlockDoors',
  type: 'unlock',
  url: 'service/g2/unlock/execute.json',
  statusUrl: 'service/g2/remoteService/status.json',
}

export type RemoteUnlockDoorType =
  | 'ALL_DOORS_CMD'
  | 'FRONT_LEFT_DOOR_CMD'
  | 'TAILGATE_DOOR_CMD'

export interface RemoteUnlockRequest extends RemoteServiceRequestBase {
  unlockDoorType?: RemoteUnlockDoorType
  delay: number
}
export const unlockDoors = async (
  parameters?: RemoteUnlockRequest,
): Promise<RemoteServiceResponse> => {
  const vehicle = getCurrentVehicle()
  if (!vehicle) {
    return { success: false, errorCode: cNoVehicle }
  }
  const request: RemoteUnlockRequest = {
    delay: parameters?.delay ?? 0,
    unlockDoorType: parameters?.unlockDoorType,
    vin: parameters?.vin ?? vehicle.vin,
    pin: parameters?.pin ?? '',
  }
  if (getVehicleGeneration(vehicle) == 1) {
    return await executeRemoteCommand(g1Unlock, request, {
      allowSessionRenewal: true,
      requires: ['PIN', 'session', 'timestamp'],
    })
  } else {
    const { t } = i18n
    const tailgate = vehicle.features?.includes('RTGU')
    const allowedTypes: RemoteUnlockDoorType[] = tailgate
      ? ['ALL_DOORS_CMD', 'FRONT_LEFT_DOOR_CMD', 'TAILGATE_DOOR_CMD']
      : ['ALL_DOORS_CMD', 'FRONT_LEFT_DOOR_CMD']
    const unlockDoorType =
      request.unlockDoorType ??
      ((await promptSelect({
        trackingId: 'SelectUnlockDoors',
        title: t('unlockDoors:title'),
        options: allowedTypes.map(option => ({
          label: t(`unlockDoors:${option}`),
          value: option,
        })),
      })) as RemoteUnlockDoorType)
    if (!unlockDoorType) {
      return { success: false, errorCode: 'cancelled' }
    }
    const command: RemoteCommand =
      unlockDoorType == 'TAILGATE_DOOR_CMD'
        ? { ...g2Unlock, name: 'unlockTailgate' }
        : g2Unlock
    const response = await executeRemoteCommand(
      command,
      { ...request, unlockDoorType: unlockDoorType },
      {
        allowSessionRenewal: true,
        requires: ['PIN', 'session', 'timestamp'],
      },
    )
    return response
  }
}
