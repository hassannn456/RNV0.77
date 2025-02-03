// cSpell:ignore Tripdata
// Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/DrivingJournalController.java

import {
  MSAContentTypeJSON,
  MSAEndpointBuilder,
  MSAMutationDefinition,
  MSAQueryDefinition,
  baseApi,
} from '../api';
import {
  Journal,
  JournalEntry,
  NormalResult,
  TripDetail,
  TripDetailRequest,
  TripInterval,
  TripLogCommandExecute,
  TripLogPerDayDetail,
  TripLogSettingsResponse,
  VehicleInfoRequest,
} from '../../@types';
import i18n from '../i18n';
import {promptAlert, successNotice} from '../components';
import {store} from '../store';
import {formatFullDate} from '../utils/dates';
import {getCurrentVehicle} from '../features/auth/sessionSlice';
import {alertNotInDemo} from '../features/demo/demo.slice';

export const drivingJournalEndpoints: (builder: MSAEndpointBuilder) => {
  // NOTE: Current API doesn't require a vehicle but returns vehicle specific info
  // Including VIN for caching tag and future stateless implementation
  retrieveTrips: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<TripInterval[]>
  >;
  retrieveTripdata: MSAQueryDefinition<
    TripDetailRequest,
    NormalResult<TripLogPerDayDetail>
  >;
  positionData: MSAQueryDefinition<
    Partial<JournalEntry>,
    NormalResult<JournalEntry>
  >;
  deleteTripLog: MSAMutationDefinition<
    Partial<JournalEntry>,
    NormalResult<null>
  >;
  createJournal: MSAMutationDefinition<Partial<Journal>, NormalResult<Journal>>;
  updateJournal: MSAMutationDefinition<Partial<Journal>, NormalResult<Journal>>;
  retrieveJournal: MSAQueryDefinition<Journal, NormalResult<Journal>>;
  retrieveAllJournals: MSAQueryDefinition<
    undefined,
    NormalResult<string | Journal[]>
  >;
  deleteJournal: MSAMutationDefinition<Partial<Journal>, NormalResult<string>>;
  deleteAllJournals: MSAMutationDefinition<undefined, NormalResult<string>>;
  addJournalEntriesToJournal: MSAMutationDefinition<
    Partial<JournalEntry>[],
    NormalResult<null>
  >;
  updateJournalEntry: MSAMutationDefinition<
    Partial<JournalEntry>,
    NormalResult<null>
  >;
  deleteJournalEntriesFromJournal: MSAMutationDefinition<
    Partial<JournalEntry>[],
    NormalResult<null>
  >;
  getExpirationDate: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<TripLogSettingsResponse>
  >;
  saveExpirationDate: MSAMutationDefinition<
    TripLogCommandExecute,
    NormalResult<null>
  >;
} = builder => ({
  retrieveTrips: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'display/trips.json',
      method: 'GET',
      params: parameters,
    }),
    transformResponse: (response: NormalResult<TripInterval[]>) => {
      if (response.data) {
        const data = response.data.map(interval => {
          // MGA-1748: Backend saves last second of date as {next day}T04:59:59.999+0000
          // Should be T04:59:59.999+0500
          const endDate = interval.tripStopDate.split(':');
          const seconds =
            endDate?.length > 0 ? endDate[endDate.length - 1] : endDate[0];
          if (seconds.includes('59.999+0000')) {
            return {
              ...interval,
              tripStopDate: interval.tripStopDate.replace(
                '59.999+0000',
                '59.999+0500',
              ),
            };
          } else {
            return interval;
          }
        });
        return {...response, data};
      } else {
        return response;
      }
    },
  }),
  retrieveTripdata: builder.query({
    extraOptions: {
      contentType: MSAContentTypeJSON,
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'retrieve/triplogData.json',
      method: 'POST',
      body: parameters,
    }),
  }),
  positionData: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'retrieve/positionData.json',
      method: 'POST',
      body: parameters,
    }),
  }),
  deleteTripLog: builder.mutation({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    query: parameters => ({
      url: 'delete/triplog.json',
      method: 'POST',
      body: parameters,
    }),
  }),
  createJournal: builder.mutation({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    query: parameters => ({
      url: 'create/journal.json',
      method: 'POST',
      body: parameters,
    }),
  }),
  updateJournal: builder.mutation({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    query: parameters => ({
      url: 'update/journal.json',
      method: 'POST',
      body: parameters,
    }),
  }),
  retrieveJournal: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'retrieve/journal.json',
      method: 'POST',
      params: parameters,
    }),
  }),
  retrieveAllJournals: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'retrieveAll/journals.json',
      method: 'GET',
      params: parameters,
    }),
  }),
  deleteJournal: builder.mutation({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    query: parameters => ({
      url: 'delete/journal.json',
      method: 'POST',
      body: parameters,
    }),
  }),
  deleteAllJournals: builder.mutation({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    query: parameters => ({
      url: 'deleteAll/journals.json',
      method: 'GET',
      params: parameters,
    }),
  }),
  addJournalEntriesToJournal: builder.mutation({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    query: parameters => ({
      url: 'add/journalEntries.json',
      method: 'POST',
      body: parameters,
    }),
  }),
  updateJournalEntry: builder.mutation({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    query: parameters => ({
      url: 'update/journalEntry.json',
      method: 'POST',
      body: parameters,
    }),
  }),
  deleteJournalEntriesFromJournal: builder.mutation({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    query: parameters => ({
      url: 'delete/journalEntries.json',
      method: 'POST',
      body: parameters,
    }),
  }),
  getExpirationDate: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: 'retrieve/tripExpirationDate.json',
      method: 'GET',
      params: parameters,
    }),
  }),
  saveExpirationDate: builder.mutation({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    query: parameters => ({
      url: 'save/tripExpirationDate.json',
      method: 'POST',
      body: parameters,
    }),
  }),
});

export const drivingJournalApi = baseApi.injectEndpoints({
  endpoints: drivingJournalEndpoints,
});
export const {
  useRetrieveTripsQuery,
  useRetrieveTripdataQuery,
  usePositionDataQuery,
  useDeleteTripLogMutation,
  useCreateJournalMutation,
  useUpdateJournalMutation,
  useRetrieveAllJournalsQuery,
  useDeleteJournalMutation,
  useDeleteAllJournalsMutation,
  useAddJournalEntriesToJournalMutation,
  useUpdateJournalEntryMutation,
  useDeleteJournalEntriesFromJournalMutation,
  useGetExpirationDateQuery,
  useSaveExpirationDateMutation,
} = drivingJournalApi;

/** Backend requires strings in a specific format */
export const tripRequestFromTripInterval: (
  trip: TripInterval,
) => TripDetailRequest = trip => {
  const formatDateString = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const hour = date.getUTCHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${month}/${day}/${year} ${hour}:${minute}:${seconds}`;
  };
  return {
    tripStartDate: formatDateString(trip.tripStartDate),
    tripStopDate: formatDateString(trip.tripStopDate),
  };
};

/** Prompt confirmation, delete journal and refresh cache after. */
export const deleteJournal = async (
  journal: Journal,
  options?: {message?: string},
): Promise<NormalResult<string>> => {
  if (store.getState().demo) {
    await alertNotInDemo();
    return {
      success: false,
      data: null,
      dataName: null,
      errorCode: 'notInDemo',
    };
  }
  const {t} = i18n;
  const title = t('tripTrackerLanding:deleteJournalTitle');
  const message =
    options?.message ??
    (t('tripTrackerLanding:confirmDeleteJournal', journal as any) as string);
  const yes: string = t('common:delete');
  const no: string = t('common:cancel');
  const confirm = await promptAlert(title, message, [
    {title: yes, type: 'primary'},
    {title: no, type: 'secondary'},
  ]);
  if (confirm != yes) {
    return {
      success: false,
      data: null,
      dataName: null,
      errorCode: 'cancelled',
    };
  }
  const request = drivingJournalApi.endpoints.deleteJournal.initiate({
    journalId: journal.journalId,
  });
  const response = await store.dispatch(request).unwrap();
  const i18nOptions = {...journal};
  const _ok = await promptAlert(
    response.success ? t('common:success') : t('common:error'),
    response.success
      ? t('tripTrackerLanding:deleteJournalSuccessMsg', i18nOptions)
      : response.data ??
          t('tripTrackerLanding:deleteJournalErrorMsg', i18nOptions),
  );
  if (response.success) {
    const refresh =
      drivingJournalApi.endpoints.retrieveAllJournals.initiate(undefined);
    void store.dispatch(refresh).unwrap();
  }
  return response;
};

/**
 * Prompt confirmation, delete trip log and refresh cache after.
 *
 * @param tripLog - Trip Log to delete
 * @param tripDataRequest - Object defining trip containing trip log (for refetch)
 **/
export const deleteTripLog = async (
  tripLog: TripDetail,
  tripDataRequest?: TripDetailRequest,
): Promise<NormalResult<null>> => {
  if (store.getState().demo) {
    await alertNotInDemo();
    return {
      success: false,
      data: null,
      dataName: null,
      errorCode: 'notInDemo',
    };
  }
  const {t} = i18n;
  const date = formatFullDate(tripLog.startTime);
  const title = t('tripLog:deleteTripLog');
  const message: string = t('tripLog:deleteTripLogMsg', {date});
  const yes: string = t('common:delete');
  const no: string = t('common:cancel');
  const confirm = await promptAlert(title, message, [
    {title: yes, type: 'primary'},
    {title: no, type: 'link'},
  ]);
  if (confirm != yes) {
    return {
      success: false,
      data: null,
      dataName: null,
      errorCode: 'cancelled',
    };
  }
  const request = drivingJournalApi.endpoints.deleteTripLog.initiate({
    tripLogDataId: tripLog.tripLogDataId,
  });
  const response = await store.dispatch(request).unwrap();
  if (response.success) {
    // Trigger data reload
    const vehicle = getCurrentVehicle();
    const tripRefreshRequest =
      drivingJournalApi.endpoints.retrieveTrips.initiate({
        vin: vehicle?.vin ?? '',
      });
    void store.dispatch(tripRefreshRequest).unwrap();
    if (tripDataRequest) {
      const tripDataRefreshRequest =
        drivingJournalApi.endpoints.retrieveTripdata.initiate(tripDataRequest);
      void store.dispatch(tripDataRefreshRequest).unwrap();
    }
    successNotice({
      title: t('common:success'),
      subtitle: t('tripTrackerLanding:deleteTripLogSuccess'),
    });
  } else {
    void promptAlert(
      t('tripTrackerLanding:deleteTripLogFailure'),
      t('tripTrackerLanding:deleteTripLog'),
    );
  }
  return response;
};

/** Prompt confirmation, delete entry from journal. */
export const deleteEntryFromJournal = async (
  journalEntry: JournalEntry,
  journal: Journal,
): Promise<NormalResult<null>> => {
  if (store.getState().demo) {
    await alertNotInDemo();
    return {
      success: false,
      data: null,
      dataName: null,
      errorCode: 'notInDemo',
    };
  }
  const {t} = i18n;
  const title = t('tripTrackerLanding:removeJournalTitle');
  const message = t('tripTrackerLanding:confirmJournalEntryDelete', {
    ...journal,
  });
  const yes: string = t('common:delete');
  const no: string = t('common:cancel');
  const confirm = await promptAlert(title, message, [
    {title: yes, type: 'primary'},
    {title: no, type: 'secondary'},
  ]);
  if (confirm != yes) {
    return {
      success: false,
      data: null,
      dataName: null,
      errorCode: 'cancelled',
    };
  }
  const request =
    drivingJournalApi.endpoints.deleteJournalEntriesFromJournal.initiate([
      {
        journalId: journalEntry.journalId,
        journalEntryId: journalEntry.journalEntryId,
      },
    ]);
  const response = await store.dispatch(request).unwrap();
  const _ok = await promptAlert(
    response.success ? t('common:success') : t('common:error'),
    response.success
      ? t('tripTrackerLanding:deleteJournalEntrySuccessMsg')
      : response.data ?? t('tripTrackerLanding:deleteJournalEntryErrorMsg'),
  );
  if (response.success) {
    const refresh =
      drivingJournalApi.endpoints.retrieveAllJournals.initiate(undefined);
    void store.dispatch(refresh).unwrap();
  }
  return response;
};

const nullJournalResult = {journal: null, journalEntries: []};
/**
 * Retrieve a journal and its entries sorted for display.
 *
 * Use this over useRetrieveJournalQuery; useRetrieveAllJournalsQuery has cache eviction when a journal is changed.
 **/
export const useJournalQuery = (
  journalId: number,
): {
  journal: Journal | null;
  journalEntries: JournalEntry[];
} => {
  const {data} = useRetrieveAllJournalsQuery(undefined);
  if (!data || !data.data || typeof data.data == 'string')
    return nullJournalResult;
  const journal = data.data.find(j => j.journalId == journalId);
  if (!journal) return nullJournalResult;
  const journalEntries = (() => {
    const result = [...(journal?.journalEntries ?? [])];
    result.sort((x, y) => (x.startTime < y.startTime ? -1 : 1));
    return result;
  })();
  return {journal, journalEntries};
};
