// cSpell:ignore vehicleaccounttype, istrialeligible, monthlycost
// Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/g2/ManageEnrollmentController.java

import {
  MSAMutationDefinition,
  MSAEndpointBuilder,
  MSAQueryDefinition,
  baseApi,
  MSAContentTypeJSON,
  MSAContentTypeForm,
  cNetworkError,
} from '../api';
import {
  AddPlansResponse,
  BillingDetails,
  CancelPlansResponse,
  InvoicesForm,
  NormalResult,
  PaymentMethodRequest,
  PaymentMethodResponse,
  RateSchedule,
  StarlinkPackage,
  SubscriptionDetail,
  SubscriptionUpgradeForm,
  UpgradeOptionsResponse,
  VehicleInfoRequest,
} from '../../@types';
import {AriaErrorMessage, parseAriaRedirectUrl} from '../utils/aria';
import {store} from '../store';
import {EncodableFormData, encodeFormData} from '../utils/encode';
import i18n from '../i18n';
import {promptAlert} from '../components';
import {isErrorCodeAddressViolation} from './initialEnrollment.api';
import {has} from '../features/menu/rules';
import {trackError} from '../components/useTracking';

export interface CancelPlansRequest {
  starlinkPackage: StarlinkPackage;
  doWrite: boolean;
}

export interface InvoiceDetailRequest {
  invoiceNumber: number;
}

export interface InvoiceLineItem {
  line_item_no: number;
  amount: number;
  plan_name: string;
  service_name: string;
  start_date: string;
  end_date: string;
  plan_no: number;
  service_no: number;
  comments: string;
}

export interface InvoiceDetailResponse {
  invoice_no: number;
  client_acct_id: string;
  bill_date: string;
  paid_date: string;
  from_date: string;
  to_date: string;
  amount: number;
  total_due: number;
  aria_statement_no: number;
  billing_group_no: number;
  invoice_line_m: InvoiceLineItem[];
}

export interface RefundReceiptRequest {
  refundTransactionId: number;
}

export interface RefundLineItem {
  invoiceNo: number;
  invoiceBillDate: string;
  invoiceAmount: number;
  clientServiceId:
    | 'starlinkSafety'
    | 'starlinkRemoteServices'
    | 'starlinkConcierge';
}

export interface RefundReceiptResponse {
  refundTransactionId: number;
  refundAmount: number;
  createDate: string;
  paymentMethodId: number;
  paymentMethod: string;
  ccType: string;
  ccSuffix: string;
  invoiceReversals: RefundLineItem[];
  taxAmount: number;
}

/** Endpoint can return null for cost, use as fallback */
export const defaultLiveTrafficMonthlyCost = 2.95;

/**
 * Key value map returned by Java.
 **/
export interface TrafficConnectAccountTypeTrialStatusMonthlyCostResponse {
  vehicleAccountType: string;
  isTrialEligible: boolean;
  monthlyCost: null | number;
}

/**
 * Key value map returned by Java.
 **/
export interface UpgradeOptionsMap {
  upgradeOptions: UpgradeOptionsResponse;
  remoteMonthlyRateSchedule: RateSchedule;
  conciergeMonthlyRateSchedule: RateSchedule;
}

export interface autoRenewSubscription {
  starlinkPackage: StarlinkPackage;
}

export const manageEnrollmentEndpoints: (builder: MSAEndpointBuilder) => {
  ariaDirectPostUrl: MSAQueryDefinition<undefined, NormalResult<string>>;
  billingInformation: MSAQueryDefinition<
    undefined,
    NormalResult<BillingDetails>
  >;
  currentEnrollment: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<SubscriptionDetail[]>
  >;
  enableAutoRenewSubscription: MSAQueryDefinition<
    autoRenewSubscription,
    NormalResult<null>
  >;
  disableAutoRenewSubscription: MSAQueryDefinition<
    autoRenewSubscription,
    NormalResult<null>
  >;
  paymentMethod: MSAQueryDefinition<
    PaymentMethodRequest,
    NormalResult<PaymentMethodResponse>
  >;
  postUpdatePayment: MSAMutationDefinition<
    undefined,
    NormalResult<null | AriaErrorMessage[]>
  >;
  upgradeOptions: MSAQueryDefinition<
    undefined,
    NormalResult<UpgradeOptionsMap>
  >;
  getTrafficConnectAccountTypeTrialStatusMonthlyCost: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<TrafficConnectAccountTypeTrialStatusMonthlyCostResponse>
  >;
  getTrafficConnectPricingNoTrial: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<RateSchedule[]>
  >;
  getTrafficConnectPricing: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<RateSchedule[]>
  >;
  setTrafficConnectAutoRenew: MSAMutationDefinition<
    boolean,
    NormalResult<null>
  >;
  upgradePlans: MSAMutationDefinition<
    SubscriptionUpgradeForm,
    NormalResult<{addPlansResponse: AddPlansResponse}>
  >;
  /**
   * Cancels plans (doWrite: true) or computes refund (doWrite: false).
   *
   * `cancelPriceCheck` is the name of the backend Java function.
   **/
  cancelPriceCheck: MSAQueryDefinition<
    CancelPlansRequest,
    NormalResult<CancelPlansResponse>
  >;
  invoicesPage: MSAQueryDefinition<undefined, NormalResult<InvoicesForm[]>>;
  invoiceDetails: MSAQueryDefinition<
    InvoiceDetailRequest,
    NormalResult<InvoiceDetailResponse>
  >;
  refundReceipt: MSAQueryDefinition<
    RefundReceiptRequest,
    NormalResult<RefundReceiptResponse>
  >;
} = builder => ({
  ariaDirectPostUrl: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'manageEnrollment/ariaDirectPostUrl.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  billingInformation: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'manageEnrollment/billingInformation.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  currentEnrollment: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'manageEnrollment/subscriptionDetails.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  enableAutoRenewSubscription: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'manageEnrollment/enableAutoRenew.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session'],
    },
  }),
  disableAutoRenewSubscription: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'manageEnrollment/cancelAutoRenew.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session'],
    },
  }),
  paymentMethod: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'manageEnrollment/paymentMethod.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    providesTags: ['paymentMethod'],
  }),
  postUpdatePayment: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: 'manageEnrollment/postUpdatePayment.json',
      method: 'POST',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session'],
    },
    invalidatesTags: ['paymentMethod'],
  }),
  upgradeOptions: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'manageEnrollment/upgradeOptions.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session'],
    },
  }),
  getTrafficConnectAccountTypeTrialStatusMonthlyCost: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'manageEnrollment/traffic-connect/vehicleaccounttype-istrialeligible-monthlycost.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session'],
    },
  }),
  getTrafficConnectPricingNoTrial: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'manageEnrollment/traffic-connect/monthly-pricing.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session'],
    },
  }),
  getTrafficConnectPricing: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'manageEnrollment/traffic-connect/plan-options.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session'],
    },
  }),
  setTrafficConnectAutoRenew: builder.mutation({
    query: parameters => ({
      body: parameters,
      url: 'manageEnrollment/traffic-connect/auto-renew.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeJSON,
      requires: ['session'],
    },
  }),
  upgradePlans: builder.mutation({
    query: parameters => ({
      body: parameters,
      url: 'manageEnrollment/upgradePlans.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session'],
    },
    transformResponse: (
      response: NormalResult<{addPlansResponse: AddPlansResponse}>,
    ) => {
      if (
        isErrorCodeAddressViolation(
          response.data?.addPlansResponse.overallResult?.errorCode,
        )
      ) {
        const {t} = i18n;
        promptAlert(t('common:error'), t('subscriptionEnrollment:vertexError'))
          .then()
          .catch(console.error);
      }
      return response;
    },
  }),
  cancelPriceCheck: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'manageEnrollment/cancelPlans.json',
      method: 'POST',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session'],
    },
  }),
  invoicesPage: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'manageEnrollment/invoices.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  invoiceDetails: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'manageEnrollment/invoiceDetails.json',
      method: 'GET',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  refundReceipt: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'manageEnrollment/refundReceipt.json',
      method: 'GET',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
});

export const manageEnrollmentApi = baseApi.injectEndpoints({
  endpoints: manageEnrollmentEndpoints,
});
export const {
  useAriaDirectPostUrlQuery,
  useBillingInformationQuery,
  useCurrentEnrollmentQuery,
  useEnableAutoRenewSubscriptionQuery,
  useDisableAutoRenewSubscriptionQuery,
  usePaymentMethodQuery,
  usePostUpdatePaymentMutation,
  useUpgradeOptionsQuery,
  useGetTrafficConnectAccountTypeTrialStatusMonthlyCostQuery,
  useGetTrafficConnectPricingNoTrialQuery,
  useGetTrafficConnectPricingQuery,
  useSetTrafficConnectAutoRenewMutation,
  useUpgradePlansMutation,
  useCancelPriceCheckQuery,
  useInvoicesPageQuery,
  useInvoiceDetailsQuery,
  useRefundReceiptQuery,
} = manageEnrollmentApi;

export interface AriaBillingDetails {
  cc_no: string;
  cvv: string;
  cc_exp_mm: string;
  cc_exp_yyyy: string;
  bill_first_name: string;
  bill_last_name: string;
  bill_address1: string;
  bill_address2: string;
  bill_city: string;
  bill_state_prov: string;
  bill_postal_cd: string;
  /** ARIA payment field: ariaClientNumber (from Subaru) -> client_no (to Aria) */
  client_no: string;
  /** ARIA payment field: ariaBillingMode (from Subaru) -> mode (to Aria) */
  mode: string;
  inSessionID: string;
  formOfPayment: string;
  /**
   * ARIA payment field: invoiceNumber (from Subaru) -> pending_invoice_no (to Aria)
   *
   * Required for initial enrollments only.
   **/
  pending_invoice_no?: number;
}

/** Failure response from ARIA endpoint transformed to match Subaru APIs */
export interface AriaErrorResponse {
  success: false;
  errorCode: 'ariaError';
  dataName: 'error';
  data: AriaErrorMessage[];
}

const ariaError: AriaErrorResponse = {
  success: false,
  errorCode: 'ariaError',
  dataName: 'error',
  data: [],
};

export const postAriaBilling: (
  url: string,
  data: AriaBillingDetails,
) => Promise<NormalResult<null | AriaErrorMessage[]>> = async (url, data) => {
  try {
    // Send payment data to ARIA
    const aria = await fetch(url, {
      headers: {
        'content-type': MSAContentTypeForm,
      },
      method: 'POST',
      body: encodeFormData(data as unknown as EncodableFormData),
    });
    const decoded = decodeURI(aria.url);
    const response = parseAriaRedirectUrl(decoded);
    if (response.error_messages.length > 0)
      return {
        ...ariaError,
        data: response.error_messages,
      };
    // Make an empty POST to let Subaru know ARIA acknowledged change
    const subaru = await store
      .dispatch(
        manageEnrollmentApi.endpoints.postUpdatePayment.initiate(undefined),
      )
      .unwrap();
    if (!subaru.success) return ariaError;
    return subaru;
  } catch (error) {
    const ariaErrorMessage: AriaErrorResponse = {
      ...ariaError,
      // eslint-disable-next-line camelcase
      data: [{error_code: cNetworkError}],
    };
    return ariaErrorMessage;
  }
};

/** Disable individual cancel options if age < 2 days */
export const showCancelAllNotice = (
  plans: SubscriptionDetail[] | null | undefined,
): boolean => {
  if (!plans) {
    return false;
  }
  return !!plans.find(plan => plan.planAgeInDays < 2);
};

/** Can subscription be updated by customer? */
export const isWritableSubscription = (
  plan: SubscriptionDetail | null | undefined,
): boolean => {
  if (!plan) return false;
  return (
    plan.masterPlanId.includes('Retail') ||
    plan.masterPlanId.includes('Lease') ||
    plan.masterPlanId.includes('Finance') ||
    plan.masterPlanId.includes('CPO') ||
    plan.masterPlanId.includes('PlugInPlus')
  );
};

/** Is subscription attached to a leased vehicle? */
export const isLeaseSubscription = (
  plan: SubscriptionDetail | null | undefined,
): boolean => {
  if (!plan) return false;
  return (
    plan.masterPlanId.includes('Lease') || plan.masterPlanId.includes('Finance')
  );
};

/** Is subscription for Subaru Live Traffic (TomTom-based) */
export const isLiveTrafficSubscription = (
  plan: SubscriptionDetail | null | undefined,
): boolean => {
  if (!plan) return false;
  return plan.masterPlanId.includes('starlinkTomTom');
};

/** Is subscription a PHEV Trial? */
export const isPHEVTrial = (
  plan: SubscriptionDetail | null | undefined,
): boolean => {
  if (!plan) {
    return false;
  }
  return plan.masterPlanId.includes('TrialRetailPHEV');
};

/**
 * Name of plan.
 *
 * Covers SCI plans, but needs expanded / tested if used for SOA.  */
export const getNameForPlan = (
  plan?: SubscriptionDetail | null | undefined,
): string => {
  const {t} = i18n;
  if (isLiveTrafficSubscription(plan)) {
    return t('subscriptionServices:subaruTrafficConnect');
  }
  const starlinkPackage = plan?.starlinkPackage ?? 'EMPTY';
  switch (starlinkPackage) {
    case 'ALLIN':
    case 'EMPTY':
      return t(
        has('cap:PHEV')
          ? 'branding:starlinkPluginPlus'
          : 'branding:starlinkConnectedServices',
      );
    default:
      trackError('getNameForPlan')(
        `Package <${starlinkPackage}> not covered in switch!`,
      );
      return starlinkPackage;
  }
};
