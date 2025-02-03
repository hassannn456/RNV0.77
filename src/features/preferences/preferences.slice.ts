import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {store} from '../../store';

export enum BiometricsLoginStatus {
  BioOptedIn = 'bioOptedIn',
  BioOptedOut = 'bioOptedOut',
  None = '',
}
/** List of user-selected values. */
export interface Preferences {
  /**
   * To ensure proper default behavior,
   * use getEnvironmentConfig or getCurrentEnvironmentConfig to read this value.
   **/
  environment?: string;
  language?: string;
  selectedVin?: string;
  aepEcid?: string;
  inAppReview?: string;
  appRating?: string;
  watch?: string;
  mgaVersion?: string;
  biometricsLoginStatus?: string;
  biometricsPromptCount?: string;
  biometricsPromptDate?: BiometricsLoginStatus;
}

/** Partial tree of RootState because importing RootState is a circular ref */
export interface PreferencesState {
  preferences: Preferences | null;
}

export interface SettingPair {
  key: keyof Preferences;
  value: string;
}
export type SetPreferencesAction = PayloadAction<SettingPair>;
const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: (): Preferences | null => {
    return null;
  },
  reducers: {
    set: (state, action: SetPreferencesAction) => {
      return {...state, [action.payload.key]: action.payload.value};
    },
    setAll: (_state, action: PayloadAction<Preferences>) => action.payload,
    triggerAppReview: (state, action: SetPreferencesAction) => {
      return {...state, [action.payload.key]: action.payload.value};
    },
  },
});

export const setPreference = (key: keyof Preferences, value: string): void => {
  store.dispatch({
    type: 'preferences/set',
    payload: {key, value},
  });
};

export const getPreference = (key: keyof Preferences): string | undefined =>
  store.getState().preferences?.[key];

export const {set} = preferencesSlice.actions;
export default preferencesSlice.reducer;
