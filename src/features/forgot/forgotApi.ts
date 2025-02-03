import {
  baseApi,
  MSAEndpointBuilder,
  MSAContentTypeForm,
  MSAQueryDefinition,
  MSAMutationDefinition,
  MSASuccess,
} from '../../api'

export interface ForgotUsernameParameters {
  vin: string
}
export interface ForgotUsernameResponse extends MSASuccess {
  data: string[]
}
export interface ForgotPasswordParameters {
  email: string
}
export interface ForgotPasswordResponse extends MSASuccess {
  dataName: 'dataMap'
  data: { phone?: string; email?: string; sessionId: string }
}
export interface ForgotPasswordSendVerificationRequest {
  contactMethod: string
  languageCode: string
}
export interface ForgotPasswordVerifyRequest {
  verificationCode: string
}
export interface ForgotPasswordEnterNewRequest {
  password: string
  passwordConfirmation: string
}
export const forgotEndpoints: (builder: MSAEndpointBuilder) => {
  forgotUsername: MSAQueryDefinition<
    ForgotUsernameParameters,
    ForgotUsernameResponse
  >
  forgotPassword: MSAQueryDefinition<
    ForgotPasswordParameters,
    ForgotPasswordResponse
  >
  forgotPasswordSendVerification: MSAMutationDefinition<
    ForgotPasswordSendVerificationRequest,
    MSASuccess
  >
  forgotPasswordVerify: MSAQueryDefinition<
    ForgotPasswordVerifyRequest,
    MSASuccess
  >
  forgotPasswordEnterNew: MSAQueryDefinition<
    ForgotPasswordEnterNewRequest,
    MSASuccess
  >
} = builder => ({
  forgotUsername: builder.query({
    query: parameters => ({
      body: parameters,
      url: 'forgotUsername.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeForm,
    },
  }),
  forgotPassword: builder.query({
    query: parameters => ({
      body: parameters,
      url: 'forgotPasswordContacts.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeForm,
      suppressConnectionNotice: true,
    },
  }),
  forgotPasswordSendVerification: builder.mutation({
    query: parameters => ({
      body: parameters,
      url: 'forgotPasswordSendVerification.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeForm,
      requires: ['session'],
    },
  }),
  forgotPasswordVerify: builder.query({
    query: parameters => ({
      body: parameters,
      url: 'forgotPasswordVerify.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeForm,
      requires: ['session'],
    },
  }),
  forgotPasswordEnterNew: builder.query({
    query: parameters => ({
      body: parameters,
      url: 'forgotPasswordEnterNew.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeForm,
      requires: ['session'],
    },
  }),
})
export const forgotApi = baseApi.injectEndpoints({ endpoints: forgotEndpoints })
export const {
  useLazyForgotUsernameQuery,
  useLazyForgotPasswordQuery,
  useForgotPasswordSendVerificationMutation,
  useLazyForgotPasswordVerifyQuery,
  useLazyForgotPasswordEnterNewQuery,
} = forgotApi
