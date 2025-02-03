import Geolocation, {
  GeolocationResponse,
  GeolocationError,
} from '@react-native-community/geolocation';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { store } from '../../store';

interface GeolocationState {
  position?: GeolocationResponse
  error?: GeolocationError
}
/** Returns sensor availability or null if hardware capabilities are loading */
export type MaybeGeolocationState = GeolocationState | null

export const pingCurrentLocation = (): Promise<MaybeGeolocationState> => {
  return new Promise<MaybeGeolocationState>((resolve, _reject) => {
    const onError = (error: GeolocationError) => {
      const payload = { error: error };
      store.dispatch({ type: 'geolocation/update', payload: payload });
      resolve(payload);
    };
    const onPosition = (position: GeolocationResponse) => {
      const payload = { position: position };
      store.dispatch({ type: 'geolocation/update', payload: payload });
      resolve(payload);
    };
    Geolocation.getCurrentPosition(onPosition, onError);
  });
};

const geolocationSlice = createSlice({
  name: 'geolocation',
  initialState: (): MaybeGeolocationState => {
    return null;
  },
  reducers: {
    update: (_, action: PayloadAction<MaybeGeolocationState>) => action.payload,
  },
});

export const { update } = geolocationSlice.actions;
export default geolocationSlice.reducer;
