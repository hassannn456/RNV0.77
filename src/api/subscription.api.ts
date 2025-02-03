// Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/g2/SubscriptionController.java

import {
  AttResponse,
  NormalResult,
  SxmRadioResponse,
  VehicleInfoRequest,
} from '../../@types';
import {MSAEndpointBuilder, MSAQueryDefinition, baseApi} from '../api';

export const subscriptionEndpoints: (builder: MSAEndpointBuilder) => {
  attWifiState: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<AttResponse>
  >;
  sxmRadioState: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<SxmRadioResponse>
  >;
} = builder => ({
  attWifiState: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'subscription/attWifiState.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  sxmRadioState: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'subscription/sxmRadioState.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
});

export const subscriptionApi = baseApi.injectEndpoints({
  endpoints: subscriptionEndpoints,
});
export const {useAttWifiStateQuery, useSxmRadioStateQuery} = subscriptionApi;
