import {
  getGenericPassword,
  resetGenericPassword,
  setGenericPassword,
} from 'react-native-keychain'
import { createListenerMiddleware } from '@reduxjs/toolkit'
import { Keychain } from './keychain.slice'
import { store } from '../../store'
import { trackError, trackGenericEvent } from '../../components/useTracking'
/** Partial tree of RootState because importing RootState is a circular ref */
interface KeychainState {
  keychain: Keychain | null
}

const keychainOnLoad = 'keychain/load'

const loadKeychain = async () => {
  const credentials = await getGenericPassword()
  if (credentials) {
    const keychain = JSON.parse(credentials.password) as Keychain
    store.dispatch({ type: keychainOnLoad, payload: keychain })
  } else {
    // Try to read from legacy keychain
    // NOTE: PIN data is stored under 'biometrics', but is unsafe to use in MGA because of how encryptPIN and Cordova's device.uuid work.
    const legacyUsernameEntry = await getGenericPassword({
      service: 'mySubaru',
      account: 'username',
    })
    const legacyPasswordTokenEntry = await getGenericPassword({
      service: 'mySubaru',
      account: 'passwordToken',
    })
    if (legacyUsernameEntry && legacyPasswordTokenEntry) {
      const legacyKeychain: Keychain = {
        login: {
          loginUsername: legacyUsernameEntry.password,
          passwordToken: legacyPasswordTokenEntry.password,
          rememberUserCheck: 'on',
        },
      }
      store.dispatch({ type: keychainOnLoad, payload: legacyKeychain })

      trackGenericEvent('GenericEvent-KeychainMigrated')
    } else {
      // No saved keychain. Dispatch empty payload so app knows loading is complete.
      store.dispatch({ type: keychainOnLoad, payload: {} })
    }
  }
}
loadKeychain()
  .then()
  .catch(error => {
    trackError('keychain.write.ts')(error)
    // No saved keychain. Dispatch empty payload so app knows loading is complete.
    store.dispatch({ type: keychainOnLoad, payload: {} })
  })

/** Listen for keychain change in redux and update secure storage */
const keychainMiddleware = createListenerMiddleware<KeychainState>()

keychainMiddleware.startListening({
  predicate: (action, currentState, previousState) => {
    return (
      action.type != keychainOnLoad &&
      currentState.keychain != previousState.keychain
    )
  },
  effect: async (action, store) => {
    try {
      const keychain = store.getState().keychain
      if (keychain?.login?.loginUsername) {
        const payload = JSON.stringify(keychain)
        await setGenericPassword(keychain.login.loginUsername, payload)
      } else {
        await resetGenericPassword()
      }
    } catch (error) {
      trackError('keychain.write.ts')(error)
    }
  },
})

export { keychainMiddleware }
