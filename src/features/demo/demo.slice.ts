// cSpell:ignore MGA, demoable
import { createSlice } from '@reduxjs/toolkit'
import { MgaNavigationFunction, ScreenList } from '../../Controller'
import i18n from '../../i18n'
import { promptAlert } from '../../components'
import { store } from '../../store'

const demoSlice = createSlice({
  name: 'demo',
  initialState: false,
  reducers: {
    begin: () => true,
    end: () => false,
  },
})

export const { begin, end } = demoSlice.actions
export default demoSlice.reducer

/** Standard alert for items than cannot be demoed. */
export const alertNotInDemo = async (): Promise<void> => {
  const { t } = i18n
  await promptAlert(t('login:demoMode'), t('common:featureNotInDemo'))
}

/**
 * Can a specific screen be demoed?
 *
 * This function is use to disable menu items and buttons
 * pointing to those screens
 *
 * MGA's original design allowed for all screens to be demoable
 * based on business request. This was revised to only allow
 * demo'ing matching the current application.
 **/
export const canDemo = (screen: keyof ScreenList): boolean => {
  switch (screen) {
    case 'AddHistory':
    case 'AppSettings':
    case 'AttWifiHotspot':
    case 'AuthorizedUsers':
    case 'BillingInformationEdit':
    case 'BillingInformationView':
    case 'ChangePassword':
    case 'CollisionCenterLanding':
    case 'Coupons':
    case 'EmergencyContacts':
    case 'Invoices':
    case 'LegalDisclaimers':
    case 'MaintenanceSchedule':
    case 'MessageCenterLanding':
    case 'MyProfileView':
    case 'MyVehicles':
    case 'Recalls':
    case 'ResetPin':
    case 'RoadsideAssistance':
    case 'ServiceHistory':
    case 'ServiceReminder':
    case 'StarlinkCustomerCare':
    case 'SubaruCustomerCare':
    case 'SubscriptionServicesLanding':
    case 'TextOptOut':
    case 'TipsInfo':
    case 'TripsLanding':
    case 'ValetMode':
    case 'ValetPasscodeReset':
    case 'VehicleLocationTracking':
    case 'Warranty':
    case 'Languages':
    case 'CommunicationPreferences':
    case 'AppleWatch':
      return false
    default:
      return true
  }
}

/**
 * Block navigation for screens not supported in demo.
 *
 * Shows an alert to users if blocked.
 **/
export const alertIfDemo: MgaNavigationFunction = () => {
  if (!store.getState().demo) {
    return false // Handle normally
  } else {
    void alertNotInDemo()
    return true
  }
}
