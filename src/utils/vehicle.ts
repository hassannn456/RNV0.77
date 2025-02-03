// cSpell:ignore schedulable, PANPM, TUIRWAOC, PANMRF, FGTU, INTRETR, PWRSHD
import {
  ClientSessionVehicle,
  VehicleHealthItem,
  VehicleHealthMap,
  VehicleStatus,
} from '../../@types'

export type ClimateFrontAirMode =
  | 'WINDOW'
  | 'FACE'
  | 'FEET'
  | 'FEET_FACE_BALANCED'
  | 'FEET_WINDOW'
  | 'AUTO'
export type HeatedSeatSetting =
  | 'OFF'
  | 'LOW_COOL'
  | 'MEDIUM_COOL'
  | 'HIGH_COOL'
  | 'LOW_HEAT'
  | 'MEDIUM_HEAT'
  | 'HIGH_HEAT'
export type OutsideAirSetting = 'recirculation' | 'outsideAir' | 'AUTO'
/**
 * Remote Engine Start preset
 *
 * Value is stored as PAGE_ATTR_JSON. Keys not guaranteed.
 *
 * https://github.com/SubaruOfAmerica/tb2c-mysubaru-data-module/blob/development/src/main/java/com/subaru/mysubaru/data/repository/RemoteServiceUserSettingsRepository.java
 **/
export interface EngineStartSettings {
  name: string
  runTimeMinutes: string
  startConfiguration: string
  presetType: 'subaruPreset' | 'userPreset'
  includeClimate?: false
  /** °F */
  climateZoneFrontTemp?: string
  /** °C */
  climateZoneFrontTempCelsius?: string
  climateZoneFrontAirMode?: ClimateFrontAirMode
  climateZoneFrontAirVolume?: string
  outerAirCirculation?: OutsideAirSetting
  heatedRearWindowActive?: 'true' | 'false'
  heatedSeatFrontLeft?: HeatedSeatSetting
  heatedSeatFrontRight?: HeatedSeatSetting
  airConditionOn?: 'true' | 'false'
  canEdit?: 'true' | 'false'
  disabled?: 'true' | 'false'
  index?: number
  vehicleType?: 'gas' | 'phev'
}

/** Extract generation of vehicle from features list.
 *
 * Features array may be null during earliest parts of login;
 * it should be populated before if generation info is actually needed.
 */
export const getVehicleGeneration = (
  vehicle: ClientSessionVehicle | null,
): 0 | 1 | 2 | 3 | 4 => {
  if (!vehicle) {
    return 0
  }
  if (!vehicle.features) {
    return 0
  }
  // Normal payloads have generation at the end of features list making this an O(1) check
  for (let i = vehicle.features.length - 1; i >= 0; i--) {
    const feature = vehicle.features[i]
    if (feature == 'g0') {
      return 0
    }
    if (feature == 'g1') {
      return vehicle.subscriptionStatus != 'ACTIVE' && !vehicle.sunsetUpgraded
        ? 0
        : 1
    }
    if (feature == 'g2') {
      return 2
    }
    if (feature == 'g3') {
      return 3
    }

    if (feature == 'g4') {
      return 4
    }
  }
  return 0
}

/** Lockout time for PIN in minutes
 *
 * Different providers (SXM for gen1, Wireless Car for gen2+)
 * have different lockout times.
 */
export const getPINLockoutTimeMinutes = (
  vehicle: ClientSessionVehicle | null,
): number => {
  switch (getVehicleGeneration(vehicle)) {
    case 0:
    case 1:
      return 60
    case 2:
    case 3:
    case 4:
      return 10
  }
}

/**
 * Gas car or PHEV?
 *
 * Vehicles include a features array with ['PHEV'] and a phev flag.
 * Only checking first to match current application.
 * When electric cars are added or logic is changed,
 * Having function will fail unit tests, etc...
 **/
export const getVehicleType = (
  vehicle: ClientSessionVehicle | null,
): 'gas' | 'phev' => {
  return vehicle?.features?.includes('PHEV') ? 'phev' : 'gas'
}

/** Get vehicle health normal items (for counting or display) */
export const getVehicleNormalItems = (
  vhMap: VehicleHealthMap | null | undefined,
): VehicleHealthItem[] => {
  if (!vhMap) {
    return []
  }
  return vhMap.vehicleHealthItems?.filter(item => !item.isTrouble) || []
}

/** Get vehicle health warning items (for counting or display) */
export const getVehicleWarningItems = (
  vhMap: VehicleHealthMap | null | undefined,
): VehicleHealthItem[] => {
  if (!vhMap) {
    return []
  }
  return vhMap.vehicleHealthItems?.filter(item => item.isTrouble) || []
}

/** Feature test to see if car has a moonroof */
export const hasMoonroof: (
  vehicle: ClientSessionVehicle | null,
) => boolean = vehicle => {
  if (!vehicle) return false
  if (!vehicle.features) return false
  if (vehicle.features.includes('PANPM-DG2G')) return true
  if (vehicle.features.includes('PANPM-TUIRWAOC')) return true
  if (vehicle.features.includes('PANMRF_ES')) return true
  if (vehicle.features.includes('PANPM-FGTU')) return true
  if (vehicle.features.includes('PANPM-INTRETR')) return true
  if (vehicle.features.includes('PANPM-PWRSHD')) return true
  if (vehicle.features.includes('MOONSTAT')) return true
  return false
}

/** Feature test to see if car reports any door info */
export const hasDoorInfo: (
  vehicle: ClientSessionVehicle | null,
) => boolean = vehicle => {
  if (!vehicle) return false
  if (!vehicle.features) return false
  if (vehicle.features.includes('DOORF')) return true
  if (vehicle.features.includes('DOORALL')) return true
  if (vehicle.features.includes('DOOR_OC_STAT')) return true
  if (vehicle.features.includes('TAIL_OC_STAT')) return true
  if (vehicle.features.includes('HOODSTAT')) return true
  if (vehicle.features.includes('DOOR_LU_STAT')) return true
  if (vehicle.features.includes('TAIL_LU_STAT')) return true
  return false
}

export type VehicleConditionCheckIssue =
  | 'fuelLow'
  | 'tirePSI'
  | 'windowOpen'
  | 'doorOpen'
  | 'doorUnlocked'

export interface VehicleConditionCheck extends VehicleStatus {
  /** List of issues by key. */
  issues: VehicleConditionCheckIssue[]
  /** Show front left tire issue indicator. */
  tirePressureFrontLeftWarning?: boolean
  /** Show front right tire issue indicator. */
  tirePressureFrontRightWarning?: boolean
  /** Show rear left tire issue indicator. */
  tirePressureRearLeftWarning?: boolean
  /** Show rear right tire issue indicator. */
  tirePressureRearRightWarning?: boolean
  /** Number of tires with a warning. */
  tirePressureWarningCount: number
  /** Recommended front tire pressure (PSI). */
  tireRecommendedFront?: string
  /** Recommended rear tire pressure (PSI). */
  tireRecommendedRear?: string
  /** Show front left window issue indicator. */
  windowFrontLeftWarning?: boolean
  /** Show front right window issue indicator. */
  windowFrontRightWarning?: boolean
  /** Show rear left window issue indicator. */
  windowRearLeftWarning?: boolean
  /** Show rear right window issue indicator. */
  windowRearRightWarning?: boolean
  /** Show moonroof issue indicator. */
  windowSunroofWarning?: boolean
  /** Number of windows with a warning. */
  windowOpenCount: number
  /**
   * Number of doors with a warning.
   *
   * Tailgate and hood included. Open and unlocked door counts as one warning.
   **/
  doorIssueCount: number
  /** Number of open doors (not counting tailgate and hood). */
  doorOpenCount: number
  /** Number of unlocked doors (not counting tailgate). */
  doorUnlockedCount: number
  /** Show front left window issue indicator. */
  doorFrontLeftWarning?: boolean
  /** Show front right window issue indicator. */
  doorFrontRightWarning?: boolean
  /** Show rear left window issue indicator. */
  doorRearLeftWarning?: boolean
  /** Show rear right window issue indicator. */
  doorRearRightWarning?: boolean
  /** Is tailgate open? */
  doorBootOpen?: boolean
  /** Is tailgate unlocked? */
  doorBootUnlocked?: boolean
  /** Show tailgate issue indicator. */
  doorBootWarning?: boolean
  /** Show hood issue indicator. */
  doorEngineHoodWarning?: boolean
}

/**
 * Typescript is convinced the return type of getVehicleConditionCheck
 * is `VehicleConditionCheck` not `VehicleConditionCheck | undefined`
 * providing a sentinel with dummy data to prevent crashes.
 **/
const emptyVehicleConditionCheck: VehicleConditionCheck = {
  issues: [],
  tirePressureWarningCount: 0,
  windowOpenCount: 0,
  doorIssueCount: 0,
  doorOpenCount: 0,
  doorUnlockedCount: 0,
  distanceToEmptyFuelMiles10s: 0,
  distanceToEmptyFuelKilometers10s: 0,
  vhsId: 0,
  odometerValue: 0,
  odometerValueKilometers: 0,
  eventDate: 0,
  eventDateCarUser: 0,
  latitude: 0,
  longitude: 0,
  positionHeadingDegree: '--',
  tirePressureFrontLeft: '--',
  tirePressureFrontRight: '--',
  tirePressureRearLeft: '--',
  tirePressureRearRight: '--',
  tirePressureFrontLeftPsi: '--',
  tirePressureFrontRightPsi: '--',
  tirePressureRearLeftPsi: '--',
  tirePressureRearRightPsi: '--',
  doorBootPosition: '--',
  doorEngineHoodPosition: '--',
  doorFrontLeftPosition: '--',
  doorFrontRightPosition: '--',
  doorRearLeftPosition: '--',
  doorRearRightPosition: '--',
  doorBootLockStatus: '--',
  doorFrontLeftLockStatus: '--',
  doorFrontRightLockStatus: '--',
  doorRearLeftLockStatus: '--',
  doorRearRightLockStatus: '--',
  distanceToEmptyFuelMiles: 0,
  distanceToEmptyFuelKilometers: 0,
  avgFuelConsumptionMpg: 0,
  avgFuelConsumptionLitersPer100Kilometers: 0,
  evStateOfChargePercent: 0,
  evDistanceToEmptyMiles: 0,
  evDistanceToEmptyKilometers: 0,
  evDistanceToEmptyByStateMiles: null,
  evDistanceToEmptyByStateKilometers: null,
  vehicleStateType: '--',
  windowFrontLeftStatus: '--',
  windowFrontRightStatus: '--',
  windowRearLeftStatus: '--',
  windowRearRightStatus: '--',
  windowSunroofStatus: '--',
  tyreStatusFrontLeft: '--',
  tyreStatusFrontRight: '--',
  tyreStatusRearLeft: '--',
  tyreStatusRearRight: '--',
  remainingFuelPercent: 0,
  eventDateStr: '--',
  eventDateStrCarUser: '--',
}

/** Extract warnings from Vehicle Status data. */
export const getVehicleConditionCheck = (
  vehicle: ClientSessionVehicle | null,
  vehicleHealthMap: VehicleHealthMap | null | undefined,
  vehicleStatusMap: VehicleStatus | null | undefined,
): VehicleConditionCheck | undefined => {
  if (!vehicle) return emptyVehicleConditionCheck
  if (!vehicleHealthMap) return emptyVehicleConditionCheck
  if (!vehicleStatusMap) return emptyVehicleConditionCheck
  const result: VehicleConditionCheck = {
    ...vehicleStatusMap,
    issues: [],
    tirePressureWarningCount: 0,
    windowOpenCount: 0,
    doorIssueCount: 0,
    doorOpenCount: 0,
    doorUnlockedCount: 0,
  }
  const features = vehicle.features ?? []
  // vehicleStatus.json reports values when there is no sensor - stripping them here
  // Window Open/Close Sensor
  if (!features.includes('WDWSTAT')) {
    result.windowFrontLeftStatus = ''
    result.windowFrontRightStatus = ''
    result.windowRearLeftStatus = ''
    result.windowRearRightStatus = ''
  }
  // Moonroof Open/Close Sensor
  if (!features.includes('MOONSTAT')) {
    result.windowSunroofStatus = ''
  }
  // Vehicle is Two Door
  if (features.includes('DOORF') && !features.includes('DOORALL')) {
    result.doorRearLeftLockStatus = ''
    result.doorRearRightLockStatus = ''
    result.doorRearLeftPosition = ''
    result.doorRearRightPosition = ''
    result.windowRearLeftStatus = ''
    result.windowRearRightStatus = ''
  }
  // Door Open/Close Sensor
  if (!features.includes('DOOR_OC_STAT')) {
    result.doorFrontLeftPosition = ''
    result.doorFrontRightPosition = ''
    result.doorRearLeftPosition = ''
    result.doorRearRightPosition = ''
  }
  // Hood Open/Close Sensor
  if (!features.includes('HOODSTAT')) {
    result.doorEngineHoodPosition = ''
  }
  // Tailgate Open/Close Sensor
  if (!features.includes('TAIL_OC_STAT')) {
    result.doorBootPosition = ''
  }
  // Door Lock/Unlock Sensor
  if (!features.includes('DOOR_LU_STAT')) {
    result.doorFrontLeftLockStatus = ''
    result.doorFrontRightLockStatus = ''
    result.doorRearLeftLockStatus = ''
    result.doorRearRightLockStatus = ''
  }
  // Tailgate Lock/Unlock Sensor
  if (!features.includes('TAIL_LU_STAT')) {
    result.doorBootLockStatus = ''
  }
  // Fuel Percent - Gen2 always reports null or 75%
  if (!features.includes('g3')) {
    result.remainingFuelPercent = null
  }
  // Low Tires
  // Tire problems are determined by TPMS sensor even if tires read low
  const tireHasIssue =
    vehicleHealthMap?.vehicleHealthItems?.find(i => i.b2cCode == 'tpms')
      ?.isTrouble ?? false
  result.tireRecommendedFront = features
    .find(a => a.includes('TIF_'))
    ?.replace('TIF_', '')
  result.tireRecommendedRear = features
    .find(a => a.includes('TIR_'))
    ?.replace('TIR_', '')
  result.tirePressureFrontLeftPsi = vehicleStatusMap?.tirePressureFrontLeftPsi
    ? parseFloat(vehicleStatusMap?.tirePressureFrontLeftPsi).toFixed()
    : '--'
  result.tirePressureFrontRightPsi = vehicleStatusMap?.tirePressureFrontRightPsi
    ? parseFloat(vehicleStatusMap?.tirePressureFrontRightPsi).toFixed()
    : '--'
  result.tirePressureRearLeftPsi = vehicleStatusMap?.tirePressureRearLeftPsi
    ? parseFloat(vehicleStatusMap?.tirePressureRearLeftPsi).toFixed()
    : '--'
  result.tirePressureRearRightPsi = vehicleStatusMap?.tirePressureRearRightPsi
    ? parseFloat(vehicleStatusMap?.tirePressureRearRightPsi).toFixed()
    : '--'
  if (tireHasIssue) {
    result.issues.push('tirePSI')
    if (
      vehicleStatusMap.tirePressureFrontLeftPsi <
      (result.tireRecommendedFront ?? '27')
    ) {
      result.tirePressureFrontLeftWarning = true
      result.tirePressureWarningCount++
    }
    if (
      vehicleStatusMap.tirePressureFrontRightPsi <
      (result.tireRecommendedFront ?? '27')
    ) {
      result.tirePressureFrontRightWarning = true
      result.tirePressureWarningCount++
    }
    if (
      vehicleStatusMap.tirePressureRearLeftPsi <
      (result.tireRecommendedRear ?? '27')
    ) {
      result.tirePressureRearLeftWarning = true
      result.tirePressureWarningCount++
    }
    if (
      vehicleStatusMap.tirePressureRearRightPsi <
      (result.tireRecommendedRear ?? '27')
    ) {
      result.tirePressureRearRightWarning = true
      result.tirePressureWarningCount++
    }
  }
  // Open Windows
  const isOpen = (status: string) =>
    status &&
    status.toUpperCase() != 'CLOSE' &&
    status.toUpperCase() != 'UNKNOWN'
  if (isOpen(result.windowFrontLeftStatus)) {
    result.windowFrontLeftWarning = true
    result.windowOpenCount++
  }
  if (isOpen(result.windowFrontRightStatus)) {
    result.windowFrontRightWarning = true
    result.windowOpenCount++
  }
  if (isOpen(result.windowRearLeftStatus)) {
    result.windowRearLeftWarning = true
    result.windowOpenCount++
  }
  if (isOpen(result.windowRearRightStatus)) {
    result.windowRearRightWarning = true
    result.windowOpenCount++
  }
  if (isOpen(result.windowSunroofStatus)) {
    result.windowSunroofWarning = true
  }
  if (result.windowOpenCount > 0 || result.windowSunroofWarning) {
    result.issues.push('windowOpen')
  }
  // Open Doors
  if (result.doorFrontLeftPosition == 'OPEN') {
    if (!result.doorFrontLeftWarning) {
      result.doorIssueCount++
    }
    result.doorFrontLeftWarning = true
    result.doorOpenCount++
  }
  if (result.doorFrontRightPosition == 'OPEN') {
    if (!result.doorFrontRightWarning) {
      result.doorIssueCount++
    }
    result.doorFrontRightWarning = true
    result.doorOpenCount++
  }
  if (result.doorRearLeftPosition == 'OPEN') {
    if (!result.doorRearLeftWarning) {
      result.doorIssueCount++
    }
    result.doorRearLeftWarning = true
    result.doorOpenCount++
  }
  if (result.doorRearRightPosition == 'OPEN') {
    if (!result.doorRearRightWarning) {
      result.doorIssueCount++
    }
    result.doorRearRightWarning = true
    result.doorOpenCount++
  }
  if (result.doorBootPosition == 'OPEN') {
    if (!result.doorBootWarning) {
      result.doorIssueCount++
    }
    result.doorBootOpen = true
    result.doorBootWarning = true
    result.doorBootUnlocked = true
  }
  if (result.doorEngineHoodPosition == 'OPEN') {
    if (!result.doorEngineHoodWarning) {
      result.doorIssueCount++
    }
    result.doorEngineHoodWarning = true
  }
  if (
    result.doorOpenCount ||
    result.doorEngineHoodWarning ||
    result.doorBootOpen
  ) {
    result.issues.push('doorOpen')
    result.issues.push('doorUnlocked')
  }
  // Unlocked Doors
  if (
    result.doorFrontLeftPosition == 'CLOSED' &&
    result.doorFrontLeftLockStatus == 'UNLOCKED'
  ) {
    if (!result.doorFrontLeftWarning) {
      result.doorIssueCount++
    }
    result.doorFrontLeftWarning = true
    result.doorUnlockedCount++
  }
  if (
    result.doorFrontRightPosition == 'CLOSED' &&
    result.doorFrontRightLockStatus == 'UNLOCKED'
  ) {
    if (!result.doorFrontRightWarning) {
      result.doorIssueCount++
    }
    result.doorFrontRightWarning = true
    result.doorUnlockedCount++
  }
  if (
    result.doorRearLeftPosition == 'CLOSED' &&
    result.doorRearLeftLockStatus == 'UNLOCKED'
  ) {
    if (!result.doorRearLeftWarning) {
      result.doorIssueCount++
    }
    result.doorRearLeftWarning = true
    result.doorUnlockedCount++
  }
  if (
    result.doorRearRightPosition == 'CLOSED' &&
    result.doorRearRightLockStatus == 'UNLOCKED'
  ) {
    if (!result.doorRearRightWarning) {
      result.doorIssueCount++
    }
    result.doorRearRightWarning = true
    result.doorUnlockedCount++
  }
  if (
    result.doorBootPosition == 'CLOSED' &&
    result.doorBootLockStatus == 'UNLOCKED'
  ) {
    if (!result.doorBootWarning) {
      result.doorIssueCount++
    }
    result.doorBootWarning = true
    result.doorBootUnlocked = true
  }
  if (result.doorUnlockedCount || result.doorBootUnlocked) {
    if (!result.issues.includes('doorUnlocked')) {
      result.issues.push('doorUnlocked')
    }
  }
  // Low Fuel
  if (result.remainingFuelPercent && result.remainingFuelPercent < 10) {
    result.issues.push('fuelLow')
  }
  return result
}

/**
 * Given a health report and condition count,
 * return issue count for Dashboard and RVCC.
 *
 **/
export const getVehicleConditionCheckCount = (
  vehicleHealthMap: VehicleHealthMap | null | undefined,
  vehicleConditionCheck: VehicleConditionCheck | null | undefined,
): number => {
  const vhIssues = getVehicleWarningItems(vehicleHealthMap)
  const vccIssues = vehicleConditionCheck?.issues ?? []
  // MGA-1333: TPMS in Health and tirePSI in VCC should count *once*.
  const hasBothTireIssues =
    vhIssues.some(v => v.b2cCode == 'tpms') && vccIssues.includes('tirePSI')
  return vhIssues.length + vccIssues.length - (hasBothTireIssues ? 1 : 0)
}

/** Has Active STARLINK Subscription */
export const hasActiveStarlinkSubscription: (
  vehicle: ClientSessionVehicle | null,
) => boolean = vehicle => {
  if (vehicle == null) return false
  if (vehicle.subscriptionStatus != 'ACTIVE') return false
  if (!vehicle.subscriptionFeatures) return false
  for (let i = 0; i < vehicle.subscriptionFeatures.length; i++) {
    const sub = vehicle.subscriptionFeatures[i]
    if (sub == 'SAFETY') return true
    if (sub == 'REMOTE') return true
    if (sub == 'CONCIERGE') return true
    if (sub == 'COMPANION') return true
    if (sub == 'COMPANION_PLUS') return true
  }
  return false
}

/** Display Vehicle Mileage */
export const displayVehicleMileage: (
  vehicle?: ClientSessionVehicle | null,
) => string = vehicle => {
  return vehicle?.vehicleMileage ? vehicle.vehicleMileage.toString() : '-'
}

export const isVehicleAccountTypeAllowedForTrafficConnect = (
  vehicleAccountType: string,
): boolean => {
  return (
    vehicleAccountType.includes('RETAIL') || vehicleAccountType.includes('CPO')
  )
}
