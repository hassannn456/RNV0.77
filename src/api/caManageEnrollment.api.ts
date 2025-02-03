// Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/g2/CanadaManageEnrollmentController.java

import {
  AddPlansResponse,
  BillingDetails,
  CancelPlansResponseCanada,
  NormalResult,
  PaymentMethodRequest,
  PaymentMethodResponse,
  RateSchedule,
  SubscriptionDetail,
  VehicleInfoRequest,
} from '../../@types';
import {
  baseApi,
  MSAEndpointBuilder,
  MSAMutationDefinition,
  MSAQueryDefinition,
} from '../api';
import {has} from '../features/menu/rules';
import {AriaErrorMessage} from '../utils/aria';

interface CanadaUpgradeOptionsMap {
  upgradeOptions: {
    allInServicesAdd: RateSchedule;
    allInServicesTerm: RateSchedule & {planId: string; fullPrice: number};
  };
}

export const canadaManageEnrollmentEndpoints: (builder: MSAEndpointBuilder) => {
  canadaAriaDirectPostUrl: MSAQueryDefinition<undefined, NormalResult<string>>;
  canadaBillingInformation: MSAQueryDefinition<
    undefined,
    NormalResult<BillingDetails>
  >;
  canadaCurrentEnrollment: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<SubscriptionDetail[]>
  >;
  canadaPaymentMethod: MSAQueryDefinition<
    PaymentMethodRequest,
    NormalResult<PaymentMethodResponse>
  >;
  canadaPostUpdatePayment: MSAMutationDefinition<
    undefined,
    NormalResult<null | AriaErrorMessage[]>
  >;
  /**
   * Cancels plans (doWrite: true) or computes refund (doWrite: false).
   *
   * `cancelPriceCheck` is the name of the backend Java function.
   **/
  canadaCancelPriceCheck: MSAQueryDefinition<
    {doWrite: boolean},
    NormalResult<CancelPlansResponseCanada>
  >;
  canadaCancelTrafficConnectPriceCheck: MSAQueryDefinition<
    {trialEnrollPaymentError: boolean},
    NormalResult<CancelPlansResponseCanada>
  >;
  canadaUpgradeOptions: MSAQueryDefinition<
    undefined,
    NormalResult<CanadaUpgradeOptionsMap>
  >;
  canadaAddPaidPlan: MSAMutationDefinition<
    undefined,
    NormalResult<AddPlansResponse>
  >;
} = builder => ({
  canadaAriaDirectPostUrl: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'caManageEnrollment/ariaDirectPostUrl.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  canadaBillingInformation: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'caManageEnrollment/billingInformation.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  canadaCurrentEnrollment: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'caManageEnrollment/subscriptionDetails.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  canadaPaymentMethod: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'caManageEnrollment/paymentMethod.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    providesTags: ['paymentMethod'],
  }),
  canadaPostUpdatePayment: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: 'caManageEnrollment/postUpdatePayment.json',
      method: 'POST',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session'],
    },
    invalidatesTags: ['paymentMethod'],
  }),
  canadaCancelPriceCheck: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'caManageEnrollment/cancelPlans.json',
      method: 'POST',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session'],
    },
  }),
  canadaCancelTrafficConnectPriceCheck: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'caManageEnrollment/cancel-traffic-connect.json',
      method: 'POST',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session'],
    },
  }),
  canadaUpgradeOptions: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'caManageEnrollment/upgradeOptions.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session'],
    },
  }),
  canadaAddPaidPlan: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: 'caManageEnrollment/addPaidPlan.json',
      method: 'GET',
    }),
    extraOptions: {
      requires: ['session'],
    },
  }),
});

export const canadaManageEnrollmentApi = baseApi.injectEndpoints({
  endpoints: canadaManageEnrollmentEndpoints,
});
export const {
  useCanadaAriaDirectPostUrlQuery,
  useCanadaBillingInformationQuery,
  useCanadaCurrentEnrollmentQuery,
  useCanadaPaymentMethodQuery,
  useCanadaPostUpdatePaymentMutation,
  useCanadaCancelPriceCheckQuery,
  useCanadaCancelTrafficConnectPriceCheckQuery,
  useCanadaUpgradeOptionsQuery,
} = canadaManageEnrollmentApi;

/**
 * Check an SCI plan for auto-renew.
 *
 * Plans can enable auto-renew if:
 * - Region is SCI (SOA auto-renew is specific to Live Traffic).
 * - Renewal has not been opted in.
 * - Plan is in final year.
 * - User has not opted out ("DoNotRenew" flag).
 */
export const canAddAutoRenewToSciSubscription = (
  plan: SubscriptionDetail | null | undefined,
): boolean => {
  if (!has('reg:CA')) return false;
  if (!plan) return false;
  if (plan.automaticRenewal) return false;
  if (!plan.trial) return false;
  if (plan.customFields.some(field => field.name == 'DoNotRenew')) return false;
  const expirationDateMinus1Year = new Date(
    plan.expirationDate.year - 1,
    plan.expirationDate.monthValue - 1,
    plan.expirationDate.dayOfMonth,
    0,
    0,
    0,
    0,
  );
  if (new Date() < expirationDateMinus1Year) return false;
  return true;
};
