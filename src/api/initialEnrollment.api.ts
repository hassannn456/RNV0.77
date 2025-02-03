// Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/g2/InitialEnrollmentController.java

import {
  MSAMutationDefinition,
  MSAEndpointBuilder,
  MSAQueryDefinition,
  baseApi,
  MSAContentTypeJSON,
} from '../api';
import {
  CheckVINValidityResponse,
  EnrollmentResponse,
  EnrollResponse,
  NormalResult,
  PostEnrollRequest,
  PreEnrollRequest,
  PreEnrollResponse,
  RateSchedule,
  StarlinkPackage,
  SubscriptionEnrollmentForm,
  VehicleInfoRequest,
} from '../../@types';
import i18n from '../i18n';
import {promptAlert} from '../components';

export interface RateScheduleRequest {
  starlinkPackage: StarlinkPackage;
  currentDurationMonths?: number;
}

/** Key value map returned by Java. */
export interface RateScheduleResponse {
  phevSafetyRateSchedule?: RateSchedule;
  phevRemoteRateSchedule?: RateSchedule;
  rateSchedules: RateSchedule[];
  eligibleForTrial: boolean;
  cpoEligible: boolean;
  safetyMonthlyRateSchedule: RateSchedule;
  remoteMonthlyRateSchedule: RateSchedule;
  conciergeMonthlyRateSchedule: RateSchedule;
}

/** Matches error codes related to billing address validation failure on backend. */
export const isErrorCodeAddressViolation = (
  errorCode: number | null | undefined,
): boolean => {
  return errorCode == 25001 || errorCode == 1001;
};

export const promptIfResponseIsVertexError = (
  response: NormalResult<{enrollResponse: EnrollResponse}>,
): NormalResult<{enrollResponse: EnrollResponse}> => {
  if (
    isErrorCodeAddressViolation(
      response.data?.enrollResponse.overallResult?.errorCode,
    )
  ) {
    const {t} = i18n;
    promptAlert(t('common:error'), t('subscriptionEnrollment:vertexError'))
      .then()
      .catch(console.error);
  }
  return response;
};

export const initialEnrollmentEndpoints: (builder: MSAEndpointBuilder) => {
  preEnrollValidity: MSAQueryDefinition<
    PreEnrollRequest,
    NormalResult<PreEnrollResponse>
  >;
  checkVINValidity: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<CheckVINValidityResponse>
  >;
  checkForExistingAriaAccount: MSAQueryDefinition<
    undefined,
    NormalResult<boolean>
  >;
  findEnrollmentOffers: MSAQueryDefinition<undefined, NormalResult<unknown>>;
  rateSchedules: MSAQueryDefinition<
    RateScheduleRequest,
    NormalResult<RateScheduleResponse>
  >;
  priceCheck: MSAMutationDefinition<
    SubscriptionEnrollmentForm,
    NormalResult<{enrollResponse: EnrollResponse}>
  >;
  enroll: MSAMutationDefinition<
    SubscriptionEnrollmentForm,
    NormalResult<EnrollmentResponse>
  >;
  modifyEnrollment: MSAMutationDefinition<
    SubscriptionEnrollmentForm,
    NormalResult<EnrollmentResponse>
  >;
  postEnroll: MSAMutationDefinition<PostEnrollRequest, NormalResult<null>>;
} = builder => ({
  preEnrollValidity: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'preEnrollValidity.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  checkVINValidity: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'checkVINValidity.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  checkForExistingAriaAccount: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'checkForExistingAriaAccount.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  findEnrollmentOffers: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'findEnrollmentOffers.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  rateSchedules: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'rateSchedules.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  priceCheck: builder.mutation({
    query: parameters => ({
      body: parameters,
      url: 'priceCheck.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeJSON,
      requires: ['session', 'timestamp'],
    },
    transformResponse: promptIfResponseIsVertexError,
  }),
  enroll: builder.mutation({
    query: parameters => ({
      body: parameters,
      url: 'enroll.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  modifyEnrollment: builder.mutation({
    query: parameters => ({
      body: parameters,
      url: 'modifyEnrollment.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  postEnroll: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: 'postEnroll.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
});

export const initialEnrollmentApi = baseApi.injectEndpoints({
  endpoints: initialEnrollmentEndpoints,
});
export const {
  usePreEnrollValidityQuery,
  useCheckVINValidityQuery,
  useCheckForExistingAriaAccountQuery,
  useFindEnrollmentOffersQuery,
  useRateSchedulesQuery,
  usePriceCheckMutation,
  useEnrollMutation,
  useModifyEnrollmentMutation,
  usePostEnrollMutation,
} = initialEnrollmentApi;
