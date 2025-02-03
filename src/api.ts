import {EndpointBuilder} from '@reduxjs/toolkit/dist/query/endpointDefinitions';
import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  MutationDefinition,
  QueryDefinition,
} from '@reduxjs/toolkit/query/react';
// import { DemoPayload, demoPayload } from '../../build/demo'
import {
  currentVehicleReducer,
  getCurrentVehicle,
  SessionData,
} from '../src/features/auth/sessionSlice';
import {getEnvironmentConfig} from '../src/features/localization/environment';
import {parseRouteId, parseSessionId} from '../src/utils/cookie';
import {encodeFormData} from '../src/utils/encode';
import {RootState, store} from './store';
import {NormalResult} from '../@types';
import i18n from './i18n';
import {login} from '../src/api/account.api';
import {getUniqueIdSync} from 'react-native-device-info';
import {getPushToken} from '../src/features/notices/push';
import {getTokenFromStateOrService} from '../src/features/jwt/jwtSlice';
import {trackError} from '../src/components/useTracking';
import {errorNotice} from './components/notice';

export const MSATagTypes = [
  'authorizedUsers',
  'chargeSchedule',
  'curfew',
  'customerProfile',
  'emergencyContact',
  'geoFence',
  'paymentMethod',
  'remoteEngineStartSettings',
  'remoteEngineQuickStartSettings',
  'resource',
  'serviceHistory',
  'speedFence',
  'notificationPreferences',
  'notificationPreferencesGen2',
  'trips',
] as const;
export type MSATag = (typeof MSATagTypes)[number];
export type MSAToken = 'session' | 'timestamp' | 'PIN' | 'mysToken';
export type MSAArgs = FetchArgs;

export const MSAContentTypeForm =
  'application/x-www-form-urlencoded; charset=UTF-8';
export const MSAContentTypeJSON = 'application/json';
export type MSAContentType =
  | typeof MSAContentTypeForm
  | typeof MSAContentTypeJSON;
export type MSAOptions = {
  contentType?: MSAContentType;
  requires?: MSAToken[];
  demoFetchTag?: MSATag;
  demoSaveTag?: MSATag;
  /** Allow network call to renew session and retry. */
  allowSessionRenewal?: boolean;
  /** Default false. Set true if your call handles cNetworkError. */
  suppressConnectionNotice?: boolean;
  /**
   * Only make network request if certain preconditions are met.
   * Return false to cancel request and return an error.
   *
   * Useful for maintaining hook count on screens.
   **/
  precondition?: () => boolean;
};

export interface MSAMeta {
  ts?: number;
}

interface ServerPayload {
  success: boolean;
  errorCode?: string | null;
  dataName?: string | null;
  data?: unknown;
}

export interface MSASuccess extends ServerPayload {
  success: true;
}

export interface MSAError extends ServerPayload {
  success: false;
}

export const parseServerResponse = (payload: unknown): ServerPayload => {
  if (payload == null) {
    return {success: false, errorCode: 'EMPTY_PAYLOAD'};
  }
  if (typeof payload == 'boolean') {
    return {success: payload};
  }
  if (typeof payload == 'object') {
    const success: boolean = (payload as ServerPayload).success;
    return {success: !!success, ...payload};
  }
  return {success: false, errorCode: 'INVALID_STRUCTURE'};
};

/** MySubaru (legacy) API Base Query Function */
export type MSABaseQueryFn = BaseQueryFn<
  MSAArgs,
  ServerPayload,
  ServerPayload,
  MSAOptions,
  MSAMeta
>;
/** Client thinks network request failed and didn't reach backend  */
export const cNetworkError = 'notConnected';
export const cDemoError = 'NOT_IMP_IN_DEMO';
/**
 * Base url (ex: https://mobileapi.qa.subarucs.com/g2v30) not found in environment config.
 *
 * This was added because microservices are not deployed for SCI.
 **/
export const cNoBaseURL = 'NO_BASE_URL';
export const cNoConfig = 'NO_ENV_CONFIG';
/** 401 */
export const cUnauthorized = 'INVALID_SESSION';
export const cAbortedTimeout = 'ABORTED_TIMEOUT';
export const cPreconditionFail = 'PRECONDITION_FAIL';

/** Object to hold mutating values during a demo run. */
// export let demoState: Record<string, DemoPayload> | null = null

/**
 * Set `true` to send `JSESSIONID` and `X-Oracle-BMC-LBS-Route` in Cookie.
 *
 * Set `false` to attach `;JSESSIONID=` to URL.
 *
 * Brian DeHaven requested using cookies
 * because of load balancer limitations.
 *
 * However, not all endpoints work with cookies
 * and endpoints that do work do not return 401
 * when the session has expired.
 */
const useCookieAuth = false;

const mySubaruFetchInternal = async (
  args: MSAArgs,
  state: RootState,
  options?: MSAOptions,
): Promise<ServerPayload> => {
  if (options?.precondition && options.precondition() == false) {
    return {success: false, errorCode: cPreconditionFail};
  }
  const env = getEnvironmentConfig(state.preferences?.environment);
  if (!env) {
    return {success: false, errorCode: cNoConfig};
  }
  if (state.demo) {
    if (!demoState) {
      demoState = {};
    }
    if (demoState && options?.demoFetchTag && demoState[options.demoFetchTag]) {
      const previousState = demoState[options.demoFetchTag];
      return previousState;
    }
    // const demo = demoPayload(args.url, env.demoFolder ?? '')
    // if (demo) {
    //   if (
    //     demoState &&
    //     options?.demoFetchTag &&
    //     !demoState[options.demoFetchTag]
    //   ) {
    //     demoState[options.demoFetchTag] = demo
    //   }
    //   if (demoState && options?.demoSaveTag) {
    //     demoState[options.demoSaveTag].data = args.body
    //   }
    //   return demo
    // } else {
    //   return { success: false, errorCode: cDemoError }
    // }
  }

  const requires = options?.requires ?? [];
  const base = requires.includes('mysToken') ? env.microservice : env.mobileapi;
  if (!base) {
    return {
      success: false,
      errorCode: cNoBaseURL,
      data: args.url,
      dataName: null,
    };
  }
  let url = new URL(args.url, base);
  const headers: HeadersInit_ = {};

  const params = args.params ?? {};
  if (requires.includes('session')) {
    const sessionId = state.session?.sessionId;
    const routeId = state.session?.routeId;
    if (!sessionId) {
      return {success: false, errorCode: cUnauthorized};
    }
    if (useCookieAuth) {
      const cookie = !routeId
        ? `JSESSIONID=${sessionId}`
        : `JSESSIONID=${sessionId}; X-Oracle-BMC-LBS-Route=${routeId}`;
      headers['Cookie'] = cookie;
    } else {
      url = new URL(`${args.url};jsessionid=${sessionId}`, env.mobileapi);
    }
  }
  if (requires.includes('timestamp')) {
    params['_'] = new Date().getTime();
  }
  if (requires.includes('mysToken')) {
    //TODO:MN:20240805 Have a conversation about how to handle if the jwt API call fails
    try {
      const mysToken = await getTokenFromStateOrService(store.getState());
      //if `mysToken` is `undefined`, throw.
      if (!mysToken) {
        throw new Error('Failed to retrieve valid JWT');
      }
      headers['Authorization'] = `Bearer ${mysToken.accessToken}`;
    } catch (error) {
      console.error(error);
      return {
        success: false,
        errorCode: '401',
      };
    }
  }
  const contentType =
    options?.contentType ?? (args.body ? MSAContentTypeJSON : undefined);
  const body = (() => {
    switch (contentType) {
      case MSAContentTypeJSON:
        return JSON.stringify(args.body);
      case MSAContentTypeForm:
        return encodeFormData(args.body);
      default:
        return undefined;
    }
  })();
  if (contentType) {
    headers['content-type'] = contentType;
  }
  const method = args.method ?? 'POST';
  const abortController = new AbortController();
  const init: RequestInit = useCookieAuth
    ? {
        body: body,
        headers: headers,
        method: method,
        signal: abortController.signal,
      }
    : {
        body: body,
        headers: headers,
        method: method,
        credentials: 'omit',
        signal: abortController.signal,
      };
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
  try {
    let fail = true;
    setTimeout(() => {
      if (fail) {
        abortController.abort();
      }
    }, 60000);
    let response: Response;
    try {
      response = await fetch(url.toString(), init);
    } catch (error) {
      trackError('api.ts::timeout')({url: args.url, error: error});
      return {
        success: false,
        errorCode: error?.toString().includes('Network request failed')
          ? cNetworkError
          : cAbortedTimeout,
        data: null,
        dataName: null,
      };
    }
    fail = false;
    const cookie = response.headers.get('set-cookie');
    if (cookie) {
      store.dispatch({
        type: 'session/replace',
        payload: {
          sessionId: parseSessionId(cookie),
          routeId: parseRouteId(cookie),
        },
      });
    }
    try {
      const json = (await response.json()) as unknown;
      const parsed = parseServerResponse(json);
      return {...parsed, errorCode: parsed.errorCode};
    } catch (error) {
      if (response.status < 200 || response.status > 299) {
        if (response.status == 401) {
          const keychain = state.keychain;
          const selectedVin = currentVehicleReducer(state)?.vin;
          if (
            options?.allowSessionRenewal &&
            keychain?.login?.rememberUserCheck == 'on'
          ) {
            const session = await login({
              env: env.id,
              loginUsername: keychain.login.loginUsername,
              password: keychain.login.password,
              rememberUserCheck: keychain.login.rememberUserCheck,
              deviceId: getUniqueIdSync(),
              pushToken: await getPushToken(),
              selectedVin: selectedVin,
            });
            if (session.success) {
              return await mySubaruFetch(args, store.getState(), {
                ...options,
                allowSessionRenewal: false,
              });
            }
          }
          store.dispatch({type: 'session/setLogin', payload: false});
          store.dispatch({type: 'keychain/clearSessionId'});
          return {success: false, errorCode: cUnauthorized};
        } else {
          console.error(
            `HTTP ${response.status} ${response.statusText}: ${url.toJSON()}`,
          );
        }
        return {
          success: false,
          errorCode: 'STATUS_ERROR',
          data: response.status,
        };
      } else {
        console.error(error);
        return {success: false, errorCode: 'PARSER_ERROR'};
      }
    }
  } catch (error) {
    return {success: false, errorCode: cNetworkError};
  }
};

let lastNetworkErrorNotice: number | null = null;

export const mySubaruFetch = async (
  args: MSAArgs,
  state: RootState,
  options?: MSAOptions,
): Promise<ServerPayload> => {
  const response = await mySubaruFetchInternal(args, state, options);
  if (response.dataName) {
    switch (response.dataName) {
      case 'encryptedPin': {
        const oemCustId = getCurrentVehicle()?.userOemCustId;
        const pin = response.data;
        if (oemCustId) {
          store.dispatch({
            type: 'keychain/storePin',
            payload: {oemCustId: oemCustId, pin: pin},
          });
        } else {
          console.warn(
            'Attempted to save PIN without selected vehicle. Ignoring.',
          );
        }
        break;
      }
      case 'remoteServiceStatus': {
        if (response.errorCode == 'InvalidCredentials') {
          const oemCustId = getCurrentVehicle()?.userOemCustId;
          if (oemCustId) {
            store.dispatch({type: 'keychain/clearPin', payload: oemCustId});
          }
        }
        break;
      }
      case 'sessionData': {
        const session = response as NormalResult<SessionData>;
        store.dispatch({type: 'session/replace', payload: response.data});
        if (session.data?.deviceRegistered) {
          store.dispatch({
            type: 'keychain/storeSessionId',
            payload: session.data.sessionId,
          });
        }
        break;
      }
      case 'vehicle': {
        store.dispatch({
          type: 'session/updateVehicle',
          payload: response.data,
        });
        break;
      }
    }
  }
  if (response.errorCode) {
    switch (response.errorCode) {
      case 'BIOMETRICS_DISABLED': {
        const oemCustId = getCurrentVehicle()?.userOemCustId;
        if (oemCustId) {
          store.dispatch({type: 'keychain/clearPin', payload: {oemCustId}});
        } else {
          console.warn(
            'Attempted to erase PIN without selected vehicle. Ignoring.',
          );
        }
        break;
      }
      case cNetworkError: {
        if (!options?.suppressConnectionNotice) {
          const now = new Date().getTime();
          const rateLimit = 20000; // 20 seconds
          if (
            !lastNetworkErrorNotice ||
            now - lastNetworkErrorNotice > rateLimit
          ) {
            const {t} = i18n;
            errorNotice({
              noticeKey: cNetworkError,
              title: t('message:notConnectedTitle'),
              subtitle: t('message:notConnected'),
            });
            lastNetworkErrorNotice = now;
          }
        }
      }
    }
  }
  return response;
};

export const mySubaruBaseQuery: MSABaseQueryFn = (
  args,
  {getState},
  options,
) => {
  return new Promise((resolve, _) => {
    const state = getState() as RootState;
    // mga-allow-then-catch - adapter for redux
    mySubaruFetch(args, state, options)
      .then(response => resolve({data: response}))
      .catch(trackError('api.ts')); // No errors thrown
  });
};
export type MSAEndpointBuilder = EndpointBuilder<MSABaseQueryFn, never, 'api'>;
export type MSAQueryDefinition<Request, Response> = QueryDefinition<
  Request,
  MSABaseQueryFn,
  never,
  Response,
  'api'
>;
export type MSAMutationDefinition<Request, Response> = MutationDefinition<
  Request,
  MSABaseQueryFn,
  never,
  Response,
  'api'
>;
export const baseApi = createApi({
  reducerPath: 'api',
  // NOTE: Injecting tagTypes via injectEndpoints does not appear to work
  tagTypes: MSATagTypes,
  baseQuery: mySubaruBaseQuery,
  endpoints: () => ({}),
});
