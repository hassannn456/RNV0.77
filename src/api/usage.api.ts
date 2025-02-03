// Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/UsageController.java

import {
  NormalResult,
  TeleServiceUsageIngest,
  UsageReportEventUser,
} from '../../@types';
import {baseApi, MSAEndpointBuilder, MSAQueryDefinition} from '../api';

export interface UsageReportParameters {
  /** Backend defaults to 0 if not passed. */
  dateRangeIndex?: number;
}

/**
 * Key value map returned by Java.
 *
 * Not a class; treat all as optional.
 **/
export interface ReportTimePeriod {
  monthsAgo: number;
  startDate: number;
  endDate: number;
}

/**
 * Key value map returned by Java.
 *
 * Not a class; treat all as optional.
 **/
export interface GeneratedUsageReport {
  'Boundary Alert'?: TeleServiceUsageIngest[];
  'Curfew Alert'?: TeleServiceUsageIngest[];
  'Remote Door Lock'?: TeleServiceUsageIngest[];
  'Remote Door Unlock'?: TeleServiceUsageIngest[];
  'Remote Climate Control Start'?: TeleServiceUsageIngest[];
  'Remote Climate Control Stop'?: TeleServiceUsageIngest[];
  'Remote Engine Start'?: TeleServiceUsageIngest[];
  'Remote Engine Stop'?: TeleServiceUsageIngest[];
  'Remote Horn and Lights'?: TeleServiceUsageIngest[];
  'Security Alarm Notification'?: TeleServiceUsageIngest[];
  'Speed Alert'?: TeleServiceUsageIngest[];
  'Trip Logs'?: TeleServiceUsageIngest[];
  'Valet Mode'?: TeleServiceUsageIngest[];
  'Vehicle Locate'?: TeleServiceUsageIngest[];
}

/**
 * Key value map returned by Java.
 *
 * Not a class; treat all as optional.
 **/
export interface UsageReportResponse {
  month: number;
  reportTimePeriods: ReportTimePeriod[];
  usageReport: GeneratedUsageReport;
}

export const usageReportEndpoints: (builder: MSAEndpointBuilder) => {
  usageReport: MSAQueryDefinition<
    UsageReportParameters,
    NormalResult<UsageReportResponse>
  >;
  usageReportEventUserList: MSAQueryDefinition<
    undefined,
    NormalResult<UsageReportEventUser[]>
  >;
} = builder => ({
  usageReport: builder.query({
    query: parameters => ({
      params: parameters,
      url: '/usageReport.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  usageReportEventUserList: builder.query({
    query: parameters => ({
      params: parameters,
      url: '/usageReport/users.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
});

export const usageApi = baseApi.injectEndpoints({
  endpoints: usageReportEndpoints,
});
export const {useUsageReportQuery, useUsageReportEventUserListQuery} = usageApi;
