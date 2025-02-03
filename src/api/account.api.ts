// cSpell:ignore VEHICLESETUPERROR
// Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/AccountController.java
import {Platform} from 'react-native';
import {
  AccountForm,
  ClientSessionVehicle,
  DealerDetails,
  DealerInfo,
  NormalResult,
  RefreshVehicleOptions,
  VehicleInfoRequest,
} from '../../@types';
import {
  baseApi,
  MSAContentTypeForm,
  MSAEndpointBuilder,
  MSAMutationDefinition,
  MSAQueryDefinition,
} from '../api';
import i18n from '../i18n';
import {store} from '../store';
import {mgaLoadShortcuts} from '../components/utils/shortcuts';
import {executeConditionalPromptChain} from '../utils/controlFlow';
import {isFourDigitNumericPIN, isDeprecatedPIN} from '../utils/PIN';
import {loadVehicleAccountAttributes} from './userAttributes.api';
import {SessionData, getCurrentVehicle} from '../features/auth/sessionSlice';
import {showUpdateAccount} from '../screens/MgaUpdateAccount';
import {emergencyContactPrompt} from '../screens/MgaAddEmergencyContact';
import {twoStepAuthPrompt} from '../screens/MgaTwoStepAuthentication';
import {
  setPinPromptNewUser,
  setPinPromptReturningUser,
} from '../screens/MgaSetPin';
import {termsConditionsPrompt} from '../screens/MgaTermsConditions';
import {biometricsPrompt} from '../screens/MgaBiometrics';
import {pairWithWatch} from '../features/watch/watch';
import {trackGenericEvent} from '../components/useTracking';
import {getTokenFromService} from '../features/jwt/jwtSlice';
import {ConditionalPrompt} from '../utils/controlFlow';
import {has} from '../features/menu/rules';
import CsfSimpleAlert from '../components/CsfSimpleAlert';
import promptAlert from '../components/CsfAlert';
/** Response from server has empty vehicles array */
export const cNoVehicle = 'noVehicle';
export const cVehicleSetupError = 'VEHICLESETUPERROR';

export const vehicleHasValidKeychainPin = (): boolean => {
  const vehicle = getCurrentVehicle();
  const keychainPin = store.getState().keychain?.pin;
  const oemCustId = vehicle?.userOemCustId;
  return (
    !!oemCustId &&
    !!keychainPin?.[oemCustId] &&
    isFourDigitNumericPIN(keychainPin?.[oemCustId])
  );
};

export const vehicleHasDeprecatedKeychainPin = (): boolean => {
  const vehicle = getCurrentVehicle();
  const keychainPin = store.getState().keychain?.pin;
  const oemCustId = vehicle?.userOemCustId;
  return (
    !!oemCustId &&
    !!keychainPin?.[oemCustId] &&
    isDeprecatedPIN(keychainPin?.[oemCustId])
  );
};

export const vehicleHasManualPinEntry = (): boolean => {
  const vehicle = getCurrentVehicle();
  const keychainPin = store.getState().keychain?.pin;
  const oemCustId = vehicle?.userOemCustId;
  return (
    !!oemCustId && !!keychainPin?.[oemCustId] && keychainPin?.[oemCustId] == '' // pin is set to an empty string '', meaning the user chose not to save the pin value.
  );
};

export const vehicleHasNoKeychainPin = (): boolean => {
  const vehicle = getCurrentVehicle();
  const keychainPin = store.getState().keychain?.pin;
  const oemCustId = vehicle?.userOemCustId;
  return !!oemCustId && !!keychainPin && !(oemCustId in keychainPin);
};

/** A list of conditional prompts that trigger post-login  */
const conditionalPrompts: Array<ConditionalPrompt> = [
  // 2FA prompt
  twoStepAuthPrompt,
  // Biometrics Setup screen
  biometricsPrompt,
  // Terms and Conditions prompt
  termsConditionsPrompt,
  // PIN set up prompt for New Vehicle User
  setPinPromptNewUser,
  // PIN set up prompt for Returning Vehicle User
  setPinPromptReturningUser,
  // Emergency contact prompt
  emergencyContactPrompt,
];

export interface LoginParameters {
  loginUsername: string;
  password?: string;
  env: string;
  passwordToken?: string;
  selectedVin?: string;
  rememberUserCheck: 'on' | 'off';
  pushToken?: string;
  deviceId?: string;
  deviceType?: string;
}

export type DealerInfoRequest = {dealerCode: string};
export interface dealerAmenities {
  serviceAmenities: [];
}

export const accountEndpoints: (builder: MSAEndpointBuilder) => {
  /** Use login(parameters) call instead of accessing this directly. */
  login: MSAMutationDefinition<LoginParameters, NormalResult<SessionData>>;
  /** Use selectVehicle(vin) call instead of accessing this directly. */
  selectVehicle: MSAMutationDefinition<
    VehicleInfoRequest,
    NormalResult<ClientSessionVehicle>
  >;

  /** Get vehicle object with dealer populated */
  preferredDealer: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<ClientSessionVehicle>
  >;
  /** List of nearby dealers */
  nearestDealer: MSAQueryDefinition<AccountForm, NormalResult<DealerDetails[]>>;
  assignAsPreferredDealer: MSAMutationDefinition<
    DealerInfoRequest,
    NormalResult<null>
  >;
  dealerInfo: MSAQueryDefinition<DealerInfoRequest, NormalResult<DealerInfo>>;
  refreshVehicles: MSAMutationDefinition<undefined, NormalResult<SessionData>>;
  dealerAmenities: MSAQueryDefinition<
    DealerInfoRequest,
    NormalResult<dealerAmenities>
  >;
  // TODO:UA:20231227: Move /forgotPasswordContacts - line 977
  // TODO:UA:20231227: Move /forgotPasswordSendVerification - line 1027
  // TODO:UA:20231227: Move /forgotPasswordVerify - line 1046
  // TODO:UA:20231227: Move /forgotPasswordEnterNew - line 1078
  // TODO:UA:20231227: Move /forgotUsername - line 1100
  // TODO:UA:20231227: Move /twoStepAuthContacts - line 1129
  // TODO:UA:20231227: Move /twoStepAuthSendVerification - line 1155
  // TODO:UA:20231227: Move /twoStepAuthVerify - line 1192
} = builder => ({
  login: builder.mutation({
    query: parameters => ({
      body: parameters,
      url: 'login.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeForm,
      suppressConnectionNotice: true,
    },
  }),
  selectVehicle: builder.mutation({
    query: parameters => ({
      url: 'selectVehicle.json',
      method: 'GET',
      params: parameters,
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    // Grabbing response at transform step to report to redux
    // Saves selected vehicle to local storage (preferences) and session
    transformResponse: (response: NormalResult<ClientSessionVehicle>) => {
      if (response.data) {
        store.dispatch({
          type: 'preferences/set',
          payload: {
            key: 'selectedVin',
            value: response.data.vin,
          },
        });
        store.dispatch({
          type: 'session/changeVehicle',
          payload: response.data,
        });
      }
      return response;
    },
  }),
  refreshVehicles: builder.mutation({
    query: parameters => ({
      url: 'refreshVehicles.json',
      method: 'GET',
      params: parameters,
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  preferredDealer: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'preferredDealer.json',
      method: 'GET',
      params: parameters,
    }),
    transformResponse: (response: NormalResult<ClientSessionVehicle>) => {
      // MGA-1172: On complete, reload shortcuts to point at potential dealer
      mgaLoadShortcuts(response.data);
      return response;
    },
  }),
  nearestDealer: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'nearestDealer.json',
      method: 'GET',
      params: parameters,
    }),
  }),
  assignAsPreferredDealer: builder.mutation({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    query: parameters => ({
      url: 'assignAsPreferredDealer.json',
      method: 'GET',
      params: parameters,
    }),
  }),
  dealerInfo: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'dealerInfo.json',
      method: 'GET',
      params: parameters,
    }),
  }),
  dealerAmenities: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'dealerAmenities.json',
      method: 'GET',
      params: parameters,
    }),
  }),
});

export const accountApi = baseApi.injectEndpoints({
  endpoints: accountEndpoints,
});
export const {
  useRefreshVehiclesMutation,
  usePreferredDealerQuery,
  useNearestDealerQuery,
  useAssignAsPreferredDealerMutation,
  useDealerInfoQuery,
  useDealerAmenitiesQuery,
} = accountApi;

let loginActive = false;
let loginListeners: Array<(value: NormalResult<SessionData>) => void> = [];
/**
 * Login user.
 *
 * Acquires a lock to prevent multiple concurrent calls.
 * Function must attach a listener or run to end to ensure lock is released.
 **/
export const login = async (
  parameters: LoginParameters,
): Promise<NormalResult<SessionData>> => {
  if (loginActive) {
    // Add listener for response
    const future: Promise<NormalResult<SessionData>> = new Promise(
      (resolve, _) => {
        loginListeners.push(resolve);
      },
    );
    return await future;
  } else {
    // Become leader
    loginActive = true;
  }

  // Start login
  const request = accountApi.endpoints.login.initiate({
    deviceType: Platform.OS, // Normally 'ios' or 'android'
    ...parameters,
  });
  let response = await store.dispatch(request).unwrap();

  if (response.data !== null && response.data.resetPassword) {
    response = await showUpdateAccount();
  }
  // If device registered, start loading vehicle data
  if (
    response.success &&
    response.data &&
    response.data.registeredDevicePermanent
  ) {
    const vin = (response.data.vehicles ?? [])[
      response.data.currentVehicleIndex ?? 0
    ]?.vin;
    if (!vin) {
      response = {
        success: false,
        data: null,
        dataName: 'error',
        errorCode: cNoVehicle,
      };
    } else {
      const selectVehicleResponse = await selectVehicle({vin});
      // Allow vehicle setup error to login and reach dashboard
      // Otherwise fail request
      if (
        !selectVehicleResponse.success &&
        selectVehicleResponse?.errorCode != cVehicleSetupError
      ) {
        response = {
          success: false,
          errorCode: selectVehicleResponse.errorCode,
          data: null,
          dataName: null,
        };
      }
    }
  }

  // Load vehicle account attributes
  // In the future, failure may need to fail login
  if (response.success) {
    // Grab JWT from server
    // Originally only for watch, but now usable in phone
    const token = await getTokenFromService();
    if (token) {
      await loadVehicleAccountAttributes();
    }
  }

  // Send credentials to watch if one is present
  if (response.success) {
    const _ = await pairWithWatch();
  }

  if (response.success && !has('env:DemoMode')) {
    try {
      await executeConditionalPromptChain(conditionalPrompts);
      // Execute prompts succeeded.
    } catch (error: any) {
      const errorResponse = error as NormalResult<SessionData>;
      // Execute prompts threw. Override `response` with `error` so the caller redirects back to the Login screen.
      response = errorResponse;
    }
  }
  // Inform any followers, release lock
  if (loginListeners.length > 0) {
    loginListeners = [];
    for (let i = 0; i < loginListeners.length; i++) {
      const listener = loginListeners[i];
      listener(response);
    }
  }
  loginActive = false;
  // This should be the only return
  return response;
};

/**
 * Change active vehicle (stateful).
 *
 * Exposed as async function because of required follow-up checks.
 **/
export const selectVehicle = async (
  request: {
    vin: string;
  },
  refresh?: RefreshVehicleOptions,
): Promise<NormalResult<ClientSessionVehicle>> => {
  const {t} = i18n;
  const selectVehicleResponse = await store
    .dispatch(accountApi.endpoints.selectVehicle.initiate(request))
    .unwrap();

  if (!selectVehicleResponse.success) {
    if (selectVehicleResponse.errorCode == cVehicleSetupError) {
      const _ok = await promptAlert(
        t('login:loginError'),
        t('login:notSetProperly'),
        [{title: t('common:ok'), type: 'primary'}],
        {type: 'error'},
      );
    } else {
      return selectVehicleResponse;
    }
  }

  // skip if refresh set to none
  if (refresh?.type != 'none') {
    // TODO:UA:20240710 - possibly evaluate session and/or age of refresh to determine whether refresh is needed

    // await if refresh type is set to 'sync'
    if (refresh?.type == 'sync') await refreshVehicles(request);
    // void otherwise
    else void refreshVehicles(request);
  } else {
    // Fetch from redux because response is missing keys
    const vehicle = getCurrentVehicle();
    mgaLoadShortcuts(vehicle);
  }

  return selectVehicleResponse;
};

export const refreshVehicles = async (_request: {
  vin: string;
}): Promise<NormalResult<SessionData>> => {
  const {t} = i18n;
  const refreshVehicleResponse = await store
    .dispatch(accountApi.endpoints.refreshVehicles.initiate(undefined))
    .unwrap();

  if (refreshVehicleResponse.data?.sessionChanged) {
    if (refreshVehicleResponse.data.vehicleInactivated) {
      // track vehicle inactivated
      CsfSimpleAlert(
        t('login:vehiclesUpdated'),
        t('login:vehiclesUpdatedMessage'),
        {type: 'warning'},
      ); // GMA-295

      trackGenericEvent('GenericEvent-VehicleInactivated');
    } else {
      trackGenericEvent('GenericEvent-SessionChanged');
    }
  }
  // Reload shortcuts if refreshVehicles changed sub data
  const vehicle = getCurrentVehicle();
  mgaLoadShortcuts(vehicle);

  return refreshVehicleResponse;
};

export const selectVehicleIfNotActive = async (request: {
  vin: string;
}): Promise<NormalResult<ClientSessionVehicle>> => {
  const vehicle = getCurrentVehicle();
  if (!vehicle || !vehicle.vin || !request.vin) {
    return {success: false, errorCode: cNoVehicle, dataName: null, data: null};
  }
  if (vehicle.vin == request.vin) {
    // Vehicle already selected
    return {success: true, errorCode: null, dataName: null, data: vehicle};
  }
  return await selectVehicle(request);
};
