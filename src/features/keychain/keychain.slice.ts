import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState, store, useAppSelector } from '../../store'
import { currentVehicleReducer } from '../auth/sessionSlice'

export type rememberUserType = 'off' | 'on'

export interface KeychainLogin {
  loginUsername: string
  password?: string
  passwordToken?: string
  rememberUserCheck: rememberUserType
  isSecuredDevice: boolean
}
export type KeychainPIN = { [oemCustId: string]: string }

export interface Keychain {
  login?: KeychainLogin
  pin?: KeychainPIN
  sessionId?: string
}

const keychainSlice = createSlice({
  name: 'keychain',
  initialState: (): Keychain | null => {
    return null
  },
  reducers: {
    load: (_, action: PayloadAction<Keychain>) => {
      return action.payload
    },
    clearLogin: state => {
      return { ...state, login: undefined }
    },
    rememberMe: (state, action: PayloadAction<rememberUserType>) => {
      return {
        ...state,
        login: {
          ...(state?.login as KeychainLogin),
          rememberUserCheck: action.payload,
        },
      }
    },
    storeLogin: (state, action: PayloadAction<KeychainLogin>) => {
      const { payload } = action
      const { isSecuredDevice } = payload
      return {
        ...state,
        login: {
          ...payload,
          password: isSecuredDevice ? payload.password : undefined,
          passwordToken: isSecuredDevice ? payload.passwordToken : undefined,
        },
      }
    },
    clearPin: (state, action: PayloadAction<string>) => {
      const savedPins = { ...state?.pin }
      delete savedPins[action.payload]
      return { ...state, pin: savedPins }
    },
    storePin: (
      state,
      action: PayloadAction<{ oemCustId: string; pin: string }>,
    ) => {
      const p = action.payload
      return {
        ...state,
        pin: { ...state?.pin, [p.oemCustId]: p.pin },
      }
    },
    clearSessionId: state => {
      return { ...state, sessionId: undefined }
    },
    storeSessionId: (state, action: PayloadAction<string>) => {
      return {
        ...state,
        sessionId: action.payload,
      }
    },
  },
})

export const storedPinReducer: (
  state: RootState,
) => string | undefined = state => {
  if (state.demo) {
    return undefined
  }
  const oemCustId = currentVehicleReducer(state)?.userOemCustId
  if (oemCustId && state.keychain?.pin) {
    return state.keychain.pin[oemCustId]
  } else {
    return undefined
  }
}

export const allStoredPinsReducer: (
  state: RootState,
) => Pick<Keychain, 'pin'> | undefined = state => {
  if (state.demo) {
    return undefined
  }
  if (state.keychain?.pin) {
    return state.keychain.pin
  } else {
    return undefined
  }
}

export const getStoredPin: () => string | undefined = () => {
  return storedPinReducer(store.getState())
}

export const useStoredPin: () => string | undefined = () => {
  return useAppSelector(storedPinReducer)
}

export const getAllStoredPins: () => Pick<Keychain, 'pin'> | undefined = () => {
  return allStoredPinsReducer(store.getState())
}

export const useAllStoredPins: () => string | undefined = () => {
  return useAppSelector(storedPinReducer)
}

export const {
  storeLogin,
  storePin,
  clearPin,
  rememberMe,
  clearSessionId,
  storeSessionId,
} = keychainSlice.actions
export default keychainSlice.reducer
