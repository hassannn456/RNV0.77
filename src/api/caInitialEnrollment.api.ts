// Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/g2/CanadaInitialEnrollmentController.java

import {
  CanadaSubscriptionEnrollmentForm,
  CheckVINValidityResponse,
  EnrollmentResponse,
  EnrollResponse,
  LocalDate,
  NormalResult,
  PostEnrollRequest,
  PreEnrollRequest,
  PreEnrollResponse,
  RateSchedule,
  VehicleInfoRequest,
} from '../../@types';
import {
  baseApi,
  MSAContentTypeJSON,
  MSAEndpointBuilder,
  MSAMutationDefinition,
  MSAQueryDefinition,
} from '../api';
import {promptIfResponseIsVertexError} from './initialEnrollment.api';

/** Key value map returned by Java. */
export interface CanadaRateScheduleResponse {
  allInRateSchedule?: RateSchedule;
  startDate?: LocalDate;
  endDate?: LocalDate;
}

export const canadaInitialEnrollmentEndpoints: (
  builder: MSAEndpointBuilder,
) => {
  canadaPreEnrollValidity: MSAQueryDefinition<
    PreEnrollRequest,
    NormalResult<PreEnrollResponse>
  >;
  canadaCheckVINValidity: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<CheckVINValidityResponse>
  >;
  canadaCheckForExistingAriaAccount: MSAQueryDefinition<
    undefined,
    NormalResult<boolean>
  >;
  canadaRateSchedules: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<CanadaRateScheduleResponse>
  >;
  canadaPriceCheck: MSAMutationDefinition<
    CanadaSubscriptionEnrollmentForm,
    NormalResult<{enrollResponse: EnrollResponse}>
  >;
  canadaEnroll: MSAMutationDefinition<
    CanadaSubscriptionEnrollmentForm,
    NormalResult<EnrollmentResponse>
  >;
  canadaModifyEnrollment: MSAMutationDefinition<
    CanadaSubscriptionEnrollmentForm,
    NormalResult<EnrollmentResponse>
  >;
  canadaPostEnroll: MSAMutationDefinition<
    PostEnrollRequest,
    NormalResult<null>
  >;
} = builder => ({
  canadaPreEnrollValidity: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'caInitialEnrollment/preEnrollValidity.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  canadaCheckVINValidity: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'caInitialEnrollment/checkVINValidity.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  canadaCheckForExistingAriaAccount: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'caInitialEnrollment/checkForExistingAriaAccount.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  canadaRateSchedules: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'caInitialEnrollment/rateSchedules.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  canadaPriceCheck: builder.mutation({
    query: parameters => ({
      body: parameters,
      url: 'caInitialEnrollment/priceCheck.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeJSON,
      requires: ['session', 'timestamp'],
    },
    transformResponse: promptIfResponseIsVertexError,
  }),
  canadaEnroll: builder.mutation({
    query: parameters => ({
      body: parameters,
      url: 'caInitialEnrollment/enroll.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  canadaModifyEnrollment: builder.mutation({
    query: parameters => ({
      body: parameters,
      url: 'caInitialEnrollment/modifyEnrollment.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  canadaPostEnroll: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: 'caInitialEnrollment/postEnroll.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
});

export const canadaInitialEnrollmentApi = baseApi.injectEndpoints({
  endpoints: canadaInitialEnrollmentEndpoints,
});
export const {
  useCanadaPreEnrollValidityQuery,
  useCanadaCheckVINValidityQuery,
  useCanadaCheckForExistingAriaAccountQuery,
  useCanadaRateSchedulesQuery,
  useCanadaPriceCheckMutation,
  useCanadaEnrollMutation,
  useCanadaModifyEnrollmentMutation,
  useCanadaPostEnrollMutation,
} = canadaInitialEnrollmentApi;
