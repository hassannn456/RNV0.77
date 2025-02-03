import { NativeModules } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { getTokenFromStateOrService } from '../jwt/jwtSlice'
import { navigate, ScreenList } from '../../Controller'
import { store } from '../../store'
import { loginStatusReducer } from '../auth/sessionSlice'
import {
  trackGenericEvent,
  GenericEventName,
  trackError,
} from '../../components/useTracking'
import { CommunicatorType, WatchInfo } from '../../../@types/Communicator'
import { NormalResult } from '../../../@types'
import { getCurrentEnvironmentConfig } from '../localization/environment'

const { Communicator } = NativeModules
const Comm = Communicator as CommunicatorType

export enum AppleWatchSyncStatus {
  NoWatch = 'NoWatch',
  WatchAppInstalled = 'WatchAppInstalled',
  WatchAppNotInstalled = 'WatchAppNotInstalled',
}

/** Helper function for failed pairing attempts */
const errorWithCode = (errorCode: string): NormalResult<WatchInfo> => {
  return {
    success: false,
    errorCode: errorCode,
    dataName: null,
    data: null,
  }
}

/**
 * Send data to watch if a watch is attached.
 *
 * Function made private to keep contract consistent from phone -> watch.
 * Call `pairWithWatch` instead.
 **/
const sendDataToWatchIfNeeded = (
  data: string,
): Promise<NormalResult<WatchInfo>> => {
  return new Promise<NormalResult<WatchInfo>>((resolve, _) => {
    if (!Comm) {
      resolve(errorWithCode('NoCommNativeModules'))
      return
    }
    Comm.sendDataToWatch(data, response => {
      if (response.success && response.data) {
        saveWatchInfo(response.data)
        const action: GenericEventName = 'AppleWatch-Sync'
        const watchInfo: WatchInfo = response.data
        let metadata = ''
        try {
          metadata = JSON.stringify(watchInfo)
        } catch (e) {
          console.error('Unable to serialize `watchInfo` for tracking.')
        }
        trackGenericEvent(action, metadata)
      }
      resolve(response)
    })
  })
}

/**
 * Call native swift to report watch availability
 **/
export const fetchWatchSupportFromNative = async (): Promise<
  NormalResult<WatchInfo>
> => {
  return new Promise<NormalResult<WatchInfo>>((resolve, _) => {
    Comm.fetchWatchSupportWithCallback(response => {
      resolve(response)
    })
  })
}

/**
 * Get info about paired watch either from local storage or by pinging hardware.
 *
 * In theory, this should be a hook around preferences,
 * but since someone decided to cram an object into a string store,
 * we're paying the de-serialization cost here.
 **/
export const fetchWatchInfo = async (): Promise<NormalResult<WatchInfo>> => {
  try {
    const text = await AsyncStorage.getItem('watch')
    if (text) {
      try {
        const info = JSON.parse(text) as WatchInfo
        if (info.watchName) {
          return {
            success: true,
            errorCode: null,
            dataName: 'watch',
            data: info,
          }
        }
      } catch (error) {
        trackError('fetchWatchInfo::JSON.parse')(error)
      }
    }
  } catch (error) {
    trackError('fetchWatchInfo::AsyncStorage.getItem/watch')(error)
  }
  return await fetchWatchSupportFromNative()
}

export const saveWatchInfo = (value: WatchInfo): void => {
  store.dispatch({
    type: 'preferences/set',
    payload: {
      key: 'watch',
      value: JSON.stringify(value),
    },
  })
}

export const forgetWatchInfo = async (): Promise<void> => {
  await AsyncStorage.removeItem('watch')
}

/**
 * Entry point for communicating initial tokens to get watch up an running.
 **/
export const pairWithWatch = async (): Promise<NormalResult<WatchInfo>> => {
  const state = store.getState()
  const environment = getCurrentEnvironmentConfig()?.id
  if (!environment) return errorWithCode('EWC_NoEnvironment')
  const account = state.session?.account
  if (!account) return errorWithCode('EWC_NoCommNativeModules')
  const sessionId = state.session?.sessionId
  if (!sessionId) return errorWithCode('EWC_NoSessionId')
  const token = await getTokenFromStateOrService(state)
  if (!token) return errorWithCode('EWC_TokenGenerationFailed')
  const session = {
    sessionId,
    environment,
    ...token,
  }
  const payload = JSON.stringify({
    account,
    session,
  })
  const watchResponse = await sendDataToWatchIfNeeded(payload)
  if (watchResponse.errorCode == 'EWC_NotReady' && watchResponse.data) {
    if (!watchResponse.data.isPaired) {
      return errorWithCode('EWC_NotPaired')
    }
    if (!watchResponse.data.isReachable) {
      return errorWithCode('EWC_NotReachable')
    }
    if (!watchResponse.data.isWatchAppInstalled) {
      return errorWithCode('EWC_WatchAppNotInstalled')
    }
  }
  return watchResponse
}

/**
 * Jump to a screen on the phone for the watch.
 *
 * These should succeed if the user is logged in.
 * A return message is sent to the watch otherwise.
 **/
export const navigateForWatch = (screen: keyof ScreenList): void => {
  const state = store.getState()
  const isLoggedIn = loginStatusReducer(state)
  if (isLoggedIn) {
    navigate(screen)
  } else {
    const data = {
      phoneLoggedIn: false,
    }
    void sendDataToWatchIfNeeded(JSON.stringify(data))
  }
}
