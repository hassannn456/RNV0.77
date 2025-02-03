import {
  baseApi,
  MSAEndpointBuilder,
  // MSAContentTypeForm,
  MSAQueryDefinition,
  MSAMutationDefinition,
  MSASuccess,
} from '../../../api'
import { Customer } from '../../../utils/vehicle'

export interface CustomerProfileParameters {
  vin: string
  oemCustId: string
}

export interface CustomerProfile extends Customer {
  nameTitles?: string[]
  phoneCommunicationPreferred?: boolean
  customerRegionChanged?: boolean
  subscriptionCanceledByRightToRepair?: boolean
  customerProfile: {
    firstName?: string
    lastName?: string
    title?: string
    suffix?: string
    email?: string
    address?: string
    address2?: string
    city?: string
    state?: string
    zip?: string
    cellularPhone?: string
    workPhone?: string
    homePhone?: string
    countryCode?: string
    relationshipType?: null
    gender?: string
    dealerCode?: null
    oemCustId?: string
    createMysAccount?: null
    sourceSystemCode?: string
    vehicles?: [
      {
        vin?: string
        siebelVehicleRelationship?: string
        primary?: boolean
        oemCustId?: string
        status?: string
      },
    ]
    phone?: string
    zip5Digits?: string
    primaryPersonalCountry?: string
  }
}
export interface CustomerProfileResponse extends MSASuccess {
  errorCode?: string
  data?: CustomerProfile
}
export interface EditEmailParameters {
  email: string
  emailConfirm: string
  password: string
  updateAction: string
}
export interface EditTelephoneParameters {
  cellularPhone: string
  homePhone: string
  workPhone: string
  password: string
  updateAction: string
}
export interface EditAddressParameters {
  address: string
  address2?: string
  city: string
  state: string
  zip5Digits: string
  countryCode: string
  updateAction: string
}
export interface SendVerificationParameters {
  cellularPhone: string
  homePhone: string
  workPhone: string
  password: string
}
export const profileEndpoints: (builder: MSAEndpointBuilder) => {
  customerProfile: MSAQueryDefinition<
    CustomerProfileParameters,
    CustomerProfileResponse
  >
  updateEmail: MSAMutationDefinition<
    EditEmailParameters,
    CustomerProfileResponse
  >
  updateTelephone: MSAMutationDefinition<
    EditTelephoneParameters,
    CustomerProfileResponse
  >
  updateAddress: MSAMutationDefinition<
    EditAddressParameters,
    CustomerProfileResponse
  >
  telephoneTwoAuthSendVerification: MSAMutationDefinition<
    SendVerificationParameters,
    MSASuccess
  >
} = builder => ({
  customerProfile: builder.query({
    query: parameters => ({
      params: parameters,
      url: '/profile/customerProfile.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    providesTags: ['customerProfile'],
    extraOptions: {
      requires: ['session', 'timestamp'],
      demoFetchTag: 'customerProfile',
      suppressConnectionNotice: true,
    },
  }),
  updateEmail: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: '/profile/customerProfile.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
      demoSaveTag: 'customerProfile',
      suppressConnectionNotice: true,
    },
    invalidatesTags: ['customerProfile'],
  }),
  updateTelephone: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: '/profile/customerProfile.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
      demoSaveTag: 'customerProfile',
      suppressConnectionNotice: true,
    },
    invalidatesTags: ['customerProfile'],
  }),
  updateAddress: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: '/profile/customerProfile.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
      demoSaveTag: 'customerProfile',
      suppressConnectionNotice: true,
    },
    invalidatesTags: ['customerProfile'],
  }),
  telephoneTwoAuthSendVerification: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: '/profile/mobilePhoneChange/initiate.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
      demoSaveTag: 'customerProfile',
    },
    invalidatesTags: ['customerProfile'],
  }),
})
export const contactApi = baseApi.injectEndpoints({
  endpoints: profileEndpoints,
})
export const {
  useCustomerProfileQuery,
  useUpdateAddressMutation,
  useUpdateEmailMutation,
  useUpdateTelephoneMutation,
  useTelephoneTwoAuthSendVerificationMutation,
} = contactApi
