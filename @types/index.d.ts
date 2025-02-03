export interface AppHistoryItem {
  version: string
  date: string
  'changes-ios'?: string
  'changes-android'?: string
  changes?: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/data/AccountForm.java
 *
 * Really odd name for this class
 **/
export interface AccountForm {
  latitude: number
  longitude: number
}

/** https://github.com/SubaruOfAmerica/tb2c-aria-api-module/blob/master/src/main/java/com/subaru/tele/cloud/aria/api/simple/misc/SubscriptionResult.java#L114 */
export interface AddedPlan {
  planNumber: number
  planId: string
  endDate: string
  amount: number | null
}

/** https://github.com/SubaruOfAmerica/tb2c-mysubaru-subscription-module/blob/master/src/main/java/com/subaru/mysubaru/subscription/service/AriaUpgradeService.java#L1133 */
export interface AddPlansResponse {
  success: boolean
  errorMessage: string
  overallResult: OverallResult | null
  subscriptionResult: SubscriptionResult
  couponName: string
  couponPercent: number
}

/**
 * com.subaru.tele.cloud.tsp.att.api.domain.AttResponse
 */
export interface AttResponse {
  vin: string
  iccid: string
  forwardAddress: string
  errorCode: null
  description: null | string
  WiFiState: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-autoloopclient-module/blob/main/src/main/java/com/subaru/tele/cloud/tsp/autoloop/api/domain/AvailableAppointment.java
 **/
export interface AvailableAppointment {
  appointmentDateTimeLocal: string
  appointmentDateTimeLocalAsCalendar: number
  appointmentDateTimeUTC: string
  durationMinutes: number
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-autoloopclient-module/blob/main/src/main/java/com/subaru/tele/cloud/tsp/autoloop/api/domain/AvailableAppointmentsMessage.java
 **/
export interface AvailableAppointmentsMessage {
  availableAppointments: AvailableAppointment[]
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-autoloopclient-module/blob/main/src/main/java/com/subaru/tele/cloud/tsp/autoloop/api/domain/AvailableServicesMessage.java
 **/
export interface AvailableServicesMessage {
  services: Service[]
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-autoloopclient-module/blob/main/src/main/java/com/subaru/tele/cloud/tsp/autoloop/api/domain/Appointment.java
 */
export interface Appointment {
  address1: string | null
  address2: string | null
  appointmentDateTimeLocal: string
  appointmentDateTimeLocalDisplayFormat: string
  appointmentDateTimeUTC: string
  city: string | null
  country: string | null
  dealerCode: string
  dmsAppointmentId: string
  emailAddress: string
  firstName: string
  lastName: string
  loopAppointmentId: string
  marketId: number
  notificationId: string | null
  phoneNumber: string | null
  services: Service[]
  sourceType: string
  state: string | null
  transportType: number
  vin: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/data/AppointmentResponse.java
 */
export interface AppointmentResponse extends Appointment {
  dealerInfo: DealerInfo
}

/**
 * Key value map returned by Java.
 * 
 * 
 **/
export interface BillingDetails {
  inSessionID: string
  ariaBillingMode: string
  ariaClientNumber: string
}

/**
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/g2/data/CanadaSubscriptionEnrollmentForm.java
 **/
export interface CanadaSubscriptionEnrollmentForm {
  allInMasterPlanId: string
  allInRateScheduleId: string
  tomtomPlanId?: string
  tomtomRatescheduleId?: string
  preferredLanguage?: string
  timeZone?: string
  termsAndConditions?: boolean
  pin?: string
}

/**
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mys-subscription-module/blob/main/src/main/java/com/subaru/mysubaru/subscription/service/AriaDowngradeService.java#L564
 **/
export interface CancelPlansResponse {
  success: boolean
  errorMessage: string
  overallResult: OverallResult
  notes: string[]
  refundAmount: number
  plansCanceled: number
  safetyRefund: RefundDetail
  remoteServicesRefund: RefundDetail
  conciergeRefund: RefundDetail
  /** 
   * Only used in SCI.
   * 
   * Technically part of: 
   * https://github.com/SubaruOfAmerica/tb2c-mys-subscription-module/blob/master/src/main/java/com/subaru/mysubaru/subscription/service/canada/AriaCanadaDowngradeService.java
   **/
  allInRefund?: RefundDetail
  taxesRefund: number
}

/**
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mys-subscription-module/blob/master/src/main/java/com/subaru/mysubaru/subscription/service/canada/AriaCanadaDowngradeService.java#L367
 **/
export interface CancelPlansResponseCanada extends CancelPlansResponse {
  allInRefund: RefundDetail
}

/** Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/data/ChangePasswordRequest.java */
export interface ChangePasswordRequest {
  oldPassword: string
  password: string
  passwordConfirmation: string
}

/** Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/g2/data/ChangePinRequest.java */
export interface ChangePinRequest {
  oldPin: string
  pin: string
  pinConfirmation: string
}

/**
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mysubaru-subscription-module/blob/master/src/main/java/com/subaru/mysubaru/subscription/bindings/hub/obj/CheckVINValidityResponse.java
 **/
export interface CheckVINValidityResponse {
  success: boolean
  statusCode: number
  message: string
}

/**
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/session/client/ClientSessionCustomer.java
 **/
export interface ClientSessionCustomer {
  sessionCustomer?: CustomerInfo
  firstName?: string
  lastName?: string
  zip?: string
  phone?: string
  email?: string
  oemCustId?: string
}

/**
 * com.subaru.mysubaru.interfaces.customer.CustomerInfo
 **/
export interface CustomerInfo {
  firstName?: string
  lastName?: string
  email?: string
  address?: string
  address2?: string
  city?: string
  state?: string
  zip?: string
  zip5Digits?: string
  phone?: string
  oemCustId?: string
  cellularPhone?: string
  sourceSystemCode?: string
  workPhone?: string
  homePhone?: string
  title?: string
  suffix?: string
  countryCode?: string
  primaryPersonalCountry?: string
  relationshipType?: string
  gender?: string
  dealerCode?: string
  createMysAccount?: string
}

/**
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/session/client/ClientSessionVehicle.java
 **/
export interface ClientSessionVehicle {
  vin: string
  vehicleKey: number
  features: string[] | null
  subscriptionFeatures: string[] | null
  preferredDealer: DealerInfo | null
  firstName: string | null
  lastName: string | null
  zip: string | null
  phone: string | null
  email: string | null
  subscriptionStatus: string | null
  customer: ClientSessionCustomer
  nickname: string | null
  oemCustId: string
  active: boolean
  cachedStateCode: string | null
  authorizedVehicle: boolean
  vehicleName: string
  vehicleMileage: number | null
  modelName: string | null
  modelYear: string | null
  modelCode: string | null
  engineSize: number | null
  transCode: string | null
  extDescrip: string | null
  intDescrip: string | null
  licensePlate: string
  licensePlateState: string
  provisioned: boolean
  subscriptionPlans: SubscriptionPlan[]
  phev: boolean | null
  timeZone: string
  stolenVehicle: boolean
  userOemCustId: string
  accessLevel: number
  remoteServicePinExist: boolean
  needMileagePrompt: boolean
  needEmergencyContactPrompt: boolean
  vehicleGeoPosition: LocateResponseData
  show3gSunsetBanner: boolean
  crmRightToRepair: boolean
  sunsetUpgraded: boolean
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mysubaru-webapp/blob/c1c6d9cbc1ef396ed77f8d7de68433b23a676d55/src/main/java/com/subaru/mysubaru/controller/rest/G2RemoteServiceRestController.java#L398
 */
export interface ValetModeSetup {
  success: boolean
  errorCode: string | null
  dataName: string | null
  data: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/641a753394a80e090bbf6552226e9019ddf770ed/src/main/java/com/subaru/tele/cloud/api/controller/g2/RemoteServiceController.java#L1322
 */
export interface ValetModeSettings {
  notifyOnIgnOnAndOff: boolean
  speedFence: {
    hysteresisSec: number
    maxSpeedMPS: number
    speedType: string
  }
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-aria-api-module/blob/master/src/main/java/com/subaru/tele/cloud/api/controller/g2/data/ConfigurePhevTimerSettingRequest.java
 */
export interface ConfigurePhevTimerSettingRequest {
  pin: string
  vin: string
  timerId: string
  timerEnabled: boolean
  timerType: string
  precondition: boolean
  startHour: number
  startMinute: number
  monday: boolean
  tuesday: boolean
  wednesday: boolean
  thursday: boolean
  friday: boolean
  saturday: boolean
  sunday: boolean
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-aria-api-module/blob/master/src/main/java/com/subaru/tele/cloud/aria/api/simple/Contact.java
 */
export interface Contact {
  contactNumber: number
  address: {
    first_name: string
    middle_initial: string | null
    last_name: string
    company_name: string | null
    address1: string
    address2: string | null
    city: string
    state_prov: string
    country: string | null
    postal_cd: string
    country_cd: string | null
  }
  phone: null
  email: null
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mysubaru-coupons-module/blob/main/src/main/java/com/mysubaru/coupons/domain/CouponDTO.java
 */
export interface CouponDTO {
  name: string
  subtitle: string
  details: string
  value: string
  expiration: string
  body: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/data/DealerDetails.java
 *
 * Simplifed object returned by search
 **/
export interface DealerDetails {
  address: string
  city: string
  dealerCode: string
  dealerKey: string
  distance: string
  faxNumber: string
  latDeg: string
  longDeg: string
  name: string
  phoneNumber: string
  state: string
  url: string
  zip: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-dealer-service/blob/main/dealer-api/src/main/java/com/subaru/tele/cloud/tsp/dealer/api/domain/DealerFlagInfo.java
 **/
export interface DealerFlagInfo {
  dealerFlagCode: string
  dealerFlagSubCode: string | null
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-dealer-service/blob/main/dealer-api/src/main/java/com/subaru/tele/cloud/tsp/dealer/api/domain/DealerInfo.java
 **/
export interface DealerInfo {
  dealerKey: number
  sourceDealerKey: number
  latDeg: number
  longDeg: number
  dealerCode: string
  name: string
  regionCode: string
  salesDistrictCode: string
  zoneCode: string
  phoneNumber: string
  servicePhoneNumber: string
  faxNumber: string
  address: string
  address2: string | null
  city: string
  state: string
  zip: string
  serviceAddress: string
  /** Note: Field is whitespace padded. */
  serviceCity: string
  serviceState: string
  serviceZip: string
  serviceLatDeg: number
  serviceLongDeg: number
  url: string
  terminationDate: number
  sourceUpdateDate: number
  buySellDealerCode: string
  createDate: number
  updateDate: number
  flags: DealerFlagInfo[]
  schedulable: boolean
  distance: number
  marketId: number
  partsPhoneNumber: string
  serviceCountry: string
  servicePhoneNumberOriginal: string
  partsPhoneNumberOriginal: string
  phoneNumberOriginal: string
}

/** https://github.com/SubaruOfAmerica/tb2c-mysubaru-subscription-module/blob/master/src/main/java/com/subaru/mysubaru/subscription/service/AriaSubscriptionService.java */
export interface EnrollResponse {
  overallResult: OverallResult
  plansCreated: number
  invoiceTotal: number
  accountNumber: number
  success: boolean
  errorMessage: string
  notes: string[]
  subscriptionResult: SubscriptionResult
  enrollData: EnrollData
  couponErrorCode: string
}

/** Key value map returned by Java. Used in enroll endpoints (SOA and SCI). */
export interface EnrollmentResponse {
  ariaClientNumber: string
  ariaMode: string
  enrollResponse: EnrollResponse
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mysubaru-services-module/blob/main/src/main/java/com/subaru/mysubaru/services/domain/EventItemInfo.java
 */
export interface EventItemInfo {
  eventId: string
  title: string
  description: string
  eventStartDate: LocalDateTime
  eventEndDate: LocalDateTime
  address1: string
  address2: string
  city: string
  state: string
  zip: string
  interest: string
  type: string
  url: string
  imageSrc: string
  imageSrc: number
  interestMatch: boolean
  relevanceRank: number
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mysubaru-services-module/blob/development/src/main/java/com/subaru/mysubaru/services/domain/Journal.java
 **/
export interface Journal {
  journalId: number
  journalName: string
  journalDescription: string
  journalCategory: string
  journalEntries: JournalEntry[]
}

/** Part of JournalEntry */
export interface JournalEntryTripEntryData {
  startName?: string
  endName?: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mysubaru-triplog-service/blob/main/src/main/java/com/subaru/micro/mysubaru/triplog/entity/JournalEntry.java
 **/
export interface JournalEntry {
  journalId: number
  tripLogDataId: number
  journalEntryId: number
  startTime: string
  endTime: string
  positionCount: number
  /** Returned by server as stringified JSON */
  positionData: string | LocateResponseData[]
  addlData: string
  startOdometerValue: number
  startOdometerUnit: string
  endOdometerValue: number
  endOdometerUnit: string
  fuelConsumptionValue: number
  fuelConsumptionUnit: string
  /** Returned by server as stringified JSON */
  tripEntryData: string | JournalEntryTripEntryData
  createDate: string
  createUser: string
  updateDate: string
  updateUser: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/master/src/main/java/com/subaru/tele/cloud/api/controller/data/InvoicesForm.java
 */
export interface InvoicesForm {
  invoiceType: 'INVOICE' | 'ELECTRONIC_REFUND' | 'NON_ELECTRONIC_REFUND'
  amount: string
  number: number
  parsedInvoiceDate: string
}

/**
 * java.time.LocalDate
 *
 * Returned by services for start / end of subscriptions
 **/
export interface LocalDate {
  year: number
  /** Month name in all caps (ex: OCTOBER) */
  month: string
  chronology: {
    calendarType: string
    id: string
  }
  era: string
  leapYear: boolean
  dayOfMonth: number
  monthValue: number
  /** Weekday in all caps (ex: TUESDAY) */
  dayOfWeek: string
  dayOfYear: number
}

/**
 * java.time.LocalDateTime
 *
 * Returned by services for start / end of events
 **/
export interface LocalDateTime {
  year: number
  /** Month name in all caps (ex: OCTOBER) */
  month: string
  chronology: {
    calendarType: string
    id: string
  }
  dayOfMonth: number
  monthValue: number
  hour: number
  minute: number
  second: number
  nano: number
  /** Weekday in all caps (ex: TUESDAY) */
  dayOfWeek: string
  dayOfYear: number
}

/**
 * com.subaru.tele.cloud.tsp.remoteservices.api.domain.LocateResponseData
 **/
export interface LocateResponseData {
  latitude: number
  longitude: number
  speed: number | null
  heading: number | null
  timestamp?: string
  locationTimestamp?: number
}

/**
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/data/MaintenanceSchedule.java
 **/
export interface MaintenanceSchedule {
  serviceMiles: string
  displayServiceMiles: string
  editService: boolean
  recommendedMaintenance: string[]
  vehicleId: number
  serviceCompletedDate: string
  vehicleOwnerServiceId: number
  serviceProvider: string
  notes: string
  mileage: number
  serviceDescription: string
}

/**
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mysubaru-data-module/blob/development/src/main/java/com/subaru/mysubaru/data/entity/MobileMessage.java
 **/
export interface MobileMessage {
  mobileMessageKey: number
  appVersion: string
  createDate: string
  updateDate: string
  fatal: boolean
  message: string
  clickUrl: string
  marketId: number
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mysubaru-coupons-module/blob/main/src/main/java/com/mysubaru/coupons/domain/national/NationalCoupon.java
 */
export interface NationalCoupon {
  id: number
  status: string
  featuredMySubaru: boolean
  title: string
  startDate: number
  endDate: number
  category: string
  summary: string
  manufacturer: string
  redemptionFormActive: boolean
  redemptionFormUrl: string
  termsAndConditions: string
  createDate: number
  modifyDate: number
  manufacturerLogoUrl: string
  manufacturerSmallLogoUrl: string
  excludedDealerCodes: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-autoloopclient-module/blob/main/src/main/java/com/subaru/tele/cloud/tsp/autoloop/api/domain/NonSchedulableRecalls.java
 */
export interface NonSchedulableRecalls {
  recallCode: string
  procedureCode: string
  recallDescription: string
  recallProgramType: string
}

/**
 * Standard shape for server response
 *
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/framework/NormalResult.java
 **/
export type NormalResult<T> = {
  success: boolean
  errorCode: string | null
  dataName: string | null
  data: T | null
}

/** https://github.com/SubaruOfAmerica/tb2c-aria-api-module/blob/master/src/main/java/com/subaru/tele/cloud/aria/api/service/OverallResult.java */
export interface OverallResult {
  functionId: string
  success: boolean
  startTime: number | null
  endTime: number | null
  errorCode: number | null
  expectedParts: number | null
  accountNumber: number | null
  subscriptionResult: SubscriptionResult
  data: unknown
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-aria-api-module/blob/master/src/main/java/com/subaru/tele/cloud/aria/api/simple/PaymentMethod.java
 **/
export interface PaymentMethod {
  paymentMethodIndexNumber: number
  name: string | null
  paymentType: number
  last4: string
  expireMonth: number
  expireYear: number
  cardType: number | null
  cardTypeName: string
  active: true
  number: string | null
  cvv: string | null
  billFirstName: string
  billLastName: string
  billAddress1: string
  billAddress2: string | null
  billCity: string
  billStateProv: string
  billPostalCd: string
  billingContactNumber: number
}

/** 
 * Parameter list for request:
 * https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/g2/CanadaManageEnrollmentController.java#L186
 **/
export interface PaymentMethodRequest {
  skipCreditCardValidation: boolean
}

/**
 * Key value map returned by Java.
 * https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/g2/CanadaManageEnrollmentController.java#L200
 **/
export interface PaymentMethodResponse {
  billingContact?: Contact
  paymentMethod?: PaymentMethod
  validateCreditCardResponse?: ValidateCreditCardResponse
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mys-subscription-module/blob/master/src/main/java/com/subaru/mysubaru/subscription/service/AriaSubscriptionService.java#L1152
 **/
export interface PreEnrollRequest {
  // Omitted by legacy app
  oemCustId?: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mys-subscription-module/blob/master/src/main/java/com/subaru/mysubaru/subscription/service/AriaSubscriptionService.java#L1166
 **/
export interface PreEnrollResponse {
  ableToContinue: boolean
  reasonCode?: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mys-subscription-module/blob/masterz/src/main/java/com/subaru/mysubaru/subscription/service/AriaUpgradeService.java#L865
 **/
export interface PlanOptions {
  planId: string
  rateScheduleId: string
  price: number
  fullPrice: number
  isTrial: boolean
  name: string
}

/** Used in post enroll endpoints (SOA and SCI). */
export interface PostEnrollRequest {
  pin?: string
  preferredLanguage?: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-aria-api-module/blob/master/src/main/java/com/subaru/tele/cloud/aria/api/simple/RateSchedule.java
 **/
export interface RateSchedule {
  rateScheduleNumber: number
  rateScheduleId: string
  price: number
  months: number
  startDate: string
  endDate: string
  defaultRate: boolean
  masterPlanId: string
  isDiscontinued: boolean
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-autoloopclient-module/blob/main/src/main/java/com/subaru/tele/cloud/tsp/autoloop/api/domain/RecallInfo.java
 */
export interface RecallInfo {
  defaultRecallOpCode: string
  defaultRecallDescription: string
  preSelectAllRecalls: boolean
  recallOpCodes?: RecallOpCode[]
  success: boolean
  code: number
  message: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-autoloopclient-module/blob/main/src/main/java/com/subaru/tele/cloud/tsp/autoloop/api/domain/RecallOpCode.java
 */
export interface RecallOpCode {
  opCode: string
  description: string
  schedulableRecalls?: SchedulableRecalls[]
  nonSchedulableRecalls?: NonSchedulableRecalls[]
}

/**
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mys-subscription-module/blob/main/src/main/java/com/subaru/mysubaru/subscription/service/AriaDowngradeService.java#L667
 **/
export interface RefundDetail {
  refundAmount: number
  refundDeferred: boolean
  creditMemoNo: number
}

/**
 * Refresh Vehicle Options for selectVehicle()
 * configure selectVehicle to call refresh
 *
 */

type RefreshVehicleOptions = {
  type: 'sync' | 'async' | 'none'
  // TODO:UA:20240710 - add  properties for ttl + conditionals based on session/state
}
/**
 * Remote service state.
 * 'sent' is an internal status for a request without a server response.
 * 'completed' is an internal status used for horn & lights.
 *
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/framework/remote/RemoteServiceState.java
 **/
export type RemoteServiceState =
  | 'started'
  | 'scheduled'
  | 'finished'
  | 'stopping'
  | 'sent'
  | 'completed'

/**
 * Backend name of remote command.
 *
 * Reported by backend under `data.remoteServiceType`.
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/framework/remote/RemoteServiceType.java
 **/
export type RemoteServiceType =
  | 'lock'
  | 'unlock'
  | 'condition'
  | 'hornLights'
  | 'vehicleStatus'
  | 'locate'
  | 'engineStart'
  | 'engineStop'
  | 'sendPOI'
  | 'speedFence'
  | 'timeFence'
  | 'geoFence'
  | 'phevChargeNow'
  | 'phevSendTimerSetting'
  | 'phevDeleteTimerSetting'
  | 'phevRetrieveTimerSettings'
  | 'valetMode'
  | 'other'
  | 'triplogCommand'

/** https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/framework/remote/RemoteServiceStatusBase.java */
export type RemoteServiceStatusBase<T> = {
  serviceRequestId: string
  success: boolean
  cancelled: boolean
  remoteServiceState: RemoteServiceState
  remoteServiceType: RemoteServiceType
  subState: null
  errorCode: string | null
  /** Command specific data (vehicle location, door status, etc...) */
  result: T
  updateTime: number | null
  vin: string
  errorDescription: string | null
}

/**
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/ext/vehicle/SASAgreementProfile.java
 **/
export interface SasAgreementProfile {
  created?: string
  contractNumber?: string
  status?: string
  contractStartDate?: string
  contractExpirationDate?: string
  planDescription?: string
  assetId?: string
  coverageType?: string
  contractType?: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-autoloopclient-module/blob/main/src/main/java/com/subaru/tele/cloud/tsp/autoloop/api/domain/SchedulableRecalls.java
 */
export interface SchedulableRecalls {
  recallCode: string
  procedureCode: string
  recallDescription: string
  recallProgramType: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/data/ScheduleForm.java
 **/
export interface ScheduleForm {
  vin?: string
  dealerCode?: string
  requestJson?: string | Service[]
  appointmentFinderStartDate?: string
  appointmentFinderEndDate?: string
  appointmentDateUtc?: string
  appointmentDateLocal?: string
  transportType?: number
  parentPage?: string
}

/** https://github.com/SubaruOfAmerica/tb2c-autoloopclient-module/blob/main/src/main/java/com/subaru/tele/cloud/tsp/autoloop/api/domain/ScheduleMessage.java */
export interface ScheduleMessage {
  success: boolean
  code: number
  message?: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-autoloopclient-module/blob/main/src/main/java/com/subaru/tele/cloud/tsp/autoloop/api/domain/Service.java
 **/
export interface Service {
  serviceName?: string
  opCode?: string
  price?: number
  isRecommendedService?: boolean
  recommendedServiceMileage?: number
  isGeneralRepair?: boolean
  serviceCategory?: number
  comment?: string
  isDue?: boolean
  isDeclinedService?: boolean
}

/**
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/data/ServiceHistory.java
 **/
export interface ServiceHistory {
  vehicleOwnerServiceId: number
  vehicleId: number
  mileage: number
  serviceDate: number
  serviceDateStr: string
  serviceProvider: string
  notes: string[]
  comments: string
  vehicleNotes: string
  updateable: boolean
  serviceType: string
  serviceHeaderKey: number
  ownerRepairServiceId: number
  maintenanceInterval: number
}

/** com.subaru.tele.cloud.aria.api.StarlinkPackage */
export type StarlinkPackage =
  | 'ALLIN'
  | 'SAFETY'
  | 'REMOTE'
  | 'CONCIERGE'
  | 'TOMTOM'
  | 'TOMTOMSCI'

/**
 * https://github.com/SubaruOfAmerica/tb2c-mysubaru-subscription-module/blob/master/src/main/java/com/subaru/mysubaru/subscription/domain/SubscriptionDetail.java#L11
 **/
export interface SubscriptionDetail {
  masterPlanId: string
  starlinkPackage: StarlinkPackage
  planDate: LocalDate
  expirationDate: LocalDate
  nextBillingDate: LocalDate
  months: number
  automaticRenewal: boolean
  trial: boolean
  dunning: boolean
  customFields: {
    name: string
    value: string
  }[]
  rolloverPlanRateSchedule: RateSchedule
  planAgeInDays: number
}

/** https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/g2/data/SubscriptionEnrollmentForm.java */
export interface SubscriptionEnrollmentForm {
  safetyMasterPlanId?: string
  safetyRateScheduleId?: string
  remoteMasterPlanId?: string
  remoteRateScheduleId?: string
  conciergeMasterPlanId?: string
  conciergeRateScheduleId?: string
  tomtomPlanId?: string
  tomtomRateScheduleId?: string
  promoCode: string
  currentSubscriptionCartToken: number
  preferredLanguage?: string
  timeZone?: string
  mobilePhone?: string
  pin?: string
}

/**
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/data/SubscriptionPlan.java
 **/
export interface SubscriptionPlan {
  expireDate: string
  expireDateLocal: LocalDate
  description: string
  automaticRenewal: boolean
  startDate: LocalDate
}

/** https://github.com/SubaruOfAmerica/tb2c-aria-api-module/blob/master/src/main/java/com/subaru/tele/cloud/aria/api/simple/misc/SubscriptionResult.java */
export interface SubscriptionResult {
  accountNumber: number
  invoiceNumber: number
  invoicePreTaxTotal: number
  invoiceTaxTotal: number
  invoiceCreditAmount: number
  invoiceTotal: number
  sessionId: string
  addedPlanNumbers: number[]
  addedPlans: AddedPlan[]
  errorCode: number
}

/**  */
export interface SubscriptionUpgradeForm {
  remoteAdd?: boolean
  remoteExtend?: boolean
  remoteTerm?: boolean
  conciergeAdd?: boolean
  conciergeTerm?: boolean
  tomtomPlanId?: string
  tomtomRatescheduleId?: string
  promoCode: string | null
  /** Server defaults to false if not provided */
  doWrite?: boolean
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mysubaru-services-module/blob/main/src/main/java/com/subaru/mysubaru/services/domain/SxmRadioResponse.java#L99
 */
export interface SxmRadioResponse {
  transactionStatus: string
  vin: string
  subscriptionId: string
  subscriptionIdLabel: string
  subscriptionStatus: string
  subscriptions?: {
    subscriptionStatus: string
    subscriptionPackage: string
    dateLabel: string
    dateValue: string
    trial: boolean
    active: boolean
  }[]
  message: string
  destinationUrl?: string
  destinationLabel: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mysubaru-interfaces-module/blob/development/src/main/java/com/subaru/mysubaru/interfaces/telematics/TelematicsCustomerPreference.java
 *
 * NOTE: Currently missing from main
 **/
export interface TelematicsCustomerPreference {
  preferenceName: string
  preferenceValue: string
  description: string
  group: string
  preferenceDisplayName: string
  preferenceDataType: string
  preferenceTMGenCD: string
  tmPlanType: string
  notifyEmailFlag: string
  notifyTextFlag: string
  notifyPushFlag: string
  defaultValue: string
}

/** com.subaru.tele.cloud.data.entity.TeleServiceUsageIngest */
export interface TeleServiceUsageIngest {
  /** Various callers show this as a string but it's returned as a number in most cases. */
  userId: number | string
  eventCreatedTime: number
  serviceType: string
  serviceName: string
  eventId: string
  /** Status of command.
   *
   * TODO:UA:20230307: Unsure why `'cancelled'` is lowercase. Need server sample.
   */
  status: 'Successful' | 'cancelled' | 'Failed'
  vin: string
  initiator: string
  failureReason: string | null
  failureDescription: string | null
  serviceEventId: string
  serviceVin: string
  /** Mobile Subscriber ISDN Number */
  msisdn: string
  iccId: string
  userIdAlt: string
  serviceMessageName: string
  latitude: number | null
  longitude: number | null
  serviceCreationTime: number
  startTime: number
  endTime: number
  createDate: number
  /** Only present in Trip Logs */
  activateTripLog?: boolean
  maxSpeed?: string
  speedAlert?: boolean
}

/** com.subaru.schedule.domain.TradeUpAdvantageMessage - cannot access Java source */
export interface TradeUpAdvantageMessage {
  resourceUrl: null | string
  expiresOn: null | string
  success: boolean
  responseCode: number
  message: string
  description: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mysubaru-services-module/blob/main/src/main/java/com/subaru/mysubaru/services/domain/TripDetail.java
 **/
export interface TripDetail {
  tripLogDataId: number
  startTime: string
  endTime: string
  startTimeAMPM: string
  endTimeAMPM: string
  startOdometerUnit: string
  startOdometerValue: number
  endOdometerUnit: string
  endOdometerValue: number
  positionCount: number
  vin: string
  startLatitude: number
  startLongitude: number
  endLatitude: number
  endLongitude: number
  onlyDateStart: string
  onlyDateEnd: string
  onlyTimeStart: string
  onlyTimeEnd: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mysubaru-services-module/blob/main/src/main/java/com/subaru/mysubaru/services/domain/TripDetailRequest.java
 **/
export interface TripDetailRequest {
  tripStartDate: string
  tripStopDate: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mysubaru-services-module/blob/main/src/main/java/com/subaru/mysubaru/services/domain/TripInterval.java
 **/
export interface TripInterval {
  tripStartDate: string
  tripStopDate: string
  triplogCount: number
  vin: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mysubaru-services-module/blob/main/src/main/java/com/subaru/mysubaru/services/domain/g2/TripLogCommandExecute.java
 **/
export interface TripLogCommandExecute {
  triplogOn?: boolean
  expirationDate: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mysubaru-services-module/blob/main/src/main/java/com/subaru/mysubaru/services/domain/TripLogPerDayDetail.java
 **/
export interface TripLogPerDayDetail {
  resultMap: Record<String, TripDetail[]>
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/data/TripLogSettingsResponse.java
 **/
export interface TripLogSettingsResponse {
  triplogSettingsId: number
  vin: string
  accountId: number
  expireDate: string
  active: string
  messageWarningDate: number
  messageExpireDate: number
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/data/UpdateAccountRequest.java
 **/
export interface UpdateAccountRequest {
  oldPassword: string
  password: string
  passwordConfirmation: string
  iAgreeCheckBox: boolean
  deviceName: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mys-subscription-module/blob/masterz/src/main/java/com/subaru/mysubaru/subscription/service/AriaUpgradeService.java#L788
 **/
export interface UpgradeOptionsResponse {
  success: boolean
  errorMessage: string
  remoteServicesAdd: PlanOptions
  remoteServicesTerm: PlanOptions
  remoteServicesExtend: PlanOptions
  conciergeAdd: PlanOptions
  conciergeTerm: PlanOptions
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mysubaru-cloud-module/blob/development/src/main/java/com/subaru/mysubaru/vehicle/ValetService.java#L23
 **/
export type ValetStatus =
  | 'VAL_ON'
  | 'VAL_OFF'
  | 'VAL_ACTIVATING'
  | 'VAL_DEACTIVATING'
  | 'VAL_ON_PENDING'
  | 'VAL_OFF_PENDING'
  | 'NO_RECORDS'
  | 'NO_MATCHING_SERVICE_NAME'

/**
 * TODO:AG:20230826: Cannot access Java source.
 **/
export interface VehicleConditionStatusResponse {
  avgFuelConsumption: null
  avgFuelConsumptionUnit: string
  distanceToEmptyFuel: number
  distanceToEmptyFuelUnit: string
  odometer: number
  odometerUnit: string
  tirePressureFrontLeft: number
  tirePressureFrontLeftUnit: string
  tirePressureFrontRight: number
  tirePressureFrontRightUnit: string
  tirePressureRearLeft: number
  tirePressureRearLeftUnit: string
  tirePressureRearRight: number
  tirePressureRearRightUnit: string
  lastUpdatedTime: string
  windowFrontLeftStatus: string
  windowFrontRightStatus: string
  windowRearLeftStatus: string
  windowRearRightStatus: string
  windowSunroofStatus: string
  remainingFuelPercent: null
  evDistanceToEmpty: number
  evDistanceToEmptyUnit: null
  evChargerStateType: string
  evIsPluggedIn: string
  evStateOfChargeMode: null
  evTimeToFullyCharged: null
  evStateOfChargePercent: number
  vehicleStateType: string
  doorBootPosition: string
  doorEngineHoodPosition: string
  doorFrontLeftPosition: string
  doorFrontRightPosition: string
  doorRearLeftPosition: string
  doorRearRightPosition: string
}

/**
 * https://github.com/SubaruOfAmerica/tb2c-mys-subscription-module/blob/master/src/main/java/com/subaru/mysubaru/subscription/service/AriaUpgradeService.java#L1130
 **/
export interface ValidateCreditCardResponse {
  creditCardExists: boolean
  valid: boolean
}

/**
 * Derived from column of:
 * https://github.com/SubaruOfAmerica/tb2c-mysubaru-interfaces-module/blob/main/src/main/java/com/subaru/mysubaru/interfaces/telematics/v2/VehicleHealthWarningType.java
 */
export type B2CCode =
  | 'abs' // Anti-Lock Braking System
  | 'ahbl' //Automatic Headlight Beam Leveler
  | 'airbag' // Airbag System, supplemental restraint system
  | 'awd' // All-Wheel Drive
  | 'blindspot' //  (Gen2) Blind-Spot Detection/Rear Cross Traffic Alert
  | 'chargeSystem' // Gen2 PHEV
  | 'ebd' // Electronic Brake Force Distribution
  | 'engineFail' // Check Engine
  | 'epas' // power steering
  | 'eyesight' // EyeSight System
  | 'hotSystem' // Hybrid Electric Vehicle System Hot Warning light
  | 'hybridSystem' // Hybrid System
  | 'iss' // new
  | 'oilPres' // Oil Pressure
  | 'oilTemp' // Automatic Transmission Oil Temperature
  | 'oilWarning' // Engine Oil Level
  | 'passairbag' // Airbag System - feature code "SRSP_MIL" is not provided by business
  | 'pedairbag' // new
  | 'pkgBrake' // EPB_MIL
  | 'revBrake' // reverse automatic brake
  | 'shevChargeSystem' // Charge Warning Light
  | 'shevHybridSystem' // Hybrid Fail Lamp
  | 'srh' //Steering Responsive Headlights
  | 'telematics' // Telematics System
  | 'tpms' // tire pressure mgmt sys
  | 'vdc' // vehicle dynamic ctrl
  | 'washer' // Washer Fluid

/**
 * https://github.com/SubaruOfAmerica/tb2c-mysubaru-interfaces-module/blob/master/src/main/java/com/subaru/mysubaru/interfaces/telematics/VehicleHealthItem.java
 */
export interface VehicleHealthItem {
  warningCode: number
  b2cCode: B2CCode
  isTrouble: boolean
  onDates: string[]
  onDaiId: number
}

/**
 * Key value map returned by Java.
 **/
export interface VehicleHealthMap {
  lastUpdatedDate: number
  vehicleHealthItems: VehicleHealthItem[]
  vin?: string
  reportTimePeriods?: VehicleReportTimePeriod[]
  monthStartDate?: string
  monthEndDate?: string
  dateRangeSelectorControl?: string
}

/**
 * Used by multiple endpoints. Most requests only need vin.
 *
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/data/VehicleInfoRequest.java
 **/
export interface VehicleInfoRequest {
  firstName?: string
  lastName?: string
  mobilePhone?: string
  address?: string
  address2?: string
  city?: string
  state?: string
  zip?: string
  vin?: string
  vehicleKey?: string
  nickname?: string
  licensePlate?: string
  licensePlateState?: string
  mileageEstimate?: number
  confirmMileage?: number
  mileageCalculated?: number
  timeZone?: string
}

/**
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/data/VehicleReportTimePeriod.java
 **/
export interface VehicleReportTimePeriod {
  monthsAgo: number
  startDate: number
  endDate: number
}

/**
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mysubaru-interfaces-module/blob/master/src/main/java/com/subaru/mysubaru/interfaces/vehicle/VehicleRecallInfo.java
 **/
export interface VehicleRecallInfo {
  recallCode: string
  recallProcNum: string
  nHTSARecallNum: string
  type: string
  recallDate: string
  shortDescription: string
  recallDescription: string
  safetyRiskDescription: string
  remedyDescription: string
  url: string
  recallLetter: string
  recallStatus: string
  recallProgramType: string
  custNotificationDate: string
  formattedRecallDate: string
  locale: string
}

/**
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mysubaru-interfaces-module/blob/master/src/main/java/com/subaru/mysubaru/interfaces/telematics/VehicleStatus.java
 **/
export interface VehicleStatus {
  distanceToEmptyFuelMiles10s: number
  distanceToEmptyFuelKilometers10s: number
  vhsId: number
  odometerValue: number
  odometerValueKilometers: number
  eventDate: number
  eventDateCarUser: number
  latitude: number
  longitude: number
  positionHeadingDegree: string
  tirePressureFrontLeft: string
  tirePressureFrontRight: string
  tirePressureRearLeft: string
  tirePressureRearRight: string
  tirePressureFrontLeftPsi: string
  tirePressureFrontRightPsi: string
  tirePressureRearLeftPsi: string
  tirePressureRearRightPsi: string
  doorBootPosition: string
  doorEngineHoodPosition: string
  doorFrontLeftPosition: string
  doorFrontRightPosition: string
  doorRearLeftPosition: string
  doorRearRightPosition: string
  doorBootLockStatus: string
  doorFrontLeftLockStatus: string
  doorFrontRightLockStatus: string
  doorRearLeftLockStatus: string
  doorRearRightLockStatus: string
  distanceToEmptyFuelMiles: number
  distanceToEmptyFuelKilometers: number
  avgFuelConsumptionMpg: number
  avgFuelConsumptionLitersPer100Kilometers: number
  evStateOfChargePercent: number
  evDistanceToEmptyMiles: number
  evDistanceToEmptyKilometers: number
  evDistanceToEmptyByStateMiles: null
  evDistanceToEmptyByStateKilometers: null
  vehicleStateType: string
  windowFrontLeftStatus: string
  windowFrontRightStatus: string
  windowRearLeftStatus: string
  windowRearRightStatus: string
  windowSunroofStatus: string
  tyreStatusFrontLeft: string
  tyreStatusFrontRight: string
  tyreStatusRearLeft: string
  tyreStatusRearRight: string
  remainingFuelPercent: number | null
  eventDateStr: string
  eventDateStrCarUser: string
}

/**
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/domain/UsageReportEventUser.java
 **/
export interface UsageReportEventUser {
  userId: string
  userType: string
}

export interface WarningLight {
  b2cCode: B2CCode
  isAssignedToOpCode: boolean
  opCode: string
  warningLightCode: string
}

export interface WarningLights {
  dealerCode: string
  isValidDealerCode: boolean
  loopCompanyId: number
  warningLights?: WarningLight[]
}

/**
 * Backend: https://github.com/SubaruOfAmerica/tb2c-autoloopclient-module/blob/main/src/main/java/com/subaru/tele/cloud/tsp/autoloop/api/domain/WarningLightsResponse.java
 * */
export interface WarningLightsResponse extends ScheduleMessage {
  dealersWarningLights?: WarningLights[]
}

export type POIcategory = 'FAV' | 'HOME' | 'WORK' | 'TOMTOM' | 'DEALER'

/**
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/995c6e207d4a97193234e8f649a45c351297a56a/src/main/java/com/subaru/tele/cloud/api/controller/g2/data/SendPoiExecuteRequest.java#L48
 */
//TODO:MN:20240404: Check the data types in the interfaces below
//TODO:MN:20240422: Check and remove redundant properties in POIResponse
export interface POIRequest {
  displayName: string
  distanceText: string
  mysPoiCategory: POIcategory | null
  mysPoiName: string | null
  name: string
  poiId: number | null // todo check this
  tripPoiId: string | null // todo check this
  latitude: number
  longitude: number
  formattedAddress: string
  streetNumber: number
  street: string
  city: string
  state: string
  zip: string
}

export interface POIResponse extends POIRequest {
  poiId: number
  accountId: number
  mysPoiName: string
  mysPoiCategory: POIcategory | null
  tripPoiId: string | null // todo check this
  zip: number
  formattedAddress: string
  streetNumber: number
  city: string
  street: string
  name: string
  state: string
  displayName: string
  distanceText: string
  longitude: number
  latitude: number
}

export interface TripDestinationResult {
  id?: string
  poiId?: number | null
  name: string
  zip: string
  freeformAddress: string
  streetNumber: string | null
  streetName: string
  city: string
  state: string
  distance: string
  position: {
    lat: number
    lon: number
  }
  mysPoiName?: string | null
  mysPoiCategory?: POIcategory | null
}

export interface CreateTripResponse {
  tripId: number
  accountId: number
  name: string
  tripJson: null
  pois: {
    tripPoiId: number
    sortOrder: number
    poi: POIResponse
  }[]
}

export interface RetrieveAllTripsResponse extends CreateTripResponse {
  accountId: number
}

export interface CreateTripParams {
  name: string
  pois: { poi: POIRequest }[]
}

export interface UpdateTripParams extends CreateTripParams {
  tripId: number
}

export interface DeleteTripParams {
  tripId: number
}

export interface DeleteTripResponse {
  data: string
}

export interface DeletePOIRequest {
  poiId: number | undefined
}

export type TripsDestinationScreenMode =
  | 'WORK'
  | 'EXPLORE'
  | 'TRIP'
  | 'FAVORITE'
