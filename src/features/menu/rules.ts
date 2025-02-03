import { Platform } from 'react-native'
import { ClientSessionVehicle } from '../../../@types'
import { store } from '../../store'

import featureFlags from '../../../featureFlags.json'
import devFlags from '../../../devFlags.json'
export type MgaFeatureFlag =
  | keyof typeof featureFlags
  | `local:${keyof typeof devFlags}`

import {
  getVehicleGeneration,
  hasActiveStarlinkSubscription,
} from '../../utils/vehicle'
import {
  getCurrentVehicle,
  getRegisteredDeviceStatus,
} from '../auth/sessionSlice'
import {
  getCurrentEnvironmentConfig,
  getLanguages,
} from '../localization/environment'

export type CapabilityCode =
  | 'NAV_HERE'
  | 'NAV_TOMTOM'
  | 'PHEV'
  | 'RCC'
  | 'RDP'
  | 'RHSF'
  | 'RVFS'
  | 'RHVAC'
  | 'RES'
  | 'RESCC'
  | 'RPOI'
  | 'TLD'
  | 'TRAFFIC'
  | 'VALET'

// TODO:UA:20241216 should eventually only include capabilities that are actually remote services
export type RemoteServiceType = CapabilityCode | '*'

/** Values returned in subscription features + NONE */
export type SubscriptionType =
  | 'NONE' // No active subscription
  | 'SAFETY' // has no remote services
  | 'REMOTE' // requires safety
  | 'CONCIERGE' // requires remote
  | 'TRAFFIC_CONNECT' // not related to remote services
  // g4 or model year 2026 tbd
  | 'COMPANION' // has *some* remote services (locate)
  | 'COMPANION_PLUS' // has *most* remote services (locate, lock, unlock, etc), but not trip tracker (planner?)
  | 'NAVI' // trip tracker (planner?)

export type AccessRuleToken =
  | 'cap:g0'
  | 'cap:g1'
  | 'cap:g2'
  | 'cap:g3'
  | 'cap:g4'
  | `cap:${CapabilityCode}`
  | 'car:Provisioned'
  | 'car:RightToRepair'
  | 'car:Stolen'
  | 'dev:biometrics'
  | 'dev:gps'
  | 'env:qa'
  | 'env:prod'
  | 'env:DemoMode'
  | `env:${'cloudqa' | 'cloudprod'}${string}`
  | `flg:${MgaFeatureFlag}`
  | 'lng:multiple'
  | `os:${'ios' | 'android' | 'windows' | 'macos' | 'web'}`
  | 'reg:US'
  | 'reg:CA'
  | 'reg:HI'
  | `res:${RemoteServiceType}`
  | `sub:${SubscriptionType}`
  | 'usr:primary'
  | 'usr:secondary:1'
  | 'usr:secondary:2'
export type AccessRuleLogic =
  | { and?: AccessRule }
  | { or?: AccessRule }
  | { not?: AccessRule }
export type AccessRule = AccessRuleToken | AccessRuleLogic | AccessRule[]

export const gen1Plus: AccessRule = {
  or: ['cap:g1', 'cap:g2', 'cap:g3', 'cap:g4'],
}
export const gen2Plus: AccessRule = { or: ['cap:g2', 'cap:g3', 'cap:g4'] }
export const gen3Plus: AccessRule = { or: ['cap:g3', 'cap:g4'] }
export const gen1PlusSafetyOnly: AccessRule = [
  gen1Plus,
  'sub:SAFETY',
  { not: 'sub:REMOTE' },
  // TODO:UA:20240209 -- should not check provisioning. remove and ensure any consumers of gen1PlusSafetyOnly check provisioning.
  'car:Provisioned',
  { not: 'car:Stolen' },
]
// TODO:UA:20250110 - remove this rule definition and any references as part of c25 cleanup
export const subSafetyPlus: AccessRule = {
  or: ['sub:SAFETY', 'sub:REMOTE', 'sub:CONCIERGE', 'sub:COMPANION_PLUS'],
}
export const retailerNormal: AccessRule = [
  { not: 'env:DemoMode' },
  { not: 'reg:HI' },
  'usr:primary',
]
export const retailerHawaii: AccessRule = [
  { not: 'env:DemoMode' },
  'reg:HI',
  'usr:primary',
]
export const authorizedBilling: AccessRule = [
  gen2Plus,
  'usr:primary',
  'sub:SAFETY',
]
export const authorizedPIN: AccessRule = {
  or: [
    [gen2Plus, 'sub:REMOTE'],
    [gen1Plus, 'sub:REMOTE', 'usr:primary'],
  ],
}
export const gen2PlusSafetyOnly: AccessRule = [
  gen2Plus,
  'sub:SAFETY',
  { not: 'sub:REMOTE' },
]
/** Indicates vehicle has allowed Remote Points of Interest.
 *
 *  This rule checks RPOI and also confirms vehicle subscription status.
 *  - Use `capRPOIActive` to control whether or not RPOI is allowed. (ex: Trips)
 *  - Use `'cap:RPOI'` directly to determine if RPOI is possible. (ex: Subscriptions)
 */
export const capRPOIActive: AccessRule = [
  gen2Plus,
  'sub:REMOTE',
  'car:Provisioned',
  { not: 'car:Stolen' },
  'cap:RPOI',
]

export const gen1PlusSubscribed: AccessRule = {
  and: [gen1Plus, 'sub:SAFETY'],
}

/**
 * Vehicles with Remote Engine Start and Remote Climate Control
 * may have RES+RCC or the combined RESCC.
 **/
export const capabilityRESCC: AccessRule = {
  or: ['cap:RESCC', ['cap:RES', 'cap:RCC']],
}

export const featureFlagEnabled = (flag: MgaFeatureFlag): boolean => {
  const flagStr = flag as string
  if (flagStr.startsWith('local:') && flagStr.length > 6) {
    const devFlag = flagStr.substring(6) as keyof typeof devFlags
    return devFlags[devFlag] ?? false
  }
  const config = getCurrentEnvironmentConfig()
  if (config) {
    const flags = config.featureFlags
    return !!flags?.[flagStr as keyof typeof featureFlags]
  }
  return false
}
/**
 * Check features (vehicle, subscription, user access, region, etc...)
 *
 * @param rules rule or collection of rules to check
 * @param vehicle (Optional, default is current) vehicle to use during check
 **/
export const has = (
  rules?: AccessRule,
  vehicle?: ClientSessionVehicle | null,
): boolean => {
  if (!rules) {
    return true
  }
  const v = vehicle ?? getCurrentVehicle()
  const isRegisteredDevice = getRegisteredDeviceStatus()

  if (!v) {
    return false
  }
  const subs = v.subscriptionFeatures ?? []
  const features = v.features ?? []
  if (typeof rules == 'string') {
    if (rules.startsWith('cap:')) {
      const feature = rules.substring(4)
      // adding this block because sometimes a g1 is a g0
      if (feature == 'g0') return getVehicleGeneration(v) == 0
      if (feature == 'g1') return getVehicleGeneration(v) == 1
      if (feature == 'g2') return getVehicleGeneration(v) == 2
      if (feature == 'g3') return getVehicleGeneration(v) == 3
      if (feature == 'g4') return getVehicleGeneration(v) == 4

      return features.includes(feature) ?? false
    } else if (rules.startsWith('res:')) {
      const remoteService = rules.substring(4)
      return hasRemoteService(remoteService as RemoteServiceType, v)
    } else if (rules.startsWith('flg:')) {
      const flag = rules.substring(4)
      return featureFlagEnabled(flag as MgaFeatureFlag)
    } else if (rules.startsWith('env:')) {
      const config = getCurrentEnvironmentConfig()
      if (!config) {
        return false
      }
      // handle qa/prod/demo
      switch (rules) {
        case 'env:qa':
          return config.type == 'qa'
        case 'env:prod':
          return config.type == 'prod'
        case 'env:DemoMode':
          return store.getState().demo
        default:
          // if not qa/prod/demo, compare specific environment
          return rules.substring(4) === config.id
      }
    } else if (rules.startsWith('os:')) {
      return Platform.OS == rules.substring(3)
    } else if (rules.startsWith('sub:')) {
      const subscription = rules.substring(4) as SubscriptionType
      // no subs
      if (subscription == 'NONE' && !hasActiveStarlinkSubscription(v))
        return true
      // TODO:UA:20241217 see if we still need special case for traffic connect,
      if (subscription == 'TRAFFIC_CONNECT')
        return subs.includes('TRAFFIC_CONNECT')
      // TOD:UA:20241217 see if we still need to check hasActiveStarlinkSubscription
      return hasActiveStarlinkSubscription(v) && subs.includes(subscription)
    } else {
      switch (rules) {
        case 'car:Provisioned':
          return v.provisioned
        case 'car:RightToRepair':
          return isCurrentVehicleRightToRepair(v)
        case 'car:Stolen':
          return v.stolenVehicle
        case 'dev:biometrics': {
          const state = store.getState()
          return (
            state.demo == false &&
            isRegisteredDevice &&
            state.biometrics?.biometryType != undefined &&
            has('sub:REMOTE', v)
          )
        }
        case 'dev:gps':
          return store.getState().geolocation?.position != undefined
        case 'lng:multiple':
          return getLanguages().length > 1
        case 'reg:US':
          return store.getState().session?.account.marketId == 1
        case 'reg:CA':
          return store.getState().session?.account.marketId == 2
        case 'reg:HI':
          return (
            v.customer?.sessionCustomer?.state == 'HI' ||
            v.cachedStateCode == 'HI'
          )

        case 'usr:primary':
          return v.authorizedVehicle == false
        case 'usr:secondary:1':
          return v.accessLevel == 1
        case 'usr:secondary:2':
          return v.accessLevel == 2
        default:
          return false
      }
    }
  } else if (Array.isArray(rules)) {
    return rules.every(rule => has(rule, v))
  } else if (typeof rules == 'object') {
    const { and, or, not } = rules as {
      and?: AccessRule
      or?: AccessRule
      not?: AccessRule
    }
    if (and) {
      return has(and, v)
    } else if (or) {
      if (Array.isArray(or)) {
        return or.some(rule => has(rule, v))
      } else {
        return has(or, v)
      }
    } else if (not) {
      return !has(not, v)
    } else {
      return false
    }
  } else {
    return false
  }
}

export const isCurrentVehicleRightToRepair = (
  vehicle: ClientSessionVehicle | null,
): boolean => {
  return isCurrentVehicleRightToRepairByState(
    vehicle,
    vehicle?.customer.sessionCustomer?.state,
  )
}

export const isCurrentVehicleRightToRepairByState = (
  vehicle: ClientSessionVehicle | null | undefined,
  state: string | null | undefined,
): boolean => {
  const session = store.getState().session
  if (!vehicle) return false
  if (!session) return false
  if (!state) return false
  const enabled = session.rightToRepairEnabled ?? false
  const modelYear = vehicle.modelYear ?? ''
  const startYear = session.rightToRepairStartYear ?? 2022
  const states = session.rightToRepairStates ?? 'MA'
  return (
    enabled &&
    modelYear >= String(startYear) &&
    (vehicle.crmRightToRepair || states.includes(state))
  )
}

/** Determines whether a vehicle's subscription is entitled to use a remote service .  */
export const hasRemoteService = (
  service: RemoteServiceType,
  vehicle: ClientSessionVehicle,
  testing?: boolean,
): boolean => {
  if (testing || featureFlagEnabled('mga.g4Subscriptions')) {
    // a car has to have the capability to use the service
    // a subscription has to have an entitlement to use the service
    // "*" means ANY service. going forward we will mostly replace wildcard with specific service names
    // "entitlements" are nearly all identical to capabilities, so using cap:{x} for now.  there are some exceptions (LOCATE).
    // TODO:AG:20241220 - map entitlements to capabilities.
    //  for now res:* is a direct replacement for sub:REMOTE wherever sub:REMOTE was used to mean "has any services"
    // NOTE:  we will still need to check SUB:REMOTE sometimes, but only where we are specifically looking at subscriptions
    const hasEntitlement = service === '*' || has(`cap:${service}`, vehicle)
    const hasSubscription = has(
      { or: ['sub:REMOTE', 'sub:COMPANION_PLUS'] }, // until we have a map of subscriptions to entitlements
      vehicle,
    )
    return (
      hasEntitlement && hasSubscription
      // a subscription has to allow the service
      // this line is temporary, need to create map of subscriptions to services
    )
  }

  // fall back -- any car w/ remote has all services
  return has('sub:REMOTE', vehicle)
}
