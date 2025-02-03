import AsyncStorage from '@react-native-async-storage/async-storage'
import { createListenerMiddleware } from '@reduxjs/toolkit'
import { store } from '../../store'
import {
  Preferences,
  PreferencesState,
  SetPreferencesAction,
} from './preferences.slice'
import { setInteractionTrigger } from '../appReview/appRateUsPrompt'
import { trackError } from '../../components/useTracking'

const keys: (keyof Preferences)[] = [
  'environment',
  'language',
  'selectedVin',
  'inAppReview',
  'watch',
  'mgaVersion',
  'biometricsLoginStatus',
  'biometricsPromptCount',
]
export const mgaDefaultPreferences: Preferences = {
  language: 'en',
}
// mga-allow-then-catch - adapter for redux
AsyncStorage.multiGet(keys)
  .then(pairs => {
    pairs.forEach(pair => {
      const key = pair[0] as keyof Preferences
      const value = pair[1]
      if (value) {
        mgaDefaultPreferences[key] = value
      }
    })
    store.dispatch({
      type: 'preferences/setAll',
      payload: mgaDefaultPreferences,
    })
  })
  .catch(error => {
    trackError('preferences.write.ts::AsyncStorage/multiGet')(error)
    store.dispatch({
      type: 'preferences/setAll',
      payload: mgaDefaultPreferences,
    })
  })

/** Listen for preferences change in redux and update local storage */
const preferencesMiddleware = createListenerMiddleware<PreferencesState>()

preferencesMiddleware.startListening({
  predicate: (action, _current, _previous) => {
    return action.type == 'preferences/set'
  },
  effect: async (action, _store) => {
    try {
      const a = action as SetPreferencesAction
      await AsyncStorage.setItem(a.payload.key, a.payload.value)
    } catch (error) {
      trackError('preferences.write.ts::preferencesMiddleware/startListening')(
        error,
      )
    }
  },
})

/** Listen for preferences change in redux and update local storage */
const appReviewMiddleware = createListenerMiddleware()

appReviewMiddleware.startListening({
  predicate: (action, _current, _previous) => {
    return action.type == 'preferences/triggerAppReview'
  },
  effect: async (action, _store) => {
    try {
      const a = action as SetPreferencesAction

      const inAppReviewData = await setInteractionTrigger(
        store.getState().preferences?.inAppReview,
        a.payload.value,
      )
      store.dispatch({
        type: 'preferences/set',
        payload: {
          key: 'inAppReview',
          value: inAppReviewData,
        },
      })
    } catch (error) {
      trackError('preferences.write.ts::appReviewMiddleware/startListening')(
        error,
      )
    }
  },
})

export { preferencesMiddleware, appReviewMiddleware }
