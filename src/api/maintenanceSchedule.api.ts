// Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/MaintenanceScheduleController.java

import {
  MSAMutationDefinition,
  MSAEndpointBuilder,
  MSAQueryDefinition,
  baseApi,
} from '../api';
import {
  MaintenanceSchedule,
  NormalResult,
  VehicleInfoRequest,
} from '../../@types';

/**
 * Key value map returned by Java.
 *
 * Not a class; treat all as optional.
 **/
export interface MaintenanceScheduleMap {
  currentScheduleType: string; // tag?
  editMileage?: boolean;
  editSeverity?: true;
  getSeverityErrorCode?: number;
  isDealerCareConnect?: boolean;
  isServiceDue?: true;
  apiNextServiceError?: string;
  /** NOTE: *maintenance* is misspelt in payload */
  maintenaceScheduleList?: MaintenanceSchedule[];
  mileage?: string;
  normalScheduleList?: MaintenanceSchedule[];
  severeScheduleList: MaintenanceSchedule[];
}

export const maintenanceScheduleEndpoints: (builder: MSAEndpointBuilder) => {
  maintenanceSchedule: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<MaintenanceScheduleMap>
  >;
  maintenanceScheduleIntervals: MSAQueryDefinition<
    undefined,
    NormalResult<number[]>
  >;
  changePlanSeverity: MSAMutationDefinition<
    {scheduleType: string},
    NormalResult<null | 0 | 1 | 2>
  >;
} = builder => ({
  maintenanceSchedule: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'maintenanceSchedule.json',
      method: 'GET',
      params: parameters,
    }),
  }),
  maintenanceScheduleIntervals: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'maintenanceScheduleIntervals.json',
      method: 'GET',
      params: parameters,
    }),
  }),
  changePlanSeverity: builder.mutation({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    query: parameters => ({
      url: 'changePlanSeverity.json',
      method: 'GET',
      params: parameters,
    }),
  }),
});

export const maintenanceScheduleApi = baseApi.injectEndpoints({
  endpoints: maintenanceScheduleEndpoints,
});
export const {
  useMaintenanceScheduleQuery,
  useMaintenanceScheduleIntervalsQuery,
  useChangePlanSeverityMutation,
} = maintenanceScheduleApi;

export const getServiceDescription: (
  response: NormalResult<MaintenanceScheduleMap> | null | undefined,
) => string | null = response => {
  if (!response) return null;
  if (!response.data) return null;
  if (!response.data.maintenaceScheduleList) return null;
  if (response.data.maintenaceScheduleList.length == 0) return null;
  return response.data.maintenaceScheduleList[0].serviceDescription;
};
