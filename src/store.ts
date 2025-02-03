/* eslint-disable eqeqeq */
import {configureStore, createSelector} from '@reduxjs/toolkit';
import {TypedUseSelectorHook, useDispatch, useSelector} from 'react-redux';
import biometricsReducer from '../src/features/biometrics/biometrics.slice';
import demoReducer from '../src/features/demo/demo.slice';
import mobileMessageReducer, {
  MobileMessageState,
} from '../src/features/admin/admin.slice';
import localizationReducer, {
  LocalizationDownloadState,
} from '../src/features/localization/localization.slice';
import geolocationReducer from '../src/features/geolocation/geolocation.slice';
import keychainReducer from '../src/features/keychain/keychain.slice';
import remoteStatusReducer from '../src/features/remoteService/remoteStatus.slice';
import preferencesReducer from '../src/features/preferences/preferences.slice';
import sessionReducer from '../src/features/auth/sessionSlice';
import noticesReducer from '../src/features/notices/notices.slice';
import jwtReducer from '../src/features/jwt/jwtSlice';
import {baseApi} from './api';
import {languageMiddleware} from '../src/features/preferences/language';
import {keychainMiddleware} from '../src/features/keychain/keychain.write';
import {
  appReviewMiddleware,
  preferencesMiddleware,
} from '../src/features/preferences/preferences.write';
import {remoteStatusMiddleware} from '../src/features/remoteService/remoteStatus.write';

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    biometrics: biometricsReducer,
    demo: demoReducer,
    localization: localizationReducer,
    mobileMessage: mobileMessageReducer,
    geolocation: geolocationReducer,
    keychain: keychainReducer,
    remoteStatus: remoteStatusReducer,
    preferences: preferencesReducer,
    session: sessionReducer,
    jwt: jwtReducer,
    notices: noticesReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .concat(keychainMiddleware.middleware)
      .concat(languageMiddleware.middleware)
      .concat(preferencesMiddleware.middleware)
      .concat(remoteStatusMiddleware.middleware)
      .concat(appReviewMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export type AppLoadingState =
  | [false, 'complete', null]
  | [true, 'biometrics' | 'preferences' | 'keychain', null]
  | [true, 'localization', LocalizationDownloadState]
  | [true, 'mobileMessage', MobileMessageState];
const selectAppLoading = createSelector(
  [
    (state: RootState) => state.biometrics,
    (state: RootState) => state.preferences,
    (state: RootState) => state.keychain,
    (state: RootState) => state.localization,
    (state: RootState) => state.mobileMessage,
  ],
  (
    biometrics,
    preferences,
    keychain,
    localization,
    mobileMessage,
  ): AppLoadingState => {
    if (biometrics == null) {return [true, 'biometrics', biometrics];}
    if (preferences == null) {return [true, 'preferences', preferences];}
    if (keychain == null) {return [true, 'keychain', keychain];}
    if (localization == null || localization.state != 'complete')
      {return [true, 'localization', localization];}
    if (mobileMessage == null || mobileMessage.state != 'complete')
      {return [true, 'mobileMessage', mobileMessage];}
    return [false, 'complete', null];
  },
);
export const useAppLoading: () => AppLoadingState = () => {
  return useAppSelector(selectAppLoading);
};
