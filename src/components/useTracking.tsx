// TODO:UA:20240606 -- split non-hook code out of useTracking
// cspell:ignore ECID, MCID, Cust, Evars
import { useContext } from 'react'
import { Dimensions, Platform } from 'react-native'
import { ScreenList, navigationRef } from '../Controller'
import { getDeviceId } from 'react-native-device-info'
import { store } from '../store'
import { getCurrentVehicle } from '../features/auth/sessionSlice'
import { getVehicleGeneration } from '../utils/vehicle'
import { AppleWatchSyncStatus } from '../features/watch/watch'
import { WatchInfo } from '../../@types/Communicator'
// import revisionJson from '../../build/revision.json'

import { MgaButtonProps } from './MgaButton'
import { Identity, MobileCore } from '@adobe/react-native-aepcore'
import { filterFalsy } from '../utils/objects'
import { MgaAnalyticsContext } from './MgaAnalyticsContext'
import { ClientSessionVehicle } from '../../@types'
import { EncodableFormData, encodeFormData } from '../utils/encode'
import {
  getPreference,
  setPreference,
} from '../features/preferences/preferences.slice'
import { featureFlagEnabled } from '../features/menu/rules'
import { getCurrentEnvironmentConfig } from '../features/localization/environment'

type UseTrackingType = {
  trackButton: (props: TrackButtonProps) => void
  trackImpression: (props: TrackButtonProps) => void
}

export type TrackButtonProps = Pick<MgaButtonProps, 'trackingId' | 'title'> & {
  trackingVars?: Evars
}

export const getAnalyticsIdentity = async (): Promise<string | undefined> => {
  if (featureFlagEnabled('mga.analytics')) return undefined
  try {
    const storedEcid = getPreference('aepEcid')

    if (storedEcid) {
      return storedEcid
    }
    const newEcid = await Identity.getExperienceCloudId()
    setPreference('aepEcid', newEcid)
    return newEcid
  } catch (e) {
    trackError('getExperienceCloudId')()
    return undefined
  }
}

export type EvarValue = string | number | undefined | boolean
export type Evars =
  | {
      /** Page Name (v1) */ v1?: EvarValue
      /** Market ID */ v3?: EvarValue
      /** FMA, Hero & Handrail (v5) */ v5?: EvarValue
      /** User Agent String (v6) */ v6?: EvarValue
      /** URI (v7) */ v7?: EvarValue
      /** URI stripped of parameters (v8) */ v8?: EvarValue
      /** URL (v9) */ v9?: EvarValue
      /** Entry URL (v10) */ v10?: EvarValue
      /** Previous Page Name (v11) */ v11?: EvarValue
      /** Device (v13) */ v13?: EvarValue
      /** Viewport Size X&Y (v14) */ v14?: EvarValue
      /** Page Language (v15) */ v15?: EvarValue
      /** Zip Code (v17) */ v17?: EvarValue
      /** Retailer Affinity (v19) */ v19?: EvarValue
      /** MCID (v20) */ v20?: EvarValue
      /** Button Link CTA (v21) */ v21?: EvarValue
      /** Button Link Anchor Text (v22) */ v22?: EvarValue
      /** Button Destination URL (v23) */ v23?: EvarValue
      /** Form Name (v24) */ v24?: EvarValue
      /** Form ID (v25) */ v25?: EvarValue
      /** SOA - Visitor (ECID) (v26) -- same as evar20 */ v26?: EvarValue
      /** Form Filters (v27) */ v27?: EvarValue
      /** Model (v28) */ v28?: EvarValue
      /** Model Year (v29) */ v29?: EvarValue
      /** Trim (v30) */ v30?: EvarValue
      /** Trim Code (v31) */ v31?: EvarValue
      /** Model and Trim (v32) */ v32?: EvarValue
      /** Video (content) (v33) */ v33?: EvarValue
      /** Video (content) Type (v34) */ v34?: EvarValue
      /** Watch OS Sync Status (v40) */ v40?: EvarValue
      /** Form Filters (v46) */ v46?: EvarValue
      /** Tier Value (v61) (Mobile, WatchOS, etc) */ v61?: EvarValue
      /** Adobe Target Variation (v81) */ v81?: EvarValue
      /** Recall Status (v95) */ v95?: EvarValue
      /** Subaru OEM CustID (v102) */ v102?: EvarValue
      /** Hashed Email (v103) */ v103?: EvarValue
      /** Subaru ContactID (v107) */ v107?: EvarValue
      /** Gen Type (v150) */ v150?: EvarValue
      /** App Version (v151) */ v151?: EvarValue
      /** Subscription Level (v152) */ v152?: EvarValue
      /** App State (v153) */ v153?: EvarValue
      /** Biometric Status (v154) */ v154?: EvarValue
      /** Notification Type (v155) */ v155?: EvarValue
      /** Flags (v156) */ v156?: EvarValue
      /** Demo Mode */ v158?: EvarValue
      /** Generic Event Description */ v159?: EvarValue
      /** Generic Event Metadata  */ v160?: EvarValue
      /** Apple Watch Sync Status */ v000?: EvarValue //TODO:MN:20240821 `v000` is placeholder value. replace with real `eVar`.

      /** Page View Counter */ e1?: EvarValue
      /** Component Impression Counter */ e2?: EvarValue
      /** Component Engagement Counter */ e3?: EvarValue
      /** Component/Form Submit Counter */ e4?: EvarValue
      /** Component/Form Completed Counter  */ e5?: EvarValue
      /** Live Chat Counter */ e7?: EvarValue
      /** Phone Number Press Counter */ e8?: EvarValue
      /** Video Start Counter */ e9?: EvarValue
      /** Video End Counter */ e10?: EvarValue
      /** Generic Event Counter */ e11?: EvarValue
  }
  | Record<`${'v' | 'e'}${number}`, EvarValue>

export type GenericEventName = `${| 'GenericEvent'
  | 'RemoteCommand'
  | 'AppleWatch'
  | 'UnhandledError'}-${string}`
export const trackNavigation = (
  screen: keyof ScreenList,
  params?: ScreenList[keyof ScreenList],
): void => {
  if (!featureFlagEnabled('mga.analytics')) return
  const previousRouteName = navigationRef?.getCurrentRoute()?.name

  const urlEquivalent = cleanRouteParams(screen, params as EncodableFormData)
  const payload = {
    ...globalEvars(),
    ...vehicleEvars(),
    ...watchEvars(),
    v1: screen,
    v7: urlEquivalent,
    v8: screen,
    v9: urlEquivalent,
    v11: previousRouteName,
    e1: 1,
  } as Evars

  MobileCore.trackState(screen, filterFalsy(payload) as Record<string, string>)
}
export const trackDeepLink = (url: string): void => {
  if (!featureFlagEnabled('mga.analytics')) return
  const payload = {
    ...globalEvars(),
    ...vehicleEvars(),
    ...watchEvars(),
    v10: url,
  } as Evars

  MobileCore.trackAction(
    'DeepLink',
    filterFalsy(payload) as Record<string, string>,
  )
}
export type TrackRemoteServiceCommandProps = {
  commandName: string
  type: 'start' | 'finish'
  success?: boolean
  errorCode?: string
  time?: number
}
export const trackRemoteServiceCommand = (
  command: TrackRemoteServiceCommandProps,
): void => {
  if (!featureFlagEnabled('mga.analytics')) return
  const action: GenericEventName = `RemoteCommand-${command.type}-${command.commandName
    }-${command?.errorCode || 'success'}`

  trackGenericEvent(action)
}

export const trackGenericEvent = (
  eventName: GenericEventName,
  metadata?: string | number,
): void => {
  if (!featureFlagEnabled('mga.analytics')) return
  const payload = {
    ...globalEvars(),
    ...routeEvars(),
    ...vehicleEvars(),
    ...watchEvars(),
    e11: 1,
    v159: eventName,
    v160: metadata,
  } as Evars

  if (eventName)
    MobileCore.trackAction(
      eventName,
      filterFalsy(payload) as Record<string, string>,
    )
}
export const globalEvars = (): Evars => {
  const state = store.getState()
  const preferences = state.preferences
  const demoMode = state.demo
  const session = state.session
  const dimensions = Dimensions.get('screen')

  return {
    v3: getCurrentEnvironmentConfig()?.marketId?.toString() || '',
    v6: Platform.OS,
    v13: getDeviceId(), // replacing get device name which was useless for analytics and potentially included PII
    v14: `${dimensions.width}x${dimensions.height}`,
    v15: preferences?.language,
    v17: session?.account?.zipCode || '',
    v20: preferences?.aepEcid || '',
    v26: preferences?.aepEcid || '',
    v61: 'Mobile',
    // v151: `${revisionJson.version}-${revisionJson.ref}`,
    v158: demoMode,
  }
}
export const vehicleEvars = (): Evars => {
  const vehicle: ClientSessionVehicle | null = getCurrentVehicle()
  if (vehicle) {
    return {
      v19: vehicle?.preferredDealer?.dealerCode || '',
      v28: vehicle?.modelName || '',
      v29: vehicle?.modelYear || '',
      //  v30: vehicle?.//  v30	Trim (v30)
      v31: vehicle?.modelCode || '',
      v32: `${vehicle?.modelName || ''} ${vehicle.modelCode || ''}`,
      // v95: null, // v95	Recall Status (v95)-- look at state for this
      // v102: vehicle?.oemCustId, // v102	Subaru OEM CustID (v102)
      // v102 Removed 2024/06/14 pending PII discussion
      v150: getVehicleGeneration(vehicle),
      // v151: `${revisionJson.version}-${revisionJson.ref}`,
      v152: vehicle?.subscriptionFeatures
        ?.filter(
          item => item == 'SAFETY' || item == 'SECURITY' || item == 'CONCIERGE',
        )
        ?.join(','),
    }
  }
  return {}
}

export const cleanRouteParams = (
  routeName: keyof ScreenList,
  routeParams: EncodableFormData | undefined,
): string => {
  return !routeParams
    ? routeName
    : `${routeName}?${encodeFormData(routeParams)}`
}
export const routeEvars = (): Evars => {
  if (!navigationRef.isReady()) {
    return {}
  }
  const routes = navigationRef?.getState()?.routes || []
  const currentRoute = routes.length > 0 ? routes[routes.length - 1] : null
  const currentRouteName: string = currentRoute?.name || ''
  const previousRoute = routes.length > 1 ? routes[routes.length - 2] : null
  const previousRouteName: string = previousRoute?.name || ''

  const urlEquivalent = cleanRouteParams(
    currentRouteName as keyof ScreenList,
    currentRoute?.params as EncodableFormData,
  )

  return {
    v1: currentRouteName,
    v7: urlEquivalent,
    v8: currentRouteName,
    v9: urlEquivalent,
    v11: previousRouteName,
  }
}

export const watchEvars = (): Evars => {
  if (Platform.OS == 'android') {
    // Return early if not an iOS device
    return {}
  }

  const state = store.getState()
  const preferences = state.preferences
  const watchPreferences = preferences?.watch
  let watchInfo: WatchInfo | null = null
  let watchStatus: AppleWatchSyncStatus = AppleWatchSyncStatus.NoWatch

  if (watchPreferences && watchPreferences.length) {
    try {
      watchInfo = JSON.parse(watchPreferences) as WatchInfo
    } catch (e) {
      console.error('watchEvars::: Unable to parse `watchInfo` for tracking.')
    }
  }
  // TODO:MN:20240827 Investigate .md format enforcement.
  // TODO:MN:20240821 maybe list reason eventually - phone too old, etc.
  if (watchInfo) {
    if (watchInfo.isWatchAppInstalled) {
      // Watch and phone are paired and Subaru Watch app is installed
      watchStatus = AppleWatchSyncStatus.WatchAppInstalled
    } else if (watchInfo.isPaired) {
      // Watch and phone are paired but Subaru Watch app is not installed
      watchStatus = AppleWatchSyncStatus.WatchAppNotInstalled
    }
  }

  return {
    v40: watchStatus,
  }
}

function useTracking(): UseTrackingType {
  const analyticsContext = useContext(MgaAnalyticsContext)
  const hookEvars = () => {
    const vars: Evars = {
      ...globalEvars(),
      ...vehicleEvars(),
      ...routeEvars(),
      ...watchEvars(),
      v24: analyticsContext?.name || analyticsContext?.id || '',
      v25: analyticsContext?.id || '',

      /* 
      TODO:AG:20240606 E3 really should mean start 
        - Future enhancement 
        - Need to stop incrementing after first engagement in context
        use analyticsContext callback to update / stop count 
      */
      //  e3: analyticsContext?.id ? 1 : '', // if there is an analytics context, this interaction should bump e3 count, otherwise omit
    }
    return vars
  }

  const trackButton = (props: TrackButtonProps): void => {
    if (!featureFlagEnabled('mga.analytics')) return
    const eventVars: Evars = {
      v21: props.trackingId, // v21	Link CTA (v21)
      v22: typeof props.title == 'string' ? props.title : 'ReactElement', // v22	Link Anchor Text (v22)
      // v23: // v23	Destination URL (v23) can't really get this from callback
    }

    MobileCore.trackAction(
      props.trackingId,
      filterFalsy({
        ...hookEvars(),
        ...eventVars,
        ...(props?.trackingVars || {}),
      }) as Record<string, string>,
    )
  }

  const trackImpression = (props: TrackButtonProps): void => {
    if (!featureFlagEnabled('mga.analytics')) return
    const payload = filterFalsy({
      ...hookEvars(),
      ...(props?.trackingVars || { e2: 1 }),
    }) as Record<string, string>
    MobileCore.trackAction(props.trackingId, payload)
  }

  return { trackButton, trackImpression }
}

// Console.error is untyped
// eslint-disable-next-line
export const trackError: (
  trackingId: string,
) => (message?: any, ...optionalParams: any[]) => void = trackingId => {
  // Console.error is untyped
  // eslint-disable-next-line
  const inner = (message?: any, ...optionalParams: any[]) => {
    const action: GenericEventName = `UnhandledError-${trackingId}`
    const messageString = (() => {
      const typeOfMessage = typeof message
      switch (typeOfMessage) {
        // Non-object primitives
        case 'bigint':
        case 'boolean':
        case 'number':
        case 'string':
        case 'undefined':
          // eslint-disable-next-line
          return `${message}`
        case 'object': {
          // JS Error objects or other objects with a proper .toString implementation
          const messageToString = (message as object).toString()
          if (messageToString != '[Object object]') return messageToString
          // General objects (often raised by custom or native code)
          return JSON.stringify(message)
        }
        default:
          return `messageType: ${typeOfMessage}`
      }
    })()
    const metadata = `${messageString}-${JSON.stringify(optionalParams)}`
    trackGenericEvent(action, metadata)
    console.error(message, ...optionalParams)
  }
  return inner
}

export default useTracking
