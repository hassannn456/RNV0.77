// Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/EventsController.java

import {MSAEndpointBuilder, MSAQueryDefinition, baseApi} from '../api';
import {EventItemInfo, NormalResult, VehicleInfoRequest} from '../../@types';

export const eventsEndpoints: (builder: MSAEndpointBuilder) => {
  // NOTE: Current API doesn't require a vehicle but returns vehicle specific info
  // Including VIN for caching tag and future stateless implementation
  events: MSAQueryDefinition<VehicleInfoRequest, NormalResult<EventItemInfo[]>>;
} = builder => ({
  events: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'events.json',
      method: 'GET',
      params: parameters,
    }),
  }),
});

export const eventsApi = baseApi.injectEndpoints({
  endpoints: eventsEndpoints,
});
export const {useEventsQuery} = eventsApi;
