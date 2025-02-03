/* eslint-disable eol-last */
/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  createNavigationContainerRef,
  NavigationContainer,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackNavigationOptions,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { useAppLoading } from './store';
import {
  AppointmentResponse,
  AvailableAppointment,
  ClientSessionVehicle,
  Journal,
  JournalEntry,
  NationalCoupon,
  ScheduleForm,
  ServiceHistory,
  TripDetail,
  TripDetailRequest,
} from '../@types';
import { mileagePromptIfNeeded } from '../src/api/vehicle.api';
import { AlertBarTypes } from '../src/components/CsfAlertBar';
import { useCsfColors, csfThemes } from '../src/components/useCsfColors';
import { SpeedFence } from '../src/features/alerts/speedAlert.api';
import { CurfewAlert } from '../src/features/alerts/curfewAlert.api';
import { GeoFence } from '../src/features/alerts/boundaryAlert.api';
import { ContactMethod } from '../src/features/auth/loginApi';
import { EmergencyContacts } from '../src/features/profile/emergencyContacts/emergencyContactsApi';
import {
  ContactMethodConfirm,
  DropdownValue,
} from '../src/features/profile/securitysettings/securitySettingsApi';
import { ChargeTimerSetting } from '../src/features/remoteService/phev.api';
import { redirectIfValetNotConfigured } from '../src/features/remoteService/valetMode';
import { useLoginStatus } from '../src/features/auth/sessionSlice';





import MgaSnackBar from './components/MgaSnackBar';
import { CsfAlertAction } from './components';
import CsfAlert from './components/CsfAlert';
import CsfAppIcon from './components/CsfAppIcon';
import CsfPressable from './components/CsfPressable';
import MgaButton from './components/MgaButton';
import useTracking, { trackNavigation } from './components/useTracking';
import { alertIfDemo } from './features/demo/demo.slice';
import { redirectIfClimatePresetNotConfigured } from './features/remoteService/climatePreset';
import { redirectIfPreferenceNotConfigured } from './features/starlinkcommunications/communicationPreferencesSetup';
import DevAdobeTracking from './screens/development/DevAdobeTracking';
import DevAlertBars from './screens/development/DevAlertBars';
import CsfDevButtons from './screens/development/DevButtons';
import DevElements from './screens/development/DevElements';
import { DevForms } from './screens/development/DevForms';
import DevFormsPlus from './screens/development/DevFormsPlus';
import CsfDevI18nTester from './screens/development/DevHashValidation';
import DevHero from './screens/development/DevHero';
import DevIcons from './screens/development/DevIcons';
import { DevMarkdown } from './screens/development/DevMarkdown';
import DevPinReset from './screens/development/DevPinReset';
import DevPumps from './screens/development/DevPumps';
import DevRateUsPrompt from './screens/development/DevRateUsPrompt';
import { DevTabs } from './screens/development/DevTabs';
import DevToggle from './screens/development/DevToggle';
import DevTypography from './screens/development/DevTypography';
import DevUtils from './screens/development/DevUtils';
import DevValetMode from './screens/development/DevValetMode';
import DevVehicleAccountAttributes from './screens/development/DevVehicleAccountAttributes';
import DevVerintSurvey from './screens/development/DevVerintSurvey';
import DevWindowShade from './screens/development/DevWindowShade';
import { MgaAcceptMileage } from './screens/MgaAcceptMileage';
import { MgaAddEmergencyContact } from './screens/MgaAddEmergencyContact';
import MgaAddHistory from './screens/MgaAddHistory';
import MgaAppleWatch from './screens/MgaAppleWatch';
import MgaAppleWatchForgotPIN from './screens/MgaAppleWatchForgotPIN';
import MgaAppSettings from './screens/MgaAppSettings';
import MgaAttWifiHotspot from './screens/MgaAttWifiHotspot';
import MgaAuthorizedUserAdd from './screens/MgaAuthorizedUserAdd';
import MgaAuthorizedUserEdit from './screens/MgaAuthorizedUserEdit';
import MgaAuthorizedUsers from './screens/MgaAuthorizedUsers';
import { MgaBiometrics } from './screens/MgaBiometrics';
import MgaBluetoothCompatibility from './screens/MgaBluetoothCompatibility';
import MgaBluetoothPairingInfo from './screens/MgaBluetoothPairingInfo';
import MgaBluetoothResults, { BluetoothResultsParam } from './screens/MgaBluetoothResults';
import MgaChangePassword from './screens/MgaChangePassword';
import MgaChargeReview from './screens/MgaChargeReview';
import MgaChargeSchedule from './screens/MgaChargeSchedule';
import MgaClimateControl from './screens/MgaClimateControl';
import MgaClimateControlSetup from './screens/MgaClimateControlSetup';
import MgaCollisionCenterLanding from './screens/MgaCollisionCenterLanding';
import MgaCommunicationPreferencesIntro from './screens/MgaCommunicationPreferenceIntro';
import MgaCouponDetail from './screens/MgaCouponDetail';
import MgaCoupons from './screens/MgaCoupons';
import MgaCurfewLanding from './screens/MgaCurfewLanding';
import MgaCurfewSetting from './screens/MgaCurfewSetting';
import MgaDashboard from './screens/MgaDashboard/MgaDashboard';
import MgaDriverAlerts from './screens/MgaDriverAlerts';
import MgaEditAddress, { UpdateAddressParams } from './screens/MgaEditAddress';
import { UpdateEmailParams, MgaEditEmailAddress } from './screens/MgaEditEmailAddress';
import MgaEditTelephone, { UpdateTelephoneParams } from './screens/MgaEditTelephone';
import MgaEmergencyContacts from './screens/MgaEmergencyContacts';
import MgaEnterNewMileage from './screens/MgaEnterNewMileage';
import MgaEnterPassword from './screens/MgaEnterPassword';
import MgaEvents from './screens/MgaEvents';
import MgaFavoriteDestinations from './screens/MgaFavoriteDestinations';
import MgaForgotPassword from './screens/MgaForgotPassword';
import MgaForgotPasswordContact from './screens/MgaForgotPasswordContact';
import MgaForgotPasswordEnterNew from './screens/MgaForgotPasswordEnterNew';
import MgaForgotPasswordVerification from './screens/MgaForgotPasswordVerification';
import MgaForgotSomething from './screens/MgaForgotSomething';
import MgaForgotUsername from './screens/MgaForgotUsername';
import MgaGeofencingLanding from './screens/MgaGeofencingLanding';
import MgaGeofencingSetting from './screens/MgaGeofencingSetting';
import MgaHelpAndSupport from './screens/MgaHelpAndSupport';
import MgaHowToVideo, { VideoParams } from './screens/MgaHowToVideo';
import MgaHowToVideosLanding from './screens/MgaHowToVideosLanding';
import MgaIdActions from './screens/MgaIdActions';
import MgaInvoiceDetails from './screens/MgaInvoiceDetails';
import MgaInvoices from './screens/MgaInvoices';
import MgaLanguagePreferences from './screens/MgaLanguagePreferences';
import MgaLanguages from './screens/MgaLanguages';
import MgaLegalDisclaimers from './screens/MgaLegalDisclaimers';
import MgaLiveChat from './screens/MgaLiveChat';
import MgaLogin from './screens/MgaLogin';
import MgaMaintenanceSchedule from './screens/MgaMaintenanceSchedule';
import MgaMenus, { alertIfVehicleNotProvisioned, alertIfVehicleStolen } from './screens/MgaMenus';
import MgaMessageCenterLanding from './screens/MgaMessageCenterLanding';
import MgaModalSelect, { MgaModalSelectOptions } from './screens/MgaModalSelect';
import MgaMyProfileView from './screens/MgaMyProfileView';
import MgaMyVehicles from './screens/MgaMyVehiclesMenu';
import MgaNotificationPreferences from './screens/MgaNotificationPreferences';
import { PINOptions, MgaPINCheck } from './screens/MgaPINCheck';
import MgaRecalls from './screens/MgaRecalls';
import MgaRefundDetails from './screens/MgaRefundDetails';
import MgaRemoteService from './screens/MgaRemoteService';
import MgaRemoteServiceCommunication from './screens/MgaRemoteServiceCommunication';
import MgaResetPin from './screens/MgaResetPin';
import MgaResetPinConfirm from './screens/MgaResetPinConfirm';
import MgaRetailerLanding from './screens/MgaRetailer';
import MgaRetailerHawaii from './screens/MgaRetailerHawaii';
import MgaRetailerSearch from './screens/MgaRetailerSearch';
import MgaRoadsideAssistance from './screens/MgaRoadsideAssistance';
import MgaRoadsideAssistanceHistory from './screens/MgaRoadsideAssistanceHistory';
import MgaRoadsideAssistanceRequestForm from './screens/MgaRoadsideAssistanceRequestForm';
import MgaRuntimeOptions from './screens/MgaRuntimeOptions';
import MgaSavedTrips from './screens/MgaSavedTrips';
import MgaSaveEmail from './screens/MgaSaveEmail';
import MgaSaveTelephone from './screens/MgaSaveTelephone';
import MgaSaveTelephoneWithMfa from './screens/MgaSaveTelephoneWithMfa';
import MgaServiceHistory from './screens/MgaServiceHistory';
import MgaServiceReminder from './screens/MgaServiceReminder';
import { SetPinScreenProps, MgaSetPin } from './screens/MgaSetPin';
import MgaSpeedAlertLanding from './screens/MgaSpeedAlertLanding';
import MgaSpeedAlertSetting from './screens/MgaSpeedAlertSetting';
import MgaSplashScreen from './screens/MgaSplashScreen';
import MgaStarlinkCustomerCare from './screens/MgaStarlinkCustomerCare';
import MgaStarlinkLocation from './screens/MgaStarlinkLocation';
import MgaStartSettingsEdit from './screens/MgaStartSettingsEdit';
import MgaStartSettingsView from './screens/MgaStartSettingsView';
import MgaStolenVehicle from './screens/MgaStolenVehicle';
import MgaSubaruCustomerCare from './screens/MgaSubaruCustomerCare';
import MgaTermsConditions from './screens/MgaTermsConditions';
import MgaTextOptOut from './screens/MgaTextOptOut';
import MgaTipsFAQs from './screens/MgaTipsFAQs';
import MgaTipsInfo from './screens/MgaTipsInfo';
import MgaTradeUpAdvantage from './screens/MgaTradeUpAdvantage';
import MgaTripsDestinationSearch, { TripsDestinationRouteParams } from './screens/MgaTripsDestinationSearch';
import MgaTripsGen3Landing from './screens/MgaTripsGen3Landing';
import MgaTripsLanding from './screens/MgaTripsLanding';
import MgaTwoStepAuthentication from './screens/MgaTwoStepAuthentication';
import MgaUpdateAccount from './screens/MgaUpdateAccount';
import MgaUsageReport from './screens/MgaUsageReport';
import MgaUsageReportDetail, { UsageReportLineItem } from './screens/MgaUsageReportDetail';
import MgaValetMode from './screens/MgaValetMode/MgaValetMode';
import MgaValetModeSetPasscode, { ValetModeSetupParams } from './screens/MgaValetMode/MgaValetModeSetPasscode';
import MgaValetModeSetSpeedAlerts from './screens/MgaValetMode/MgaValetModeSetSpeedAlerts';
import MgaValetModeSettings from './screens/MgaValetMode/MgaValetModeSettings';
import MgaValetPasscodeReset from './screens/MgaValetReset/MgaValetPasscodeReset';
import MgaVehicleDetail from './screens/MgaVehicleDetail';
import MgaVehicleDiagnostics from './screens/MgaVehicleDiagnostics';
import MgaVehicleEdit from './screens/MgaVehicleEdit';
import MgaVehicleHealthReport from './screens/MgaVehicleHealthReport';
import { MgaVehicleInformation } from './screens/MgaVehicleInformation';
import MgaVehicleLocationTracking from './screens/MgaVehicleLocationTracking';
import MgaVehicleManage from './screens/MgaVehicleManage';
import MgaOTAHowToUpdate from './screens/MgaVehicleSoftwareUpdates/MgaOTAHowToUpdate';
import MgaOTASingleUpdate, { CampaignItem } from './screens/MgaVehicleSoftwareUpdates/MgaOTASingleUpdate';
import MgaOTASoftwareUpdateLanding, { VehicleSoftwareUpdateParams } from './screens/MgaVehicleSoftwareUpdates/MgaOTASoftwareUpdateLanding';
import MgaOTAUpdateComplete from './screens/MgaVehicleSoftwareUpdates/MgaOTAUpdateComplete';
import MgaVehicleStatusLanding from './screens/MgaVehicleStatusLanding';
import MgaVersionNotice from './screens/MgaVersionNotice';
import MgaWarranty from './screens/MgaWarranty';
import MgaWarrantyFaq from './screens/MgaWarrantyFaq';
import SciSubscriptionAutoRenew from './screens/subscriptions/SciSubscriptionAutoRenew';
import SciSubscriptionCancel from './screens/subscriptions/SciSubscriptionCancel';
import SciSubscriptionEnrollment from './screens/subscriptions/SciSubscriptionEnrollment';
import SciSubscriptionManage from './screens/subscriptions/SciSubscriptionManage';
import SciSubscriptionServiceLanding from './screens/subscriptions/SciSubscriptionServicesLanding';
import { Menu } from './utils/menu';
import { EngineStartSettings } from './utils/vehicle';
import { MgaChooseService, MgaScheduleConfirm, MgaScheduleDate, MgaScheduler, MgaScheduleSummary, MgaScheduleTime } from './screens/scheduler';
import { BillingInformationParams, MgaBillingInformationEdit, MgaBillingInformationView, MgaLiveTrafficManage, MgaLiveTrafficQRLanding, MgaLiveTrafficSubscription, MgaSubscriptionCancel, MgaSubscriptionCancelLease, MgaSubscriptionEnrollment, MgaSubscriptionModify, MgaSubscriptionServiceLanding, MgaSubscriptionManage, MgaSubscriptionUpgrade } from './screens/subscriptions';
import { MgaTripTrackerDatePickerOptions, MgaTripTrackerEditAddressOptions, MgaTripTrackerDatePicker, MgaTripTrackerEditAddress, MgaTripTrackerDetailSheet, MgaTripTrackerLanding, MgaTripTrackerJournalEditDetails, MgaTripTrackerJournalDetails, MgaTripTrackerJournalEditTripLogs, MgaTripTrackerJournalEntryDetails } from './screens/tripTracker';
// import MgaLogo from './components/MgaLogo';

export type ScreenList = {
  AcceptMileage: { vehicleMileage?: number; screen?: keyof ScreenList }
  AddEmergencyContact: {
    action: string
    availableContacts: number
    data?: EmergencyContacts
    id?: number
  }
  AddHistory?: Partial<ServiceHistory>
  Alert: {
    id?: number
    title: string
    message?: string
    actions?: CsfAlertAction[]
    options?: { type?: AlertBarTypes }
  }
  AppleWatch?: { automatic?: boolean }
  AppleWatchForgotPIN: { success: boolean } | undefined
  AppSettings: undefined
  VerintSurvey: undefined
  AttWifiHotspot: undefined
  AuthorizedUserAdd: {
    action: string
    relationData: DropdownValue[]
  }
  AuthorizedUserEdit: {
    action: string
    vehicleAuthorizedAccountKey?: number
    relationData: DropdownValue[]
  }
  AuthorizedUsers: undefined
  BillingInformationEdit: BillingInformationParams
  BillingInformationView: undefined
  Biometrics: { id?: number }
  BluetoothCompatibility: undefined
  BluetoothPairingInfo: undefined
  BluetoothResults: BluetoothResultsParam
  ChangePassword: undefined
  ChargeReview: undefined
  ChargeSchedule?: { chargeTimerSetting: ChargeTimerSetting }
  CommunicationPreferences?: {
    skipSetup?: boolean
  }
  CommunicationPreferencesIntro: undefined
  ChooseService: ScheduleForm
  ClimateControl: {
    skipSetup?: boolean
  }
  ClimateControlSetup: undefined
  CollisionCenterLanding: undefined
  CommunicationPreference: undefined
  CouponDetail: { coupon: NationalCoupon }
  Coupons: undefined
  CurfewLanding: undefined
  CurfewSetting: {
    alerts: CurfewAlert[]
    index?: number
    target?: CurfewAlert
  }
  Dashboard: undefined
  DriverAlerts: undefined
  EditAddress: { address: UpdateAddressParams }
  EditEmailAddress: { email?: string }
  EditTelephone: {
    data: UpdateTelephoneParams
  }
  EditVehicle: {
    data: ClientSessionVehicle
  }
  EmergencyContacts: undefined
  EnterNewMileage: { vehicleMileage?: number; screen?: keyof ScreenList }
  EnterPassword: {
    action: string
    vehicleAuthorizedAccountKey?: number
  }
  Events: undefined
  FavoriteDestinations: undefined
  ForgotSomething: undefined
  ForgotPassword: undefined
  ForgotPasswordContact: ContactMethod
  ForgotPasswordEnterNew: undefined
  ForgotPasswordVerification: { contactMethod: string }
  ForgotUsername: { titleKey: 'forgotUsername' | 'notSureAccount' }
  DevControls: undefined
  DevForms: undefined
  GeofencingLanding: undefined
  GeofencingSetting: {
    alerts: GeoFence[]
    index?: number
    target?: GeoFence
  }
  HelpAndSupport: undefined
  HowToVideosLanding: undefined
  HowToVideo: VideoParams
  IDActions: undefined
  IDAlertBars: undefined
  IDAdobeTracking: undefined
  IDControls: undefined
  IDIcons: undefined
  IDRateUsPrompt: undefined
  IDForms: undefined
  IDFormsPlus: undefined
  IDHero: undefined
  IDMarkdown: undefined
  IDPumps: undefined
  IDPinReset: undefined
  IDToggle: undefined
  IDTypography: undefined
  IDUtils: undefined
  IDElements: undefined
  IDTabs: undefined
  IDHash: undefined
  IDVehicleAccountAttributes: undefined
  IDWindowShade: undefined
  IDValet: undefined
  IDVerint: undefined
  Invoices: undefined
  InvoiceDetails: { invoiceNumber: number }
  Languages: undefined
  LanguagePreferences: undefined
  LegalDisclaimers: undefined
  LiveChat: undefined
  LiveTrafficManage: undefined
  LiveTrafficQRLanding: undefined
  LiveTrafficSubscription: undefined
  Login: { noAutoLogin?: boolean }
  ManageVehicle: undefined
  MaintenanceSchedule: undefined
  MessageCenterLanding: undefined
  ModalSelect: { id?: number; options?: MgaModalSelectOptions }
  MyProfileView: undefined
  MyVehicles: undefined
  Menu?: { id?: Menu; sender?: keyof ScreenList }
  NotificationPreferences: {
    preferenceKey: string
    label: string
  }
  OTAHowToUpdate: CampaignItem[]
  OTASingleUpdate: VehicleSoftwareUpdateParams
  OTAUpdateComplete: VehicleSoftwareUpdateParams | undefined
  OTASoftwareUpdateLanding: undefined
  PIN: { id?: number; options?: PINOptions }
  Recalls: undefined
  RefundDetails: { refundTransactionId: number }
  RemoteService: undefined
  ResetPin?: { nextScreen?: keyof ScreenList }
  ResetPin2FA: ContactMethodConfirm & { nextScreen?: keyof ScreenList }
  Retailer: { dealerCode?: string }
  RetailerHawaii: undefined
  RetailerSearch: { latitude?: number; longitude?: number; zip?: string }
  RoadsideAssistance: undefined
  RoadsideAssistanceHistory: {
    rsaId?: number
    vin?: string
    reason?: string
  }
  RoadsideAssistanceRequestForm: undefined
  RuntimeOptions: undefined
  SavedTrips: undefined
  SaveEmail: {
    data: UpdateEmailParams
  }
  SaveTelephone: {
    data: UpdateTelephoneParams
  }
  SaveTelephoneWithMfa: {
    data: UpdateTelephoneParams
  }
  ScheduleConfirm: ScheduleForm & { appointment?: AppointmentResponse }
  ScheduleDate: ScheduleForm
  Scheduler: undefined
  ScheduleSummary: ScheduleForm
  ScheduleTime: ScheduleForm & { availableTimeSlots: AvailableAppointment[] }
  SciSubscriptionAutoRenew: undefined
  SciSubscriptionCancel: undefined
  SciSubscriptionEnrollment: undefined
  SciSubscriptionManage: undefined
  SciSubscriptionServiceLanding: undefined
  SetPin: SetPinScreenProps
  ServiceHistory: undefined
  ServiceReminder: undefined
  SpeedAlertLanding: undefined
  SpeedAlertSetting: {
    alerts: SpeedFence[]
    index?: number
    target?: SpeedFence
  }
  SplashScreen: undefined
  StarlinkCustomerCare: undefined
  StarlinkLocation: undefined
  StartSettingsEdit: { presets: EngineStartSettings[]; index: number }
  StartSettingsView: { settings?: EngineStartSettings; isCurrent?: boolean }
  StolenVehicle: undefined
  SubaruCustomerCare: undefined
  SubscriptionCancel: undefined
  SubscriptionCancelLease: { id?: number }
  SubscriptionEnrollment: undefined
  SubscriptionServicesLanding: undefined
  SubscriptionManage: undefined
  SubscriptionModify: undefined
  SubscriptionUpgrade: undefined
  TermsConditions: { id: number }
  TextOptOut: undefined
  TipsFAQs: undefined
  TipsInfo: undefined
  TradeUpAdvantage: undefined
  TripsGen3Landing: undefined
  TripsLanding: undefined
  TripTrackerDatePicker: MgaTripTrackerDatePickerOptions
  TripTrackerDetailSheet: { tripLog: TripDetail; tripRange: TripDetailRequest }
  TripTrackerEditAddress: MgaTripTrackerEditAddressOptions
  TripTrackerJournalDetails: { journalId: number }
  TripTrackerJournalEditDetails: Partial<Journal>
  TripTrackerJournalEditTripLogs: Partial<Journal>
  TripTrackerJournalEntryDetails: JournalEntry
  TripsDestinationSearch: TripsDestinationRouteParams
  TripTrackingLanding: undefined
  TwoStepAuthentication: ContactMethod & { id?: number }
  UpdateAccount: {
    id?: number
  }
  UsageReport: undefined
  UsageReportDetail: UsageReportLineItem
  ValetMode: undefined
  ValetModeSettings: ValetModeSetupParams
  ValetModeSetPasscode: ValetModeSetupParams
  ValetModeSetSpeedAlerts: ValetModeSetupParams
  ValetPasscodeReset: undefined
  ValetModeCommunicationPreferences: undefined
  VehicleDetail: {
    vehicle?: ClientSessionVehicle
  }
  VehicleDiagnostics: undefined
  VehicleEdit: {
    vehicle?: ClientSessionVehicle
    action: 'add' | 'edit'
  }
  VehicleHealthReport: undefined
  VehicleInformation: undefined
  VehicleLocationTracking: undefined
  VehicleStatusLanding: undefined
  VersionNotice: undefined
  Warranty: undefined
  WarrantyFaq: undefined
}

const menuOptions = {
  headerTintColor: csfThemes.dark.button,
  headerTitleStyle: {
    color: csfThemes.dark.copyPrimary,
  },
  headerStyle: {
    backgroundColor: csfThemes.dark.backgroundSecondary,
  },
};
const Stack = createNativeStackNavigator<ScreenList>();

const HeaderTitleLogo = () => {
  const { t } = useTranslation();
  const { trackButton } = useTracking();
  const navigation = useAppNavigation();
  const isLoggedIn = useLoginStatus();
  return (
    // <MgaLogo
    //   height={24}
    //   aria-label={t('common:home')}
    //   accessibilityLabel={t('common:home')}
    //   accessibilityRole={'link'}
    //   onPress={() => {
    //     trackButton({
    //       title: 'Home Logo',
    //       trackingId: 'HomeLogoButton',
    //     });

    //     if (isLoggedIn) {
    //       navigation.navigate('Dashboard');
    //     } else {
    //       navigation.navigate('Login');
    //     }
    //   }}
    //   testID="headerLogo"
    // />
    <></>
  );
};

const alertScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  presentation: 'transparentModal',
  animation: 'none',
};

export const screenOptionsDefaultOrientation: NativeStackNavigationOptions = {
  orientation: 'portrait_up',
};

/** Navigation tree for all screens */
const MgaNavigationContainer: React.FC = () => {
  const { t } = useTranslation();
  const { colors } = useCsfColors();
  const isLoggedIn = useLoginStatus();
  const [isAppLoading, _] = useAppLoading();
  const initialRouteName = (() => {
    if (isAppLoading) { return 'SplashScreen'; }
    if (isLoggedIn) { return 'Dashboard'; }
    return 'Login';
  })();

  return (
    <>
      <NavigationContainer
        key={initialRouteName}
        ref={navigationRef}
        onReady={() => {
          trackNavigation(initialRouteName);
        }}>
        <Stack.Navigator
          initialRouteName={initialRouteName}
          screenOptions={() => ({
            headerBackTitleVisible: false,
            headerRight: () => (
              <MgaButton
                trackingId="MenuOpenButton"
                variant="link"
                title={t('common:menu')}
                onPress={() => navigationRef.navigate('Menu')}
              />
            ),
            headerTitleAlign: 'center',
            headerTitleStyle: { color: colors.copyPrimary },
            ...screenOptionsDefaultOrientation,
          })}>
          <Stack.Screen
            name="AcceptMileage"
            component={MgaAcceptMileage}
            options={{
              presentation: 'transparentModal',
              animation: 'none',
            }}
          />
          <Stack.Screen
            name="AddEmergencyContact"
            component={MgaAddEmergencyContact}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen name="AddHistory" component={MgaAddHistory} />
          <Stack.Screen
            name="Alert"
            component={CsfAlert}
            options={alertScreenOptions}
          />
          <Stack.Screen
            name="AppSettings"
            component={MgaAppSettings}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="AttWifiHotspot"
            component={MgaAttWifiHotspot}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="AuthorizedUserAdd"
            component={MgaAuthorizedUserAdd}
          />
          <Stack.Screen
            name="AuthorizedUserEdit"
            component={MgaAuthorizedUserEdit}
          />
          <Stack.Screen
            name="AuthorizedUsers"
            component={MgaAuthorizedUsers}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="BillingInformationEdit"
            component={MgaBillingInformationEdit}
          />
          <Stack.Screen
            name="BillingInformationView"
            component={MgaBillingInformationView}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="Biometrics"
            component={MgaBiometrics}
            options={{
              headerTitle: HeaderTitleLogo,
              headerBackVisible: false,
              headerRight: undefined,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="BluetoothCompatibility"
            component={MgaBluetoothCompatibility}
          />
          <Stack.Screen
            name="BluetoothPairingInfo"
            component={MgaBluetoothPairingInfo}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="BluetoothResults"
            component={MgaBluetoothResults}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen name="ChangePassword" component={MgaChangePassword} />
          <Stack.Screen
            name="ChargeReview"
            component={MgaChargeReview}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="ChargeSchedule"
            component={MgaChargeSchedule}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="ChooseService"
            component={MgaChooseService}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="ClimateControl"
            component={MgaClimateControl}
            options={{ headerTitle: HeaderTitleLogo }}
            initialParams={{
              setupScreenKeys: ['ClimateControl'],
            }}
          />
          <Stack.Screen
            name="ClimateControlSetup"
            component={MgaClimateControlSetup}
          />
          <Stack.Screen
            name="CollisionCenterLanding"
            component={MgaCollisionCenterLanding}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="OTAHowToUpdate"
            component={MgaOTAHowToUpdate}
            options={alertScreenOptions}
          />
          <Stack.Screen
            name="OTASingleUpdate"
            component={MgaOTASingleUpdate}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="OTAUpdateComplete"
            component={MgaOTAUpdateComplete}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="OTASoftwareUpdateLanding"
            component={MgaOTASoftwareUpdateLanding}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="CouponDetail"
            component={MgaCouponDetail}
            options={{ headerTitle: HeaderTitleLogo, headerRight: undefined }}
          />
          <Stack.Screen
            name="Coupons"
            component={MgaCoupons}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="CurfewLanding"
            component={MgaCurfewLanding}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen name="CurfewSetting" component={MgaCurfewSetting} />
          <Stack.Screen
            name="Dashboard"
            component={MgaDashboard}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="DriverAlerts"
            component={MgaDriverAlerts}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen name="EditAddress" component={MgaEditAddress} />
          <Stack.Screen
            name="EditEmailAddress"
            component={MgaEditEmailAddress}
          />
          <Stack.Screen name="EditTelephone" component={MgaEditTelephone} />
          <Stack.Screen
            name="EmergencyContacts"
            component={MgaEmergencyContacts}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="EnterNewMileage"
            component={MgaEnterNewMileage}
            options={{
              presentation: 'transparentModal',
              animation: 'none',
            }}
          />
          <Stack.Screen name="EnterPassword" component={MgaEnterPassword} />
          <Stack.Screen
            name="Events"
            component={MgaEvents}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={MgaForgotPassword}
          //  options={{ headerBackVisible: false }}
          />
          <Stack.Screen
            name="ForgotPasswordContact"
            component={MgaForgotPasswordContact}
          />
          <Stack.Screen
            name="ForgotPasswordEnterNew"
            component={MgaForgotPasswordEnterNew}
          />
          <Stack.Screen
            name="ForgotPasswordVerification"
            component={MgaForgotPasswordVerification}
          />
          <Stack.Screen
            name="ForgotSomething"
            component={MgaForgotSomething}
          // options={{ headerBackVisible: false }}
          />
          <Stack.Screen
            name="ForgotUsername"
            component={MgaForgotUsername}
          //   options={{ headerBackVisible: false }}
          />
          <Stack.Screen
            name="GeofencingLanding"
            component={MgaGeofencingLanding}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="GeofencingSetting"
            component={MgaGeofencingSetting}
          />
          <Stack.Screen
            name="HelpAndSupport"
            component={MgaHelpAndSupport}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen name="IDActions" component={MgaIdActions} />
          <Stack.Screen name="IDControls" component={CsfDevButtons} />
          <Stack.Screen name="IDIcons" component={DevIcons} />
          <Stack.Screen name="IDRateUsPrompt" component={DevRateUsPrompt} />
          <Stack.Screen name="IDPumps" component={DevPumps} />
          <Stack.Screen name="IDPinReset" component={DevPinReset} />
          <Stack.Screen name="IDAlertBars" component={DevAlertBars} />
          <Stack.Screen name="IDAdobeTracking" component={DevAdobeTracking} />
          <Stack.Screen name="IDForms" component={DevForms} />
          <Stack.Screen name="IDValet" component={DevValetMode} />
          <Stack.Screen name="IDVerint" component={DevVerintSurvey} />
          <Stack.Screen name="IDElements" component={DevElements} />
          <Stack.Screen name="IDWindowShade" component={DevWindowShade} />
          <Stack.Screen name="IDHero" component={DevHero} />
          <Stack.Screen name="IDMarkdown" component={DevMarkdown} />
          <Stack.Screen name="IDTabs" component={DevTabs} />
          <Stack.Screen name="IDToggle" component={DevToggle} />
          <Stack.Screen name="IDTypography" component={DevTypography} />
          <Stack.Screen name="IDUtils" component={DevUtils} />
          <Stack.Screen
            name="IDVehicleAccountAttributes"
            component={DevVehicleAccountAttributes}
          />
          <Stack.Screen name="IDFormsPlus" component={DevFormsPlus} />
          <Stack.Screen name="IDHash" component={CsfDevI18nTester} />
          <Stack.Screen
            name="Invoices"
            component={MgaInvoices}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen name="InvoiceDetails" component={MgaInvoiceDetails} />
          <Stack.Screen
            name="LanguagePreferences"
            component={MgaLanguagePreferences}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="Languages"
            component={MgaLanguages}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="LegalDisclaimers"
            component={MgaLegalDisclaimers}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="LiveChat"
            component={MgaLiveChat}
            options={{ headerTitle: HeaderTitleLogo, headerRight: undefined }}
          />
          <Stack.Screen
            name="LiveTrafficManage"
            component={MgaLiveTrafficManage}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="LivexLanding"
            component={MgaLiveTrafficQRLanding}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="LiveTrafficSubscription"
            component={MgaLiveTrafficSubscription}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="Login"
            component={MgaLogin}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ManageVehicle"
            component={MgaVehicleManage}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="MaintenanceSchedule"
            component={MgaMaintenanceSchedule}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="AppleWatch"
            component={MgaAppleWatch}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="AppleWatchForgotPIN"
            component={MgaAppleWatchForgotPIN}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="MessageCenterLanding"
            component={MgaMessageCenterLanding}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="ModalSelect"
            component={MgaModalSelect}
            options={alertScreenOptions}
          />
          <Stack.Screen
            name="MyProfileView"
            component={MgaMyProfileView}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="MyVehicles"
            component={MgaMyVehicles}
            options={menuOptions}
          />
          <Stack.Screen
            name="Menu"
            component={MgaMenus}
            options={menuOptions}
          />
          <Stack.Screen
            name="NotificationPreferences"
            component={MgaNotificationPreferences}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="PIN"
            component={MgaPINCheck}
            options={{
              headerShown: false,
              animation: 'none',
            }}
          />
          <Stack.Screen
            name="Recalls"
            component={MgaRecalls}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen name="RefundDetails" component={MgaRefundDetails} />
          <Stack.Screen
            name="RemoteService"
            component={MgaRemoteService}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="ResetPin"
            component={MgaResetPin}
            options={{
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="ResetPin2FA"
            component={MgaResetPinConfirm}
            options={{
              presentation: 'modal',
              headerRight: () => (
                <CsfPressable
                  onPress={() => navigationRef.goBack()}
                  accessibilityLabel={t('common:close')}>
                  <CsfAppIcon icon="Close" />
                </CsfPressable>
              ),
            }}
          />
          <Stack.Screen
            name="Retailer"
            component={MgaRetailerLanding}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen name="RetailerHawaii" component={MgaRetailerHawaii} />
          <Stack.Screen
            name="RetailerSearch"
            component={MgaRetailerSearch}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="RoadsideAssistance"
            component={MgaRoadsideAssistance}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="RoadsideAssistanceHistory"
            component={MgaRoadsideAssistanceHistory}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="RoadsideAssistanceRequestForm"
            component={MgaRoadsideAssistanceRequestForm}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="RuntimeOptions"
            component={MgaRuntimeOptions}
            options={alertScreenOptions}
          />
          <Stack.Screen name="SaveEmail" component={MgaSaveEmail} />
          <Stack.Screen name="SaveTelephone" component={MgaSaveTelephone} />
          <Stack.Screen
            name="SaveTelephoneWithMfa"
            component={MgaSaveTelephoneWithMfa}
          />
          <Stack.Screen
            name="ScheduleConfirm"
            component={MgaScheduleConfirm}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="ScheduleDate"
            component={MgaScheduleDate}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="Scheduler"
            component={MgaScheduler}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="ScheduleSummary"
            component={MgaScheduleSummary}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="ScheduleTime"
            component={MgaScheduleTime}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="SciSubscriptionAutoRenew"
            component={SciSubscriptionAutoRenew}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="SciSubscriptionCancel"
            component={SciSubscriptionCancel}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="SciSubscriptionEnrollment"
            component={SciSubscriptionEnrollment}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="SciSubscriptionManage"
            component={SciSubscriptionManage}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="SciSubscriptionServiceLanding"
            component={SciSubscriptionServiceLanding}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="SetPin"
            component={MgaSetPin}
            options={{
              headerTitle: HeaderTitleLogo,
              headerBackVisible: false,
              headerRight: undefined,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="ServiceHistory"
            component={MgaServiceHistory}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="ServiceReminder"
            component={MgaServiceReminder}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="SpeedAlertLanding"
            component={MgaSpeedAlertLanding}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="SpeedAlertSetting"
            component={MgaSpeedAlertSetting}
          />
          <Stack.Screen
            name="SplashScreen"
            component={MgaSplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="StarlinkCustomerCare"
            component={MgaStarlinkCustomerCare}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="StarlinkLocation"
            component={MgaStarlinkLocation}
          />
          <Stack.Screen
            name="StartSettingsEdit"
            component={MgaStartSettingsEdit}
            options={{ ...menuOptions, headerRight: undefined }}
          />
          <Stack.Screen
            name="StartSettingsView"
            component={MgaStartSettingsView}
          />
          <Stack.Screen
            name="StolenVehicle"
            component={MgaStolenVehicle}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="SubaruCustomerCare"
            component={MgaSubaruCustomerCare}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="SubscriptionCancel"
            component={MgaSubscriptionCancel}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="SubscriptionCancelLease"
            component={MgaSubscriptionCancelLease}
            options={alertScreenOptions}
          />
          <Stack.Screen
            name="SubscriptionEnrollment"
            component={MgaSubscriptionEnrollment}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="SubscriptionModify"
            component={MgaSubscriptionModify}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="SubscriptionServicesLanding"
            component={MgaSubscriptionServiceLanding}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="SubscriptionManage"
            component={MgaSubscriptionManage}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="SubscriptionUpgrade"
            component={MgaSubscriptionUpgrade}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="TermsConditions"
            component={MgaTermsConditions}
            options={{
              headerTitle: HeaderTitleLogo,
              headerBackVisible: false,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen
            name="TipsFAQs"
            component={MgaTipsFAQs}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="TextOptOut"
            component={MgaTextOptOut}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="HowToVideosLanding"
            component={MgaHowToVideosLanding}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="HowToVideo"
            component={MgaHowToVideo}
            options={{ headerTitle: HeaderTitleLogo, headerRight: undefined }}
          />
          <Stack.Screen
            name="TipsInfo"
            component={MgaTipsInfo}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="TradeUpAdvantage"
            component={MgaTradeUpAdvantage}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="TripsGen3Landing"
            component={MgaTripsGen3Landing}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="TripsLanding"
            component={MgaTripsLanding}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="TripsDestinationSearch"
            component={MgaTripsDestinationSearch}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="TripTrackerDatePicker"
            component={MgaTripTrackerDatePicker}
            options={{ ...menuOptions, headerRight: undefined }}
          />
          <Stack.Screen
            name="TripTrackerEditAddress"
            component={MgaTripTrackerEditAddress}
            options={{ ...menuOptions, headerRight: undefined }}
          />
          <Stack.Screen
            name="SavedTrips"
            component={MgaSavedTrips}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="FavoriteDestinations"
            component={MgaFavoriteDestinations}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="TripTrackerDetailSheet"
            component={MgaTripTrackerDetailSheet}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="TripTrackingLanding"
            component={MgaTripTrackerLanding}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="TripTrackerJournalEditDetails"
            component={MgaTripTrackerJournalEditDetails}
          />
          <Stack.Screen
            name="TripTrackerJournalDetails"
            component={MgaTripTrackerJournalDetails}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="TripTrackerJournalEditTripLogs"
            component={MgaTripTrackerJournalEditTripLogs}
          />
          <Stack.Screen
            name="TripTrackerJournalEntryDetails"
            component={MgaTripTrackerJournalEntryDetails}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="TwoStepAuthentication"
            component={MgaTwoStepAuthentication}
            options={{
              headerTitle: HeaderTitleLogo,
              headerBackVisible: false,
              headerRight: undefined,
            }}
          />
          <Stack.Screen
            name="UpdateAccount"
            component={MgaUpdateAccount}
            options={{ headerBackVisible: false }}
          />
          <Stack.Screen
            name="UsageReport"
            component={MgaUsageReport}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="UsageReportDetail"
            component={MgaUsageReportDetail}
          />
          <Stack.Screen
            name="ValetModeSetPasscode"
            component={MgaValetModeSetPasscode}
            initialParams={{
              setupStepsCount: 2,
              currentStepIndex: 0,
              setupScreenKeys: [
                'ValetModeSetPasscode',
                'ValetModeSetSpeedAlerts',
              ],
            }}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="ValetModeSetSpeedAlerts"
            component={MgaValetModeSetSpeedAlerts}
            initialParams={{
              setupStepsCount: 2,
              currentStepIndex: 1,
              setupScreenKeys: [
                'ValetModeSetPasscode',
                'ValetModeSetSpeedAlerts',
              ],
            }}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="ValetModeSettings"
            component={MgaValetModeSettings}
            initialParams={{
              setupStepsCount: 2,
              currentStepIndex: 0,
              setupScreenKeys: [
                'ValetModeSetPasscode',
                'ValetModeSetSpeedAlerts',
              ],
            }}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="ValetMode"
            component={MgaValetMode}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="ValetPasscodeReset"
            component={MgaValetPasscodeReset}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="VehicleDetail"
            component={MgaVehicleDetail}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="VehicleDiagnostics"
            component={MgaVehicleDiagnostics}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen name="VehicleEdit" component={MgaVehicleEdit} />
          <Stack.Screen
            name="VehicleHealthReport"
            component={MgaVehicleHealthReport}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="VehicleInformation"
            component={MgaVehicleInformation}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="VehicleStatusLanding"
            component={MgaVehicleStatusLanding}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="VehicleLocationTracking"
            component={MgaVehicleLocationTracking}
            options={{ ...menuOptions, headerRight: undefined }}
          />
          <Stack.Screen name="VersionNotice" component={MgaVersionNotice} />
          <Stack.Screen
            name="Warranty"
            component={MgaWarranty}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="WarrantyFaq"
            component={MgaWarrantyFaq}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="CommunicationPreferencesIntro"
            component={MgaCommunicationPreferencesIntro}
            options={{ headerTitle: HeaderTitleLogo }}
          />
          <Stack.Screen
            name="CommunicationPreferences"
            component={MgaRemoteServiceCommunication}
            options={{ headerTitle: HeaderTitleLogo }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      {<MgaSnackBar navigationRef={navigationRef} />}
    </>
  );
};

export const useAppRoute: <T extends keyof ScreenList>() => RouteProp<
  ScreenList,
  T
> = useRoute;

export const navigationRef = createNavigationContainerRef<ScreenList>();
//TODO:MN:20240531 Refactor MgaNavigationFunction to allow for async
export type MgaNavigationFunction = <T extends keyof ScreenList>(
  ...args: T extends unknown
    ? undefined extends ScreenList[T]
    ? [screen: T] | [screen: T, params: ScreenList[T]]
    : [screen: T, params: ScreenList[T]]
    : never
) => boolean
export const customNavigationFunctions: Partial<
  Record<keyof ScreenList, MgaNavigationFunction | MgaNavigationFunction[]>
> = {
  DriverAlerts: [alertIfVehicleNotProvisioned, alertIfVehicleStolen],
  RemoteService: [alertIfVehicleNotProvisioned, alertIfVehicleStolen],
  VehicleDiagnostics: alertIfVehicleNotProvisioned,
  VehicleHealthReport: alertIfVehicleNotProvisioned,
  TripsDestinationSearch: alertIfDemo,
  TripsLanding: [alertIfVehicleNotProvisioned, alertIfVehicleStolen],
  TripsGen3Landing: [alertIfVehicleNotProvisioned, alertIfVehicleStolen],
  TripTrackerJournalEditDetails: alertIfDemo,
  TripTrackerJournalEditTripLogs: alertIfDemo,
  VehicleInformation: [mileagePromptIfNeeded, alertIfDemo],
  MaintenanceSchedule: [mileagePromptIfNeeded, alertIfDemo],
  Recalls: alertIfDemo,
  ServiceHistory: alertIfDemo,
  ServiceReminder: alertIfDemo,
  AddHistory: alertIfDemo,
  Scheduler: mileagePromptIfNeeded,
  ValetMode: [
    alertIfVehicleNotProvisioned,
    redirectIfValetNotConfigured,
    alertIfVehicleStolen,
  ],
  ValetPasscodeReset: alertIfVehicleStolen,
  ClimateControl: [alertIfDemo, redirectIfClimatePresetNotConfigured],
  CommunicationPreferences: [alertIfDemo, redirectIfPreferenceNotConfigured],
};
const defineNavigationAction = (
  action: MgaNavigationFunction,
): MgaNavigationFunction => {
  return (...args) => {
    if (!navigationRef.isReady()) {
      return false;
    }
    trackNavigation(args[0], args?.[1]);

    // Survey Event Counter (feature flag logic handled internally )
    // surveySignificantEvent('pageView', args[0])

    const handler = customNavigationFunctions[args[0]];
    // If no custom handler,
    // call default action instead
    if (!handler) {
      return action(...args);
    }
    // If handler is a list of functions,
    // call each until one returns true (custom handling used)
    if (Array.isArray(handler)) {
      for (let i = 0; i < handler.length; i++) {
        const fn = handler[i];
        if (fn(...args)) {
          return true;
        }
      }
    }
    // If handler is a single function,
    // exit early if function returns true (custom handling used)
    if (typeof handler == 'function') {
      if (handler(...args)) {
        return true;
      }
    }
    // Else (all custom handlers returned false)
    // call default action
    return action(...args);
  };
};
export const navigate = defineNavigationAction((...args) => {
  navigationRef.navigate(...args);
  return true;
});
export const push = defineNavigationAction((...args) => {
  navigationRef.current?.dispatch({
    type: 'PUSH',
    payload: { name: args[0], params: args[1] },
  });
  return true;
});

/** Pop navigation if user hasn't already navigated away */
export const popIfTop = (
  navigation: AppNavigation,
  screen: keyof ScreenList | (keyof ScreenList)[],
): boolean => {
  const routes = navigation.getState().routes;

  // Handle empty routes
  if (routes.length === 0) {
    return false;
  }

  const topScreen = routes[routes.length - 1].name;

  // Normalize screen parameter
  if (Array.isArray(screen)) {
    if (screen.length === 0) {
      return false; // Guard against empty arrays
    }
    if (screen.includes(topScreen)) {
      navigation.pop();
      return true;
    }
  } else {
    if (topScreen === screen) {
      navigation.pop();
      return true;
    }
  }

  return false;
};

/**
 * Push navigation if not already top of stack.
 *
 * Useful for avoiding double pushes during animation or pending calls.
 **/
export const pushIfNotTop = (
  navigation: AppNavigation,
  screen: keyof ScreenList,
  params?: object,
): boolean => {
  const routes = navigation.getState().routes;
  if (routes.length == 0 || routes[routes.length - 1].name != screen) {
    navigation.push(screen, params);
    return true;
  } else {
    return false;
  }
};

export type AppNavigation = NativeStackNavigationProp<
  ScreenList,
  keyof ScreenList,
  undefined
>
export const useAppNavigation: () => AppNavigation = () => {
  const navigation = useNavigation();
  return {
    ...navigation,
    navigate,
    push,
  };
};


export default MgaNavigationContainer;