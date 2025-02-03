// Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/TradeUpAdvantageController.java

import {NormalResult, TradeUpAdvantageMessage} from '../../@types';
import {baseApi, MSAEndpointBuilder, MSAQueryDefinition} from '../api';

export const tradeUpEndpoints: (builder: MSAEndpointBuilder) => {
  /** Get vehicle trade up quote */
  tradeUpEvent: MSAQueryDefinition<
    undefined,
    NormalResult<TradeUpAdvantageMessage>
  >;
} = builder => ({
  tradeUpEvent: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'tradeUpEvent.json',
      method: 'GET',
      params: parameters,
    }),
  }),
});

export const tradeUpApi = baseApi.injectEndpoints({
  endpoints: tradeUpEndpoints,
});
export const {useTradeUpEventQuery} = tradeUpApi;
