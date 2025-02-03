import { NormalResult } from '../../../@types'
import { baseApi, MSAEndpointBuilder, MSAQueryDefinition } from '../../api'
import { Token } from './jwtSlice'
export const jwtEndpoints: (builder: MSAEndpointBuilder) => {
  generateToken: MSAQueryDefinition<undefined, NormalResult<Token>>
} = builder => ({
  generateToken: builder.query({
    query: () => ({
      url: 'generateToken.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
      suppressConnectionNotice: true,
    },
  }),
})

export const jwtApi = baseApi.injectEndpoints({ endpoints: jwtEndpoints })
export const { useGenerateTokenQuery, useLazyGenerateTokenQuery } = jwtApi
