import { NormalResult } from '../../../@types'
import {
  baseApi,
  MSAEndpointBuilder,
  MSAContentTypeForm,
  MSAQueryDefinition,
  MSASuccess,
} from '../../api'
import { SessionData } from './sessionSlice'

/** Request on vehicle */
export interface VehicleRequest {
  vin: string
}
/** List of contact methods to send a verification code */
export type ContactMethod = {
  phone?: string
  userName?: string
  email?: string
}
export interface TwoStepAuthContactsResponse extends MSASuccess {
  data: ContactMethod
  dataName: 'dataMap'
}
export interface TwoStepAuthSendVerificationRequest {
  contactMethod: string
  deviceName: string
  languageCode: string
}
export interface TwoStepAuthSendVerificationResponse extends MSASuccess {
  data: null
  dataName: null
}
export interface TwoStepAuthVerifyRequest {
  contactMethod: string
  deviceName: string
  rememberDevice: 0 | 1
  verificationCode: string
}
export interface TwoStepVerifyTelephoneRequest {
  cellularPhone: string
  homePhone: string
  workPhone: string
  verificationCode: string
}
export interface TwoStepAuthSendVerificationTelephoneResponse
  extends MSASuccess {
  data: null
  dataName: null
}
export type TwoStepAuthVerifyResponse = NormalResult<SessionData>
export const loginEndpoints: (builder: MSAEndpointBuilder) => {
  twoStepAuthContacts: MSAQueryDefinition<
    undefined,
    TwoStepAuthContactsResponse
  >
  twoStepAuthSendVerification: MSAQueryDefinition<
    TwoStepAuthSendVerificationRequest,
    TwoStepAuthSendVerificationResponse
  >
  twoStepAuthVerify: MSAQueryDefinition<
    TwoStepAuthVerifyRequest,
    TwoStepAuthVerifyResponse
  >
  twoStepAuthVerifyTelephone: MSAQueryDefinition<
    TwoStepVerifyTelephoneRequest,
    TwoStepAuthSendVerificationTelephoneResponse
  >
} = builder => ({
  twoStepAuthContacts: builder.query({
    query: () => ({
      url: 'twoStepAuthContacts.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  twoStepAuthSendVerification: builder.query({
    query: parameters => ({
      body: parameters,
      url: 'twoStepAuthSendVerification.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeForm,
      requires: ['session'],
    },
  }),
  twoStepAuthVerify: builder.query({
    query: parameters => ({
      body: parameters,
      url: 'twoStepAuthVerify.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeForm,
      requires: ['session'],
    },
  }),
  twoStepAuthVerifyTelephone: builder.query({
    query: parameters => ({
      body: parameters,
      url: 'profile/mobilePhoneChange/verify.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeForm,
      requires: ['session'],
    },
  }),
})

export const loginApi = baseApi.injectEndpoints({ endpoints: loginEndpoints })
export const {
  useLazyTwoStepAuthContactsQuery,
  useLazyTwoStepAuthSendVerificationQuery,
  useLazyTwoStepAuthVerifyQuery,
  useLazyTwoStepAuthVerifyTelephoneQuery,
} = loginApi
