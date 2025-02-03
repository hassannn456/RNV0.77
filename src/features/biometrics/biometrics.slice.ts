import ReactNativeBiometrics, { BiometryType } from 'react-native-biometrics'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { store } from '../../store'
import { inferBiometryTypeByDeviceID } from './biometrics'
import { trackError } from '../../components/useTracking'
interface IsSensorAvailableResult {
  available: boolean
  biometryType?: BiometryType
  error?: string
}
/** Returns sensor availability or null if hardware capabilities are loading */
export type MaybeSensor = IsSensorAvailableResult | null

export const biometricsState = (): MaybeSensor => {
  // mga-allow-then-catch - adapter for redux
  const rnBiometrics = new ReactNativeBiometrics()
  rnBiometrics
    .isSensorAvailable()
    .then(result => {
      if (result.available) {
        store.dispatch({ type: 'biometrics/update', payload: result })
      } else {
        // Mutating object with device ID based fallback
        result.biometryType = inferBiometryTypeByDeviceID()
        store.dispatch({ type: 'biometrics/update', payload: result })
      }
    })
    .catch(error => {
      trackError('biometrics.slice.ts')(error)
      store.dispatch({
        type: 'biometrics/update',
        payload: { available: false },
      })
    })
  return null
}

const biometricsSlice = createSlice({
  name: 'biometrics',
  initialState: biometricsState(),
  reducers: {
    update: (_, action: PayloadAction<MaybeSensor>) => action.payload,
  },
})

export const isBiometricsSetupOnDevice = (): boolean => {
  return store.getState().biometrics?.available ?? false
}

export const { update } = biometricsSlice.actions
export default biometricsSlice.reducer
