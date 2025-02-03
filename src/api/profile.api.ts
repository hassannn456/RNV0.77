import {
  ChangePasswordRequest,
  ClientSessionVehicle,
  NormalResult,
  TelematicsCustomerPreference,
  UpdateAccountRequest,
} from '../../@types';
import {
  MSAEndpointBuilder,
  MSAMutationDefinition,
  MSAQueryDefinition,
  baseApi,
} from '../api';
import {SessionData} from '../features/auth/sessionSlice';

export type LanguagePreferences = {
  inVehicleLanguage: string;
  preferences: TelematicsCustomerPreference[];
};
export type LanguagePreferencesForm = {communicationLanguage: string};

/**
 * Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/ProfileController.java
 *
 * TODO:UA:20240122: Move remaining profile endpoints here
 **/
export const profileEndpoints: (builder: MSAEndpointBuilder) => {
  updateAccount: MSAMutationDefinition<
    UpdateAccountRequest,
    NormalResult<SessionData>
  >;
  updatePassword: MSAMutationDefinition<
    ChangePasswordRequest,
    NormalResult<null>
  >;
  setRemoteServicePin: MSAMutationDefinition<
    {remoteServicePin: string},
    NormalResult<ClientSessionVehicle>
  >;
  /** https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/ProfileController.java#L800 */
  textOptOut: MSAMutationDefinition<undefined, NormalResult<null>>;
  /** https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/ProfileController.java#L829 */
  getLanguagePreferences: MSAQueryDefinition<
    undefined,
    NormalResult<LanguagePreferences>
  >;
  /** https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/ProfileController.java#L857 */
  updateLanguagePreferences: MSAMutationDefinition<
    LanguagePreferencesForm,
    NormalResult<null>
  >;
} = builder => ({
  updateAccount: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: 'profile/updateAccount.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session'],
    },
  }),
  updatePassword: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: '/profile/changePassword.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
      suppressConnectionNotice: true,
    },
  }),
  setRemoteServicePin: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: 'profile/remoteServices/setPin.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session'],
    },
  }),
  textOptOut: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: 'profile/textOptOut.json',
      method: 'GET',
    }),
    extraOptions: {
      requires: ['session'],
    },
  }),
  getLanguagePreferences: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'profile/languagePreferences.json',
      method: 'GET',
    }),
    extraOptions: {
      requires: ['session'],
    },
    forceRefetch: () => true,
  }),
  updateLanguagePreferences: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: 'profile/languagePreferences.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session'],
    },
  }),
});

export const profileApi = baseApi.injectEndpoints({
  endpoints: profileEndpoints,
});

export const {
  useUpdatePasswordMutation,
  useTextOptOutMutation,
  useGetLanguagePreferencesQuery,
  useUpdateLanguagePreferencesMutation,
} = profileApi;
