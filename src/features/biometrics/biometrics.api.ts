import {
  baseApi,
  MSAContentTypeForm,
  MSAEndpointBuilder,
  MSAMutationDefinition,
} from '../../api'

export interface EncryptPinRequest {
  pin: string
}

export interface EncryptPinResponse {
  success: boolean
  /** Encrypted PIN */
  data?: string
}

export const biometricsEndpoints: (builder: MSAEndpointBuilder) => {
  encryptPin: MSAMutationDefinition<EncryptPinRequest, EncryptPinResponse>
} = builder => ({
  encryptPin: builder.mutation({
    query: parameters => ({
      body: parameters,
      url: '/profile/encryptPin.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeForm,
      requires: ['session'],
    },
  }),
})

export const biometricsApi = baseApi.injectEndpoints({
  endpoints: biometricsEndpoints,
})
export const { useEncryptPinMutation } = biometricsApi
