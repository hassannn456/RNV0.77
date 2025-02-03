import {MSAOptions, mySubaruFetch} from '../../api';
import i18n from '../../i18n';
import {store} from '../../store';
import {CsfSimpleAlert} from '../../components';
import {sxmErrorMessage, sxmErrorTitle} from './sxmError';
import {promptPIN} from '../../screens/MgaPINCheck';
import {RemoteServiceStatusBase, RemoteServiceType} from '../../../@types';
import {trackRemoteServiceCommand} from '../../components/useTracking';

/**
 * Frontend name of remote command.
 *
 * Used to lookup translated status text for display.
 * Some commands have to be split ('unlock' => ['unlockDoors', 'unlockTailgate'])
 * So backend name is not reused here.
 **/
export type RemoteCommandName =
  | 'boundaryAlert'
  | 'boundaryAlertDeactivate'
  | 'cancelEngineStart'
  | 'cancelHornLights'
  | 'cancelLights'
  | 'cancelLock'
  | 'cancelUnlock'
  | 'chargeNow'
  | 'chargeNowNotConnected'
  | 'climateControlCancel'
  | 'climateControlStart'
  | 'climateControlStop'
  | 'curfewAlert'
  | 'curfewAlertDeactivate'
  | 'deleteChargeSchedule'
  | 'fetchChargeSettings'
  | 'fetchVehicleStatus'
  | 'hornLights'
  | 'lightsOnly'
  | 'locateVehicle'
  | 'lockDoors'
  | 'remoteEngineStart'
  | 'remoteEngineStop'
  | 'saveChargeSchedule'
  | 'speedAlert'
  | 'speedAlertDeactivate'
  | 'stopHornLights'
  | 'stopLights'
  | 'trip'
  | 'tripStart'
  | 'tripStop'
  | 'unlockDoors'
  | 'unlockTailgate'
  | 'valetMode'
  | 'valetModeReset'
  | 'valetModeStart'
  | 'valetModeStop'
  | 'valetModeGetSettings'
  | 'valetModeSaveSettings';

export interface RemoteServiceRequestBase {
  pin: string;
  vin: string;
}
export interface RemoteServiceResponse {
  success: boolean;
  errorCode?: string | null;
  dataName?: 'remoteServiceStatus';
  data?: RemoteServiceStatusBase<unknown>;
}
export interface RemoteCommand {
  name: RemoteCommandName;
  type: RemoteServiceType;
  url: string;
  statusUrl: string;
  stop?: RemoteCommand;
  cancel?: RemoteCommand;
}
export type RemoteCommandStatus = {
  command: RemoteCommand;
} & RemoteServiceStatusBase<unknown>;

/** Remote command structure with default properties sent.
 * Used to construct local messages.
 */
const emptyRemoteCommand = {
  serviceRequestId: '',
  success: true,
  cancelled: false,
  subState: null,
  errorCode: null,
  result: null,
  errorDescription: null,
};
export const dispatchRemoteCommandStatus = (
  status: RemoteCommandStatus,
): void => {
  store.dispatch({type: 'remoteStatus/show', payload: status});
  if (status.errorCode) {
    CsfSimpleAlert(
      sxmErrorTitle(status),
      sxmErrorMessage(
        status.errorCode,
        status.errorDescription,
        status.command.name,
      ),
      {type: 'error'},
    );
  }
};
export const cancelRemoteCommand = async <T extends RemoteServiceRequestBase>(
  command: RemoteCommand,
  parameters: T,
  options?: MSAOptions,
): Promise<RemoteServiceResponse> => {
  dispatchRemoteCommandStatus({
    ...emptyRemoteCommand,
    command: command,
    remoteServiceState: 'sent',
    remoteServiceType: command.type,
    updateTime: new Date().getTime(),
    vin: parameters.vin,
  });
  const response = await mySubaruFetch(
    {
      url: command.url,
      params: parameters,
      method: 'GET',
    },
    store.getState(),
    options,
  );
  return response as RemoteServiceResponse;
};
export const executeRemoteCommand = async <T extends RemoteServiceRequestBase>(
  command: RemoteCommand,
  parameters: T,
  options?: MSAOptions,
): Promise<RemoteServiceResponse> => {
  const delay: (ms: number) => Promise<void> = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  trackRemoteServiceCommand({
    commandName: command.name,
    type: 'start',
  });

  const requires = options?.requires ?? [];
  if (requires.includes('PIN')) {
    if (!parameters.pin) {
      const {t} = i18n;
      parameters.pin = await promptPIN({
        title: t(`command:${command.name}.name`),
      });
    }
    if (!parameters.pin) {
      return {success: false, errorCode: 'cancelled'};
    }
  }
  // starting timer after PIN entry
  const startTime = performance.now();
  dispatchRemoteCommandStatus({
    ...emptyRemoteCommand,
    command: command,
    remoteServiceState: 'sent',
    remoteServiceType: command.type,
    updateTime: new Date().getTime(),
    vin: parameters.vin,
  });
  const method = command.type == 'condition' ? 'GET' : 'POST';
  const initial = await mySubaruFetch(
    {
      url: command.url,
      body: method == 'POST' ? parameters : null,
      method: method,
    },
    store.getState(),
    {...options, suppressConnectionNotice: true},
  );
  if (
    initial.success &&
    (initial?.dataName == 'remoteServiceStatus' ||
      initial?.dataName == 'triplogCommandResponse')
  ) {
    let current = initial.data as RemoteServiceStatusBase<unknown>;
    dispatchRemoteCommandStatus({...current, command: command});

    let count = 0;
    while (current.remoteServiceState != 'finished') {
      const initialDelay =
        current.remoteServiceType == 'engineStart' ? 10000 : 5000;
      const time = count == 0 ? initialDelay : 3000;

      await delay(time);
      count = count + 1;
      const status = await mySubaruFetch(
        {
          url: command.statusUrl,
          params: {serviceRequestId: current.serviceRequestId},
          method: 'GET',
        },
        store.getState(),
        options,
      );
      if (status.success && status?.dataName == 'remoteServiceStatus') {
        current = status.data as RemoteServiceStatusBase<unknown>;
        dispatchRemoteCommandStatus({
          ...current,
          command: command,
        });
      } else {
        if (status.data) {
          dispatchRemoteCommandStatus({
            ...(status.data as RemoteCommandStatus),
            command: command,
            errorCode: status.errorCode ?? null,
          });
        } else {
          dispatchRemoteCommandStatus({
            ...emptyRemoteCommand,
            command: command,
            success: false,
            errorCode: status.errorCode ?? null,
            remoteServiceState: 'finished',
            remoteServiceType: command.type,
            updateTime: new Date().getTime(),
            vin: current.vin,
          });
        }
        return status as RemoteServiceResponse;
      }
    }

    // TODO:AG:20240607 - track completed
    trackRemoteServiceCommand({
      commandName: command.name,
      type: 'finish',
      success: current.success,
      errorCode: current?.errorCode || '',
      time: performance.now() - startTime,
    });

    return {
      success: current.success,
      data: current,
      errorCode: current?.errorCode?.split(':')?.[0],
    };
  } else {
    if (initial.data) {
      dispatchRemoteCommandStatus({
        ...(initial.data as RemoteCommandStatus),
        command: command,
        errorCode: initial.errorCode ?? null,
      });
    } else {
      dispatchRemoteCommandStatus({
        ...emptyRemoteCommand,
        command: command,
        success: false,
        errorCode: initial.errorCode ?? null,
        remoteServiceState: 'finished',
        remoteServiceType: command.type,
        updateTime: new Date().getTime(),
        vin: parameters.vin,
      });
    }
    return initial as RemoteServiceResponse;
  }
};

export const g2VehicleStatusRefresh: RemoteCommand = {
  name: 'fetchVehicleStatus',
  type: 'vehicleStatus',
  url: '/service/g2/vehicleStatusRefresh/execute.json',
  statusUrl: '/service/g2/vehicleCondition/status.json',
};
