import {selectVehicleIfNotActive} from '../../api/account.api';
import {store} from '../../store';
import {climateApi} from '../../features/remoteService/climate.api';
import {engineStart} from '../../features/remoteService/engine.car';
import {hornLights} from '../../features/remoteService/hornLights.car';
import {locateVehicle} from '../../features/remoteService/locateVehicle.car';
import {lockDoors} from '../../features/remoteService/lockDoors.car';
import {phevChargeNow} from '../../features/remoteService/phev.car';
import {RemoteServiceResponse} from '../../features/remoteService/remoteService.api';
import {unlockDoors} from '../../features/remoteService/unlockDoors.car';

export const runRemoteCommand = async (
  name: string,
  vin: string,
): Promise<RemoteServiceResponse> => {
  const sessionCheck = await selectVehicleIfNotActive({vin});
  if (!sessionCheck.success) {
    // Bubble up errorCode without creating a new object
    return sessionCheck as unknown as RemoteServiceResponse;
  }
  switch (name) {
    case 'engineStart': {
      const request =
        climateApi.endpoints.remoteEngineQuickStartSettingsFetch.initiate(
          undefined,
        );
      const response = await store.dispatch(request).unwrap();
      if (response.success && response.data) {
        return await engineStart(response.data);
      } else {
        // Bubble up errorCode without creating a new object
        return response as unknown as RemoteServiceResponse;
      }
    }
    case 'chargeNow': {
      return await phevChargeNow();
    }
    case 'locate': {
      return await locateVehicle();
    }
    case 'lock': {
      return await lockDoors();
    }
    case 'unlock': {
      return await unlockDoors();
    }
    case 'hornLights': {
      return await hornLights();
    }
    default:
      return {success: false, errorCode: 'INVALID_COMMAND'};
  }
};
