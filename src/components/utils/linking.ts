// cSpell:ignore Doesnt
import {Linking} from 'react-native';
import {navigate} from '../../Controller';
import {
  getCurrentVehicle,
  loginStatusReducer,
} from '../../features/auth/sessionSlice';
import {store} from '../../store';
import {validateTomTomNavigation} from '../../screens/subscriptions/MgaLiveTrafficQRLanding';
import {selectVehicleIfNotActive} from '../../api/account.api';
import i18n from '../../i18n';
import {CsfSimpleAlert} from '../CsfSimpleAlert';
import {runRemoteCommand} from './remoteCommands';

type Action = (() => Promise<boolean>) | null;
interface ActionsState {
  current: Action | null;
  running: boolean;
}
let actionsQueue: ActionsState | null = null;

const initQueue = () => {
  actionsQueue = {current: null, running: false};
};

/** Run pending tasks, if any. */
export const runQueue = (): void => {
  if (!actionsQueue) {
    console.error('Queue init failed. Running jobs paused.');
    return;
  }
  if (actionsQueue.running) return;
  const action = actionsQueue?.current;
  if (action) {
    actionsQueue.running = true;
    action()
      .then(ok => {
        if (!actionsQueue) {
          console.error('Queue init failed. Running jobs paused.');
          return;
        }
        if (ok) {
          actionsQueue.current = null;
        } else {
          setTimeout(runQueue, 1000);
        }
        actionsQueue.running = false;
      })
      .catch(console.error);
  }
};

/**
 * When a deeplink, push notification or shortcut
 * is received by the application, resolution may have to wait
 * until login is complete. Queued actions are stored here.
 *
 * Currently, only the last action is saved. Others are dropped.
 **/
export const enqueueAction = (
  action: Action,
  ms?: number | undefined,
): void => {
  // Init queue if first delayed action
  if (!actionsQueue) {
    initQueue();
    enqueueAction(action);
    return;
  }
  // Currently, only the last action is saved. Others are dropped.
  if (actionsQueue.current) {
    console.error('Queue capacity exceeded. Some actions may be dropped.');
  }
  actionsQueue.current = action;
  // Schedule task
  setTimeout(runQueue, ms);
};

const deepLinkPattern = /^(.*):\/\/(.*)$/;
/** Handle deep links. */
export const mgaHandleDeepLink = (link: string | null): boolean => {
  const {t} = i18n;
  if (!link) return false;
  const match = deepLinkPattern.exec(link);
  if (!match) return false;
  const [_, _schema, uri] = match;
  if (!uri) return false;
  const tryDeeplinkNavigation = async () => {
    const isLoggedIn = loginStatusReducer(store.getState());
    const [path, queryString] = uri.split('?');
    if (!path) return false;
    const params: Record<string, string> = {};
    if (queryString) {
      try {
        queryString.split('&').forEach(pair => {
          const [key, value] = pair.split('=');
          params[key] = value;
        });
        if (params.vin) {
          const sessionCheck = await selectVehicleIfNotActive({
            vin: params.vin,
          });
          if (!sessionCheck.success) {
            return false;
          }
        }
      } catch (error) {
        console.error(error);
        return false;
      }
    }
    const vehicle = getCurrentVehicle();
    if (isLoggedIn && vehicle) {
      // Support for legacy QR code
      if (path == 'trafficConnect') {
        const liveTrafficScreen = await validateTomTomNavigation(vehicle);
        if (liveTrafficScreen) {
          navigate(liveTrafficScreen);
        } else {
          navigate('Dashboard');
          CsfSimpleAlert(
            t('tomtomQR:welcomeQr'),
            t('tomtomQR:vinDoesntHaveTTTCap', {
              modelYear: `${vehicle?.modelYear ? vehicle.modelYear : '--'} ${
                vehicle?.modelName ? vehicle.modelName : '--'
              }`,
            }),
            {
              type: 'warning',
            },
          );
        }
      } else if (path == 'runRemoteCommand') {
        const {name, vin} = params;
        if (name && vin) {
          await runRemoteCommand(name, vin);
        }
      } else {
        navigate(path);
      }
      return true;
    } else {
      return false;
    }
  };
  enqueueAction(tryDeeplinkNavigation, 0);
  return true;
};

/**
 * Wrapper for Linking::openURL.
 *
 * Checks for mysubaru:// URLs
 * and opens locally to workaround an issue (MGA-936)
 * if users have multiple copies of app installed.
 **/
const mgaOpenURL = async (url: string): Promise<any> => {
  if (url.startsWith('mysubaru://')) {
    return mgaHandleDeepLink(url);
  } else {
    // Linking.openURL has a defined type of Promise<any>
    // eslint-disable-next-line
    return await Linking.openURL(url);
  }
};

export default mgaOpenURL;
