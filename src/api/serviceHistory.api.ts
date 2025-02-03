// Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/ServiceHistoryController.java

import {
  MSAMutationDefinition,
  MSAEndpointBuilder,
  MSAQueryDefinition,
  baseApi,
} from '../api';
import {encode} from '../utils/encode';
import {NormalResult, ServiceHistory} from '../../@types';
import {format} from 'date-fns';

/**
 * Format a date to MMM, DD YYYY.
 *
 * Cordova uses a library (moment.js)
 * to wrap a call (common.util.js::formatUtcDate)
 * which is used on exactly one file (services.js)
 **/
const formatUtcDate = (date: Date | number | undefined): string | undefined => {
  if (date == undefined) return undefined;
  if (typeof date == 'number') return formatUtcDate(new Date(date));
  return format(date, 'MMM dd, yyyy');
};

/**
 * Reshape ServiceHistory based on backend requirements.
 **/
const transformServiceHistoryRequest = (
  record: Partial<ServiceHistory>,
): Record<string, any> => {
  return {
    ...record,
    serviceDate: formatUtcDate(record.serviceDate),
    serviceHeaderKey: encode(record.serviceHeaderKey),
    ownerRepairServiceId: encode(record.ownerRepairServiceId),
  };
};

export const serviceHistoryEndpoints: (builder: MSAEndpointBuilder) => {
  serviceHistory: MSAQueryDefinition<undefined, NormalResult<ServiceHistory[]>>;
  updateServiceUser: MSAMutationDefinition<
    Partial<ServiceHistory>,
    NormalResult<null>
  >;
  updateServiceDealer: MSAMutationDefinition<
    Partial<ServiceHistory>,
    NormalResult<null>
  >;
  removeService: MSAMutationDefinition<
    Partial<ServiceHistory>,
    NormalResult<null>
  >;
  addServiceEntry: MSAMutationDefinition<
    Partial<ServiceHistory>,
    NormalResult<null>
  >;
} = builder => ({
  serviceHistory: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    providesTags: ['serviceHistory'],
    query: parameters => ({
      url: 'serviceHistory.json',
      method: 'GET',
      params: parameters,
    }),
  }),
  updateServiceUser: builder.mutation({
    invalidatesTags: ['serviceHistory'],
    query: parameters => ({
      url: 'updateServiceUser.json',
      method: 'POST',
      params: transformServiceHistoryRequest(parameters),
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  updateServiceDealer: builder.mutation({
    invalidatesTags: ['serviceHistory'],
    query: parameters => ({
      url: 'updateServiceDealer.json',
      method: 'POST',
      params: transformServiceHistoryRequest(parameters),
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  removeService: builder.mutation({
    invalidatesTags: ['serviceHistory'],
    query: parameters => ({
      url: 'removeService.json',
      method: 'GET',
      params: transformServiceHistoryRequest(parameters),
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  addServiceEntry: builder.mutation({
    invalidatesTags: ['serviceHistory'],
    query: parameters => ({
      url: 'addServiceEntry.json',
      method: 'GET',
      params: transformServiceHistoryRequest(parameters),
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
});

export const serviceHistoryApi = baseApi.injectEndpoints({
  endpoints: serviceHistoryEndpoints,
});
export const {
  useServiceHistoryQuery,
  useUpdateServiceDealerMutation,
  useUpdateServiceUserMutation,
  useRemoveServiceMutation,
  useAddServiceEntryMutation,
} = serviceHistoryApi;
