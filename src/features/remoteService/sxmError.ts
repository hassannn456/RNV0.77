// cSpell:ignore Plugedin, Pluggedin, RUNNINGONBACKUPBATTERY, timeframe
import { cNetworkError } from '../../api'
import i18n from '../../i18n'
import { getPINLockoutTimeMinutes } from '../../utils/vehicle'
import { getCurrentVehicle } from '../auth/sessionSlice'
import { RemoteCommandName, RemoteCommandStatus } from './remoteService.api'

export const sxmErrorTitle = (_status: RemoteCommandStatus): string => {
  const { t } = i18n
  return t('common:error')
}

/** Convert server error codes to translated strings. */
export const sxmErrorMessage = (
  sxmErrorCode: string | null,
  errorDescription: string | null,
  commandName: RemoteCommandName | null,
): string => {
  const { t } = i18n
  const command = commandName ? t(`${commandName}.name`) : ''
  const vehicle = getCurrentVehicle()
  const modelName = vehicle?.modelName
  // Errors use the form "NegativeAcknowledge:fuelLevelTooLow"
  // But i18next uses ":" to delimit data sources (files)
  // Swapping the character before building error message
  const errorCode = sxmErrorCode?.replace(':', '_')
  switch (errorCode) {
    case 'DOOR_AJAR':
    case 'OTHER':
    case 'SXM40004':
    case 'SXM40005':
    case 'SXM40006':
    case 'NegativeAcknowledge_maxNumRemoteEngineStartExceeded':
    case 'NegativeAcknowledge_vehicleNotPlugedin':
    case 'NegativeAcknowledge_vehicleIsNotPluggedin':
    case 'NegativeAcknowledge_noSlotsLeft':
    case 'DEVICE_NOT_AUTHENTICATED':
      return t(`remoteService:${errorCode}`)
    case 'SXM40017': {
      return t(`remoteService:${errorCode}`, {
        minutes: getPINLockoutTimeMinutes(vehicle),
      })
    }
    case 'NegativeAcknowledge_fuelLevelTooLow': {
      const value = parseInt(t('units:volumeFuelLevelTooLow') ?? '5')
      const unit: string = t('units:volumeUnits') ?? 'gallon'
      const format = new Intl.NumberFormat(undefined, {
        style: 'unit',
        unit: unit,
        unitDisplay: 'long',
      })
      const result: string = t(`remoteService:${errorCode}`, {
        volume: format.format(value),
        defaultValue: 'zz',
      })
      return result
    }
    case 'NegativeAcknowledge_engineHoodNotClosed':
    case 'NegativeAcknowledge_doorNotClosed': // No message for specific doors
    case 'NegativeAcknowledge_vehicleNotStationary':
    case 'NegativeAcknowledge_accIsOn':
    case 'NegativeAcknowledge_accOn':
    case 'NegativeAcknowledge_ignitionOn':
    case 'NegativeAcknowledge_ignitionIsOn':
    case 'NegativeAcknowledge_securityAlarmOn':
    case 'NegativeAcknowledge_keyInIgnition':
    case 'NegativeAcknowledge_keyIsInIgnition': {
      return t(`remoteService:${errorCode}`, {
        command: command,
        modelName: modelName,
      })
    }
    case 'NegativeAcknowledge_runningOnBackupBattery':
    case 'NEGATIVE_ACKNOWLEDGE_[RUNNINGONBACKUPBATTERY]': {
      if (
        commandName == 'boundaryAlert' ||
        commandName == 'speedAlert' ||
        commandName == 'curfewAlert'
      ) {
        return t('remoteService:runningOnBackupBatteryAlerts', {
          command: command,
          modelName: modelName,
        })
      } else {
        return t(`remoteService:${errorCode}`, {
          command: command,
          modelName: modelName,
        })
      }
    }
    case 'NegativeAcknowledge_otherCommandsOngoing':
    case 'SXM40009':
    case 'ServiceAlreadyStarted':
      if (
        commandName == 'boundaryAlert' ||
        commandName == 'speedAlert' ||
        commandName == 'curfewAlert'
      ) {
        return t('remoteService:commandInProcessUpdating', {
          command: command,
          modelName: modelName,
        })
      } else if (commandName == 'trip') {
        return t('remoteService:commandInProcessTrips', {
          command: command,
          modelName: modelName,
        })
        // } else if (false) {
        // valetSetting - requirements?
        // return t('remoteService:valetIsOnError')
      } else {
        return t('remoteService:commandInProcess', {
          command: command,
          modelName: modelName,
        })
      }
    case 'NegativeAcknowledge_mfdInUse':
    case 'NegativeAcknowledge_unknown': {
      return t(`remoteService:${errorCode}`, {
        command: command,
      })
    }
    case 'InvalidCredentials': {
      if (!vehicle?.remoteServicePinExist) {
        return t(`remoteService:${errorCode}.pinNotSet`)
      }
      if (errorDescription?.includes('blocked')) {
        return t(`remoteService:${errorCode}.lockedPin`, {
          minutes: getPINLockoutTimeMinutes(vehicle),
        })
      }
      return t(`remoteService:${errorCode}.invalidPin`)
    }
    case 'NegativeAcknowledge_pinNotSetInHeadUnit':
      // Existing app clears a valet flag here. Re-check during valet implementation.
      return t(`remoteService:${errorCode}`)
    case 'NegativeAcknowledge_headUnitNotAvailable':
      // Existing app clears a valet flag here. Re-check during valet implementation.
      // Need to add valet logic
      return t('remoteService:sxmErrorDefault')
    case 'TimeframePassed':
    case 'TimeframePassed_null':
      return t('remoteService:TimeframePassed_null')
    case 'NegativeAcknowledge_inCarCommunicationFailure':
      return t('remoteService:inCarCommunicationFailure', {
        command: command,
        modelName: modelName,
      })
    case 'NegativeAcknowledge_invalidParameter':
      return t('remoteService:invalidParameter', {
        command: command,
        modelName: modelName,
      })
    case 'NegativeAcknowledge_headUnitIsBusy':
      return t('remoteService:headUnitIsBusy', {
        command: command,
        modelName: modelName,
      })
    case 'NegativeAcknowledge_engineMalfunction':
      return t('remoteService:engineMalfunction', {
        command: command,
        modelName: modelName,
      })
    case 'NegativeAcknowledge_sameCommandOngoing':
      return t('remoteService:sameCommandOngoing', {
        command: command,
        modelName: modelName,
      })
    case cNetworkError:
      return t('message:notConnectedRemoteCommands')
    default:
      if (errorCode?.startsWith('timeframe')) {
        return t('remoteService:TimeframePassed_null')
      } else {
        return t('remoteService:sxmErrorDefault')
      }
  }
}
