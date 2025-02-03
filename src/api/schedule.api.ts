// Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/ScheduleController.java
import {
  AppointmentResponse,
  AvailableAppointment,
  AvailableAppointmentsMessage,
  AvailableServicesMessage,
  NormalResult,
  RecallInfo,
  ScheduleForm,
  ScheduleMessage,
  WarningLightsResponse,
} from '../../@types';
import {
  MSAMutationDefinition,
  MSAEndpointBuilder,
  MSAQueryDefinition,
  baseApi,
} from '../api';
import {store} from '../store';
import {dateByAddingWeekdays} from '../utils/dates';

/** Invalid VIN or dealer code not recognized by autoloop etc. */
export const ScheduleMessageNoPattern = 'NOPATTERN';
/** VIN that's not considered owned by autoloop, or hasn't been to a dealer. */
export const ScheduleMessageNoVIN = 'NOVIN';

export const ScheduleMessageNoVINSuccess = 0;
export const ScheduleMessageCodeBug = 1;
export const ScheduleMessageCodeInvalid = 2;
export const ScheduleMessageCodeCircuitBreaker = 3;

export const scheduleEndpoints: (builder: MSAEndpointBuilder) => {
  dealerServices: MSAQueryDefinition<
    ScheduleForm,
    NormalResult<AvailableServicesMessage>
  >;
  appointmentFinder: MSAQueryDefinition<
    ScheduleForm,
    NormalResult<AvailableAppointmentsMessage>
  >;
  confirmAppointment: MSAQueryDefinition<
    ScheduleForm,
    NormalResult<AppointmentResponse>
  >;
  appointmentByVin: MSAQueryDefinition<
    ScheduleForm,
    NormalResult<AppointmentResponse[]>
  >;
  cancelAppointment: MSAMutationDefinition<
    ScheduleForm,
    NormalResult<ScheduleMessage>
  >;
  recallsByVIN: MSAQueryDefinition<ScheduleForm, NormalResult<RecallInfo>>;
  warningLights: MSAQueryDefinition<
    ScheduleForm,
    NormalResult<WarningLightsResponse>
  >;
} = builder => ({
  dealerServices: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'dealerServices.json',
      method: 'GET',
      params: parameters,
    }),
  }),
  appointmentFinder: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'appointmentFinder.json',
      method: 'GET',
      params: parameters,
    }),
    transformResponse: (
      response: NormalResult<AvailableAppointmentsMessage>,
    ) => {
      if (store.getState().demo) {
        // Generate fake data for time slots
        const days = 30;
        const times = [10, 11, 13, 15];
        const slots = [...Array(days * times.length).keys()];
        const availableAppointments: AvailableAppointment[] = slots.map(i => {
          const d = Math.floor(i / times.length) + 1;
          const t = times[i % times.length];
          const date = dateByAddingWeekdays(new Date(), d);
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, '0');
          const day = date.getUTCDate().toString().padStart(2, '0');
          const localHour = t.toString().padStart(2, '0');
          const utcHour = (t + 5).toString().padStart(2, '0');
          const minute = '00';
          const seconds = '00';
          return {
            appointmentDateTimeLocal: `${year}-${month}-${day}T${localHour}:${minute}:${seconds}-05:00`,
            appointmentDateTimeUTC: `${year}-${month}-${day}T${utcHour}:${minute}:${seconds}`,
            appointmentDateTimeLocalAsCalendar: date.getTime(),
            durationMinutes: 30,
          };
        });
        return {
          ...response,
          data: {...response.data, availableAppointments},
        };
      } else {
        return response;
      }
    },
  }),
  confirmAppointment: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'confirmAppointment.json',
      method: 'GET',
      params: parameters,
    }),
  }),
  appointmentByVin: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'appointmentByVin.json',
      method: 'GET',
      params: parameters,
    }),
  }),
  cancelAppointment: builder.mutation({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    query: parameters => ({
      url: 'cancelAppointment.json',
      method: 'POST',
      params: parameters,
    }),
  }),
  recallsByVIN: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'recallsByVin.json',
      method: 'GET',
      params: parameters,
    }),
  }),
  warningLights: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'warninglights.json',
      method: 'GET',
      params: parameters,
    }),
  }),
});

export const schedulerApi = baseApi.injectEndpoints({
  endpoints: scheduleEndpoints,
});
export const {
  useDealerServicesQuery,
  useAppointmentFinderQuery,
  useRecallsByVINQuery,
  useWarningLightsQuery,
  useAppointmentByVinQuery,
} = schedulerApi;
