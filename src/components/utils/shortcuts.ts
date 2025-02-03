// cSpell:ignore rsvg
import Shortcuts, {ShortcutItem} from 'react-native-actions-shortcuts';
import i18n from '../../i18n';
import {mgaOpenURL} from './linking';
import {store} from '../../store';
import {
  ShortcutType,
  getAllowedShortcutsByVehicle,
} from '../../utils/shortcuts';
import {ClientSessionVehicle} from '../../../@types';
import {trackError} from '../useTracking';

/**
 * Per `react-native-actions-shortcuts` this is the name of the iOS Asset or Android drawable.
 *
 * Each asset must be:
 * - Added as an iOS Asset (pdf or png with JSON pointer) to Xcode
 * - Added as an Android drawable (svg or png with XML pointer) to Android Studio
 * - Named in a way compatible for Android drawable resources /^[a-z0-9-]+$/
 *
 * Add resources that have been converted to this list.
 *
 * I used `rsvg-convert -f pdf -o file.pdf file.svg` for iOS Asset creation.
 **/
type MgaShortcutItemIconName =
  | 'charge_now'
  | 'enter_service'
  | 'horn_lights'
  | 'locate'
  | 'lock'
  | 'phone'
  | 'rcc'
  | 'res'
  | 'roadside_assistance'
  | 'schedule_service'
  | 'select_retailer'
  | 'unlock';
/** Shortcut wrapper with MGA routing data */
export interface MgaShortcutItem extends ShortcutItem {
  iconName: MgaShortcutItemIconName;
  data: {type: 'link'; url: string};
}

/** Handle shortcuts */
export const mgaHandleShortcut = (item: MgaShortcutItem | null): boolean => {
  if (!item) return false;
  switch (item.data.type) {
    case 'link':
      mgaOpenURL(item.data.url)
        .then()
        .catch(trackError('shortcuts.ts::mgaHandleShortcut'));
      return true;
  }
};

const mgaCurrentShortcuts = (
  vehicle: ClientSessionVehicle | null,
): MgaShortcutItem[] => {
  if (!vehicle) return [];
  const state = store.getState();
  if (state.keychain?.login?.rememberUserCheck == 'off') return [];
  const shortcuts = getAllowedShortcutsByVehicle(vehicle);
  const {t} = i18n;
  const shortcutToItem = (shortcut: ShortcutType): MgaShortcutItem => {
    switch (shortcut) {
      case 'charge_now':
        return {
          type: 'charge_now',
          title: t('shortcuts:chargeNow'),
          iconName: 'charge_now',
          data: {
            type: 'link',
            // url: `mysubaru://runRemoteCommand?name=chargeNow&vin=${vehicle.vin}`,
            url: 'mysubaru://ChargeReview', // MGA-2075 temporary fix
          },
        };
      case 'enter_service':
        return {
          type: 'enter_service',
          title: t('shortcuts:enterServiceHistory'),
          iconName: 'enter_service',
          data: {
            type: 'link',
            url: `mysubaru://AddHistory?vin=${vehicle.vin}`,
          },
        };
      case 'horn_lights':
        return {
          type: 'horn_lights',
          title: t('shortcuts:hornLights'),
          iconName: 'horn_lights',
          data: {
            type: 'link',
            url: `mysubaru://runRemoteCommand?name=hornLights&vin=${vehicle.vin}`,
          },
        };

      case 'locate':
        return {
          type: 'locate',
          title: t('shortcuts:locateVehicle'),
          iconName: 'locate',
          data: {
            type: 'link',
            url: `mysubaru://runRemoteCommand?name=locate&vin=${vehicle.vin}`,
          },
        };
      case 'lock':
        return {
          type: 'lock',
          title: t('shortcuts:lockVehicle'),
          iconName: 'lock',
          data: {
            type: 'link',
            url: `mysubaru://runRemoteCommand?name=lock&vin=${vehicle.vin}`,
          },
        };
      case 'phone':
        return vehicle.preferredDealer?.phoneNumber
          ? {
              type: 'phone',
              title: t('shortcuts:contactDealer'),
              iconName: 'phone',
              data: {
                type: 'link',
                url: `tel://${vehicle.preferredDealer.phoneNumber}`,
              },
            }
          : shortcutToItem('select_retailer');
      case 'rcc':
        return {
          type: 'rcc',
          title: t('shortcuts:remoteClimateControl'),
          iconName: 'rcc',
          data: {
            type: 'link',
            url: `mysubaru://runRemoteCommand?name=engineStart&vin=${vehicle.vin}`,
          },
        };
      case 'res':
        return {
          type: 'res',
          title: t('shortcuts:remoteEngineStart'),
          iconName: 'res',
          data: {
            type: 'link',
            url: `mysubaru://runRemoteCommand?name=engineStart&vin=${vehicle.vin}`,
          },
        };
      case 'roadside_assistance':
        return {
          type: 'roadside_assistance',
          title: t('shortcuts:roadSideAssistance'),
          iconName: 'roadside_assistance',
          data: {
            type: 'link',
            url: t('contact:customerSupportLink'),
          },
        };
      case 'schedule_service':
        return {
          type: 'schedule_service',
          title: t('shortcuts:scheduleService'),
          iconName: 'schedule_service',
          data: {
            type: 'link',
            url: `mysubaru://Scheduler?vin=${vehicle.vin}`,
          },
        };
      case 'select_retailer':
        return {
          type: 'select_retailer',
          title: t('shortcuts:selectPreferredDealer'),
          iconName: 'select_retailer',
          data: {
            type: 'link',
            url: `mysubaru://RetailerSearch?vin=${vehicle.vin}`,
          },
        };
      case 'unlock':
        return {
          type: 'unlock',
          title: t('shortcuts:unlockVehicle'),
          iconName: 'unlock',
          data: {
            type: 'link',
            url: `mysubaru://runRemoteCommand?name=unlock&vin=${vehicle.vin}`,
          },
        };
    }
  };
  const items = shortcuts.map(shortcutToItem).slice(0, 4);
  return items;
};

/** Load current allowed shortcuts. */
export const mgaLoadShortcuts = (
  vehicle: ClientSessionVehicle | null,
): void => {
  Shortcuts.setShortcuts(mgaCurrentShortcuts(vehicle))
    .then()
    .catch(trackError('shortcuts.ts::mgaLoadShortcuts'));
};
