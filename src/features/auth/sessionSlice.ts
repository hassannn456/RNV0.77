// cSpell:ignore xtime
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState, store, useAppSelector } from '../../store'
import { setGetCountryCode } from '../../utils/regions'
import { ClientSessionVehicle } from '../../../@types'

/** User account info */
export interface Account {
  createdDate: number
  marketId: number
  firstName: string
  lastName: string
  zipCode: string
  accountKey: number
  lastLoginDate: number
  zipCode5: string
}

/** Session data */
export interface SessionData {
  sessionChanged: boolean
  vehicleInactivated: boolean
  account: Account
  resetPassword: boolean
  deviceId: string
  /** Stateful session ID. Sent by server as a cookie or at login. Sent by clients as ;JSESSIONID=. */
  sessionId: string
  /** Load balancer routing ID. Sent by server as a cookie. Sent by clients as a header. */
  routeId: string
  deviceRegistered: boolean
  passwordToken: string
  vehicles: ClientSessionVehicle[]
  rightToRepairEnabled: boolean
  rightToRepairStartYear: number
  rightToRepairStates: string
  termsAndConditionsAccepted: boolean
  enableXtime: boolean
  digitalGlobeConnectId: string
  digitalGlobeImageTileService: string
  digitalGlobeTransparentTileService: string
  tomtomKey: string
  currentVehicleIndex: number
  handoffToken: string
  satelliteViewEnabled: boolean
  registeredDevicePermanent: boolean
  /** State tracking value not sent by server. */
  loggedIn?: boolean
}

const sessionSlice = createSlice({
  name: 'session',
  initialState: null as SessionData | null,
  reducers: {
    changeVehicle: (state, action: PayloadAction<ClientSessionVehicle>) => {
      if (!state) {
        return null
      }
      const newIndex = state.vehicles.findIndex(
        v => v.vin == action.payload.vin,
      )
      if (newIndex >= 0) {
        return {
          ...state,
          currentVehicleIndex: newIndex,
        }
      } else {
        return state
      }
    },
    replace: (state, action: PayloadAction<SessionData>) => {
      return { ...state, ...action.payload }
    },
    setLogin: (state, action: PayloadAction<boolean>) => {
      if (!state) {
        return null
      }
      return { ...state, loggedIn: action.payload }
    },
    updateVehicle: (state, action: PayloadAction<ClientSessionVehicle>) => {
      if (!state) {
        return null
      }
      return {
        ...state,
        vehicles: state?.vehicles.map(v => {
          return v.vin != action.payload.vin ? v : { ...v, ...action.payload }
        }),
      }
    },
  },
})

export const loginStatusReducer: (state: RootState) => boolean = state => {
  return state.session?.loggedIn == true
}

export const getLoginStatus: () => boolean = () => {
  return loginStatusReducer(store.getState())
}

export const registeredDeviceReducer: (state: RootState) => boolean = state => {
  return state.session?.registeredDevicePermanent || false
}

export const getRegisteredDeviceStatus: () => boolean = () => {
  return registeredDeviceReducer(store.getState())
}

export const useLoginStatus: () => boolean = () => {
  return useAppSelector(loginStatusReducer)
}

export const currentVehicleReducer: (
  state: RootState,
) => ClientSessionVehicle | null = state => {
  if (!state?.session?.vehicles) {
    return null
  }

  return state.session?.vehicles[state.session.currentVehicleIndex]
}

export const allVehiclesReducer: (
  state: RootState,
) => ClientSessionVehicle[] | null = state => {
  if (!state?.session?.vehicles) {
    return null
  }

  return state.session?.vehicles
}

export const getAllVehicles: () => ClientSessionVehicle[] | null = () => {
  return allVehiclesReducer(store.getState())
}

export const getCurrentVehicle: () => ClientSessionVehicle | null = () => {
  return currentVehicleReducer(store.getState())
}

export const useCurrentVehicle: () => ClientSessionVehicle | null = () => {
  return useAppSelector(currentVehicleReducer)
}

setGetCountryCode(() => {
  return currentVehicleReducer(store.getState())?.customer?.sessionCustomer
    ?.countryCode
})

export const { replace, changeVehicle, updateVehicle } = sessionSlice.actions
export default sessionSlice.reducer
