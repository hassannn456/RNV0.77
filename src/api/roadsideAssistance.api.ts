// Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/RoadsideAssistanceController.java
import {NormalResult} from '../../@types';
import {
  MSAEndpointBuilder,
  MSAQueryDefinition,
  baseApi,
  MSAMutationDefinition,
  MSASuccess,
} from '../api';

export interface roadsideAssistanceInfo {
  ageroLink: string;
  hasWebLink: boolean;
  reasonCodeDisplay: string;
  timeSubmitted: Date;
  roadsideAssistanceId: number;
  ageroStatus: string;
  firstName: string;
  lastName: string;
  vin: string;
}
export interface roadsideAssistanceHistoryInfo {
  ageroLink: string;
  hasWebLink: boolean;
  data: any;
  reasonCodeDisplay: string;
  timeSubmitted: Date;
  roadsideAssistanceId: number;
  ageroStatus: string;
  firstName: string;
  lastName: string;
  vin: string;
}
export interface roadsideAssistanceInfoList {
  errorCode: string;
  data: roadsideAssistanceInfo[];
}

export interface roadsideAssistanceHistoryInfoList {
  errorCode: string;
  data: roadsideAssistanceHistoryInfo[];
}

export interface RsaRequestInfo {
  roadsideAssistanceId: string;
  reasonCode: string;
  comment: string;
  firstName: string;
  middleInitial: string;
  lastName: string;
  phone: string;
  lat: number;
  lng: number;
  address1: string;
  address2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  notificationPreferenceCode: string;
  notificationEmail: string;
  notificationSmsPhone: string;
  notificationVoicePhone: string;
}

export const roadsideAssistanceEndpoint: (builder: MSAEndpointBuilder) => {
  roadsideAssistance: MSAQueryDefinition<
    undefined,
    NormalResult<roadsideAssistanceInfoList>
  >;
  roadsideAssistanceDetail: MSAQueryDefinition<
    number,
    NormalResult<roadsideAssistanceHistoryInfoList>
  >;
  roadsideAssistanceRequest: MSAMutationDefinition<RsaRequestInfo, MSASuccess>;
} = builder => ({
  roadsideAssistance: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'roadsideAssistance.json',
      method: 'GET',
      params: parameters,
    }),
  }),
  roadsideAssistanceDetail: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: id => ({
      url: `roadsideAssistanceStatusHistory/${id}.json`,
      method: 'GET',
    }),
  }),
  roadsideAssistanceRequest: builder.mutation({
    extraOptions: {
      requires: ['session', 'timestamp'],
      suppressConnectionNotice: true,
    },
    query: parameters => ({
      url: 'roadsideAssistanceRequest.json',
      method: 'POST',
      params: parameters,
    }),
  }),
});

export const roadsideAssistanceApi = baseApi.injectEndpoints({
  endpoints: roadsideAssistanceEndpoint,
});
export const {
  useRoadsideAssistanceQuery,
  useRoadsideAssistanceDetailQuery,
  useRoadsideAssistanceRequestMutation,
} = roadsideAssistanceApi;
