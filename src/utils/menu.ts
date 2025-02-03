import {ClientSessionVehicle} from '../../@types';
import {ScreenList} from '../Controller';

import {
  AccessRule,
  authorizedBilling,
  authorizedPIN,
  has,
  gen1Plus,
  gen2Plus,
  retailerHawaii,
  retailerNormal,
  capRPOIActive,
  subSafetyPlus,
  gen1PlusSubscribed,
  gen3Plus,
} from '../features/menu/rules';

export type Menu =
  | 'starlink'
  | 'service'
  | 'subscriptionServices'
  | 'support'
  | 'myProfile'
  | 'language'
  | 'securitySettings'
  | 'internalDevelopment';
/** Push submenu on press. */
export interface MenuItemShowSubMenu {
  type: 'menu';
  menu: Menu;
}
/** Navigation id to push on press. */
export interface MenuItemShowScreen {
  type: 'screen';
  screen: keyof ScreenList;
}
/** External URL */
export interface MenuItemURL {
  type: 'url';
  url: string;
}
export type MenuItemOnPress =
  | MenuItemShowSubMenu
  | MenuItemShowScreen
  | MenuItemURL;
export type MenuItem = MenuItemOnPress & {
  /** Key for translated menu item label */
  i18n?: string;
  /** Identifier of parent menu. Used to connect submenus. */
  parent?: Menu;
  /** Rule for showing item */
  access?: AccessRule;
  /** temporary way to distinguish different display style/sections for new menu design.
   * needs to be rethought for primetime   */
  displayMeta?: 'footer';
};

export const menuItems: MenuItem[] = [
  // Main menu
  {
    type: 'screen',
    i18n: 'common:loadingVehicle',
    screen: 'MyVehicles',
  },
  {
    type: 'menu',
    menu: 'starlink',
    i18n: 'index:starlinkConnectedServices',
    access: {not: 'cap:g0'},
  },
  {type: 'menu', menu: 'service', i18n: 'index:service'},
  {
    type: 'menu',
    menu: 'subscriptionServices',
    i18n: 'index:subscriptionServices',
    access: ['usr:primary'],
  },
  {
    type: 'screen',
    i18n: 'branding:roadsideAssistance',
    screen: 'RoadsideAssistance',
  },
  {
    type: 'menu',
    menu: 'support',
    i18n: 'helpAndSupport:support',
  },
  {
    type: 'menu',
    menu: 'myProfile',
    i18n: 'index:myProfile',
  },
  {
    type: 'screen',
    i18n: 'branding:myRetailer',
    screen: 'Retailer',
    access: retailerNormal,
  },
  {
    type: 'screen',
    i18n: 'branding:myRetailer',
    screen: 'RetailerHawaii',
    access: retailerHawaii,
  },
  {
    type: 'screen',
    i18n: 'common:language',
    screen: 'Languages',
    access: 'lng:multiple',
  },
  {
    type: 'menu',
    menu: 'internalDevelopment',
    i18n: 'internalDevelopment:main',
    access: 'env:qa',
    displayMeta: 'footer',
  },
  {
    type: 'screen',
    i18n: 'biometrics:_settingsTitle',
    screen: 'AppSettings',
    displayMeta: 'footer',
  },
  {
    type: 'screen',
    i18n: 'legalDisclaimers:title',
    screen: 'LegalDisclaimers',
    displayMeta: 'footer',
  },
  {
    type: 'url',
    i18n: 'legalDisclaimers:privacyPolicy',
    url: 'urls:privacyPolicy',
    displayMeta: 'footer',
  },
  {
    type: 'screen',
    i18n: 'index:logout',
    screen: 'Login',
    displayMeta: 'footer',
  },
  // Starlink submenu
  {
    type: 'screen',
    parent: 'starlink',
    i18n: 'remoteService:title',
    screen: 'RemoteService',
  },
  {
    type: 'screen',
    parent: 'starlink',
    i18n: 'index:driverAlerts',
    screen: 'DriverAlerts',
  },
  {
    type: 'screen',
    parent: 'starlink',
    i18n: 'tripSearch:trips',
    screen: 'TripsLanding',
    access: ['cap:g2', 'res:*', 'cap:RPOI', {not: 'cap:TLD'}],
  },
  {
    type: 'screen',
    parent: 'starlink',
    i18n: 'tripLog:myTrips',
    screen: 'TripsGen3Landing',
    access: [gen3Plus, 'res:*', 'cap:RPOI'],
  },
  {
    type: 'screen',
    parent: 'starlink',
    i18n: 'tripLog:tripTracker',
    screen: 'TripTrackingLanding',
    access: [
      gen3Plus,
      'cap:TLD',
      {not: 'cap:RPOI'},
      'flg:mga.remote.tripTracker',
    ],
  },
  {
    type: 'screen',
    parent: 'starlink',
    i18n: 'vehicleDiagnostics:title',
    screen: 'VehicleDiagnostics',
  },
  {
    type: 'screen',
    parent: 'starlink',
    i18n: 'usageReport:title',
    screen: 'UsageReport',
    access: [gen2Plus, 'res:*', 'flg:mga.usageReport'],
  },
  {
    type: 'screen',
    parent: 'starlink',
    i18n: 'vehicleHealth:title',
    screen: 'VehicleHealthReport',
  },
  {
    type: 'url',
    parent: 'starlink',
    i18n: 'index:caUserGuides',
    url: 'index:caUserGuideURL',
    access: [gen2Plus, 'res:*', 'flg:sci.userGuides'],
  },
  // Subscription submenu
  {
    type: 'screen',
    parent: 'subscriptionServices',
    i18n: 'subscriptionServices:title',
    screen: 'SubscriptionServicesLanding',
    access: ['reg:US', 'usr:primary'],
  },
  {
    type: 'screen',
    parent: 'subscriptionServices',
    i18n: 'subscriptionServices:title',
    screen: 'SciSubscriptionServiceLanding',
    access: ['reg:CA', 'usr:primary'],
  },
  {
    type: 'screen',
    parent: 'subscriptionServices',
    i18n: 'invoices:title',
    screen: 'Invoices',
    access: [gen2Plus, 'usr:primary'],
  },
  // Service submenu
  {
    type: 'screen',
    parent: 'service',
    i18n: 'scheduleService:title',
    screen: 'Scheduler',
  },
  {
    type: 'screen',
    parent: 'service',
    i18n: 'serviceReminder:title',
    screen: 'ServiceReminder',
  },
  {
    type: 'screen',
    parent: 'service',
    i18n: 'serviceLanding:serviceHistory',
    screen: 'ServiceHistory',
  },
  {
    type: 'screen',
    parent: 'service',
    i18n: 'common:maintenanceSchedule',
    screen: 'MaintenanceSchedule',
  },
  {
    type: 'screen',
    parent: 'service',
    i18n: 'serviceLanding:enterService',
    screen: 'AddHistory',
  },
  {
    type: 'screen',
    parent: 'service',
    i18n: 'recalls:title',
    screen: 'Recalls',
  },
  {
    type: 'screen',
    parent: 'service',
    i18n: 'index:warrantyExtended',
    screen: 'Warranty',
  },
  {
    type: 'screen',
    parent: 'service',
    i18n: 'certifiedCollisionCenters:title',
    screen: 'CollisionCenterLanding',
    access: 'flg:mga.certifiedCollision',
  },
  {
    type: 'screen',
    parent: 'service',
    i18n: 'OTASoftwareUpdate:title',
    screen: 'OTASoftwareUpdateLanding',
    // TODO:RS:20241101: Remove ENV QA flag after Testing is done
    access: 'flg:mga.otaSoftwareUpdates',
  },
  // Support submenu
  {
    type: 'screen',
    parent: 'support',
    i18n: 'branding:roadsideAssistance',
    screen: 'RoadsideAssistance',
  },
  {
    type: 'screen',
    parent: 'support',
    i18n: 'subaruCustomerCare:subaruCustomerSupport',
    screen: 'SubaruCustomerCare',
  },
  {
    type: 'screen',
    parent: 'support',
    i18n: 'attWifiHotspot:title',
    screen: 'AttWifiHotspot',
    access: [gen2Plus, 'reg:US'],
  },
  {
    type: 'screen',
    parent: 'support',
    i18n: 'starlinkCustomerCare:title',
    screen: 'StarlinkCustomerCare',
    access: {not: 'sub:NONE'},
  },
  {
    type: 'screen',
    parent: 'support',
    i18n: 'branding:myRetailer',
    screen: 'Retailer',
    access: retailerNormal,
  },
  {
    type: 'screen',
    parent: 'support',
    i18n: 'branding:myRetailer',
    screen: 'RetailerHawaii',
    access: retailerHawaii,
  },
  {
    type: 'screen',
    parent: 'support',
    i18n: 'tipsInfo:title',
    screen: 'TipsInfo',
  },
  // Profile submenu
  {
    type: 'screen',
    parent: 'myProfile',
    i18n: 'common:contactInformation',
    screen: 'MyProfileView',
  },
  {
    type: 'menu',
    parent: 'myProfile',
    i18n: 'index:securitySettings',
    menu: 'securitySettings',
  },
  {
    type: 'screen',
    parent: 'myProfile',
    i18n: 'valetMode:valetMode',
    screen: 'ValetMode',
    access: ['cap:VALET', 'res:*', {or: ['usr:primary', 'usr:secondary:1']}],
  },
  {
    type: 'screen',
    parent: 'myProfile',
    i18n: 'emergencyContacts:title',
    screen: 'EmergencyContacts',
    access: authorizedBilling,
  },
  {
    type: 'screen',
    parent: 'myProfile',
    i18n: 'communicationPreferences:communicationPreferenceTitle',
    screen: 'CommunicationPreferences',
    access: gen1PlusSubscribed,
  },
  {
    type: 'screen',
    parent: 'myProfile',
    i18n: 'billingInformation:title',
    screen: 'BillingInformationView',
    access: [
      gen2Plus,
      'usr:primary',
      {
        or: ['sub:SAFETY', 'sub:TRAFFIC_CONNECT'],
      },
    ],
  },
  {
    type: 'screen',
    parent: 'myProfile',
    i18n: 'vehicleLocationTracking:title',
    screen: 'VehicleLocationTracking',
    access: [gen2Plus, subSafetyPlus, 'flg:mga.preferences.vehicleLocation'],
  },
  {
    type: 'screen',
    parent: 'myProfile',
    i18n: 'textOptOut:indexTitle',
    screen: 'TextOptOut',
    access: 'flg:sci.profile.textOptOut',
  },
  {
    type: 'screen',
    parent: 'myProfile',
    i18n: 'appleWatch:title',
    screen: 'AppleWatch',
    access: [gen2Plus, subSafetyPlus, 'os:ios', 'flg:mga.watch'],
  },
  // Security submenu
  {
    type: 'screen',
    parent: 'securitySettings',
    i18n: 'changePassword:title',
    screen: 'ChangePassword',
  },
  {
    type: 'screen',
    parent: 'securitySettings',
    i18n: 'forgotPin:title',
    screen: 'ResetPin',
    access: authorizedPIN,
  },
  {
    type: 'screen',
    parent: 'securitySettings',
    i18n: 'authorizedUsers:title',
    screen: 'AuthorizedUsers',
    access: [
      'usr:primary',
      {
        or: [
          [gen2Plus, 'sub:SAFETY'],
          ['cap:g1', 'res:*'],
        ],
      },
    ],
  },
  {
    type: 'screen',
    parent: 'securitySettings',
    i18n: 'valetPasscodeReset:title',
    screen: 'ValetPasscodeReset',
    access: ['cap:VALET', 'res:*'],
  },
  // Language

  // Internal Development
  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'internalDevelopment:keychainSavedPins',
    screen: 'IDPinReset',
    access: 'env:qa',
  },
  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'internalDevelopment:vehicleAccountAttributes',
    screen: 'IDVehicleAccountAttributes',
    access: 'env:qa',
  },
  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'internalDevelopment:actions',
    screen: 'IDActions',
    access: 'env:qa',
  },
  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'internalDevelopment:adobeTracking',
    screen: 'IDAdobeTracking',
    access: 'env:qa',
  },
  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'internalDevelopment:alertBars',
    screen: 'IDAlertBars',
    access: 'env:qa',
  },
  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'internalDevelopment:valet',
    screen: 'IDValet',
    access: 'env:qa',
  },
  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'internalDevelopment:boxes',
    screen: 'IDElements',
    access: 'env:qa',
  },
  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'internalDevelopment:windowShade',
    screen: 'IDWindowShade',
    access: 'env:qa',
  },

  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'internalDevelopment:buttons',
    screen: 'IDControls',
    access: 'env:qa',
  },
  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'internalDevelopment:forms',
    screen: 'IDForms',
    access: 'env:qa',
  },

  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'internalDevelopment:formsPlus',
    screen: 'IDFormsPlus',
    access: 'env:qa',
  },
  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'internalDevelopment:hero',
    screen: 'IDHero',
    access: 'env:qa',
  },
  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'Markdown',
    screen: 'IDMarkdown',
    access: 'env:qa',
  },
  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'internalDevelopment:icons',
    screen: 'IDIcons',
    access: 'env:qa',
  },
  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'appRating:mySubaruAppFeedback',
    screen: 'IDRateUsPrompt',
    access: 'env:qa',
  },
  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'internalDevelopment:toggle',
    screen: 'IDToggle',
    access: 'env:qa',
  },
  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'internalDevelopment:tabs',
    screen: 'IDTabs',
    access: 'env:qa',
  },
  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'internalDevelopment:typography',
    screen: 'IDTypography',
    access: 'env:qa',
  },

  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'internalDevelopment:miscellaneous',
    screen: 'IDUtils',
    access: 'env:qa',
  },

  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'internalDevelopment:pumps',
    screen: 'IDPumps',
    access: 'env:qa',
  },

  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'i18n Tester',
    screen: 'IDHash',
    access: 'env:qa',
  },
  {
    type: 'screen',
    parent: 'internalDevelopment',
    i18n: 'internalDevelopment:survey',
    screen: 'IDVerint',
    access: 'env:qa',
  },
];

export const getMenuItem: (menu?: Menu) => MenuItem | undefined = menu => {
  return menuItems.filter(m => m.type == 'menu' && m.menu == menu)[0];
};

export const getMenuChildren = (
  menu?: Menu,
  vehicle?: ClientSessionVehicle | null,
): MenuItem[] => {
  if (!vehicle) return [];
  return menuItems.filter(m => {
    if (m.parent != menu) {
      return false;
    }
    switch (m.type) {
      case 'menu':
        if (m.access && !has(m.access, vehicle)) {
          return;
        }
        return getMenuChildren(m.menu, vehicle).length > 0;
      case 'screen':
        return canAccessScreen(m.screen, vehicle);
      case 'url':
        return !m.access || has(m.access);
    }
  });
};

/**
 * Screen level access test.
 *
 * Closes over menu tree, but will eventually replace.
 * Too many places outside menus need the same tests.
 */
export const canAccessScreen: (
  screen: keyof ScreenList,
  vehicle?: ClientSessionVehicle | null,
) => boolean = (screen, vehicle) => {
  switch (screen) {
    case 'DriverAlerts':
      return has(
        [gen2Plus, 'res:*', {or: ['usr:primary', 'usr:secondary:1']}],
        vehicle,
      );
    case 'Coupons':
    case 'MessageCenterLanding':
      return has(['reg:US', {not: 'reg:HI'}, 'flg:mga.offersEvents'], vehicle);
    case 'Scheduler':
      // MGA-1579 -removed access restriction of Scheduler for Hawaii safety & security users
      return true;
    case 'SubscriptionEnrollment':
    case 'SubscriptionManage':
    case 'SubscriptionModify':
    case 'SubscriptionUpgrade':
      return has([gen2Plus, 'usr:primary'], vehicle);
    case 'LiveTrafficManage':
    case 'LiveTrafficQRLanding':
    case 'LiveTrafficSubscription':
      return has(
        ['cap:TRAFFIC', {not: 'car:RightToRepair'}, 'usr:primary'],
        vehicle,
      );
    case 'Login':
      return true;
    case 'RemoteService':
      return has([gen1Plus, {not: 'car:RightToRepair'}], vehicle);
    case 'CommunicationPreferences':
      return has(
        {
          or: [
            [gen2Plus, subSafetyPlus],
            ['cap:g1', subSafetyPlus, 'usr:primary'],
          ],
        },
        vehicle,
      );
    case 'TripsLanding':
      return has([capRPOIActive, {not: 'cap:TLD'}], vehicle);
    case 'TripsGen3Landing':
      return has([gen3Plus, 'cap:RPOI', 'cap:TLD', 'res:*'], vehicle);
    case 'ValetMode':
    case 'ValetModeSettings':
      return has(
        [
          'res:*',
          'cap:VALET', // TODO:UA:20241217 -- replace res:*/cap:VALET with res:VALET
          {or: ['usr:primary', 'usr:secondary:1']},
          'flg:mga.remote.valetMode',
        ],
        vehicle,
      );
    case 'ValetPasscodeReset':
      return has(
        ['sub:REMOTE', 'cap:VALET', {or: ['usr:primary', 'usr:secondary:1']}],
        vehicle,
      );
    case 'VehicleDiagnostics':
      return has([gen2Plus, 'sub:SAFETY'], vehicle);
    case 'VehicleHealthReport':
      return has(
        [
          'cap:g1',
          {not: 'sub:NONE'},
          'flg:mga.vehicleDiagnostics.healthReport',
        ],
        vehicle,
      );
    case 'VehicleStatusLanding':
      // In theory, this is limited to
      // has([gen1Plus, subSafetyPlus, 'car:Provisioned'], vehicle)
      // but we allow access if there is an active recall
      return true;
    default: {
      const screenMenuItem = menuItems.find(
        i => i.type == 'screen' && i.screen == screen,
      );
      if (screenMenuItem) {
        return has(screenMenuItem.access, vehicle);
      } else {
        return true;
      }
    }
  }
};
