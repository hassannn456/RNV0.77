// cSpell:ignore AHBL, blindspot, BSDRCT, EPAS, HEVCM, PANPM, passairbag, pedairbag, PWAAADWWAP, SRSP, TUIRWAOC
// Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/VehicleController.java

import {
  MSAMutationDefinition,
  MSAEndpointBuilder,
  MSAQueryDefinition,
  baseApi,
} from '../api';
import {store} from '../store';
import {
  ClientSessionVehicle,
  NormalResult,
  SasAgreementProfile,
  ValetStatus,
  VehicleHealthMap,
  VehicleInfoRequest,
  VehicleRecallInfo,
  VehicleStatus,
} from '../../@types';
import {getCurrentVehicle} from '../features/auth/sessionSlice';
import {MgaNavigationFunction, navigationRef} from '../Controller';
import {trackError} from '../components/useTracking';

/**
 * Key value map returned by Java.
 **/
export interface VehicleInfoMap {
  tradeInValue: null | string;
  vehicle: ClientSessionVehicle;
}

/**
 * Key value map returned by Java.
 **/
export interface RecallMap {
  lastUpdatedDate: number;
  recalls: VehicleRecallInfo[];
}

export const vehicleEndpoints: (builder: MSAEndpointBuilder) => {
  vehicleInfo: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<VehicleInfoMap>
  >;
  isSiebelProfileExists: MSAQueryDefinition<undefined, NormalResult<boolean>>;
  sasInfo: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<SasAgreementProfile>
  >;
  vehicleHealth: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<VehicleHealthMap>
  >;
  vehicleHealthWithReportPeriod: MSAQueryDefinition<
    {dateRangeSelectorControl: string},
    NormalResult<VehicleHealthMap>
  >;
  vehicleStatus: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<VehicleStatus>
  >;
  recalls: MSAQueryDefinition<VehicleInfoRequest, NormalResult<RecallMap>>;
  fetchVehicles: MSAQueryDefinition<
    undefined,
    NormalResult<ClientSessionVehicle[]>
  >;
  updateVehicle: MSAMutationDefinition<
    VehicleInfoRequest,
    NormalResult<ClientSessionVehicle>
  >;
  addVehicle: MSAMutationDefinition<VehicleInfoRequest, NormalResult<string>>;
  vinVerify: MSAQueryDefinition<{vin: string}, boolean>;
  updateApiMileage: MSAMutationDefinition<
    {mileage: number},
    NormalResult<null>
  >;
  getApiEstimatedMileage: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<ClientSessionVehicle>
  >;
  vehicleValetStatus: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<ValetStatus>
  >;
} = builder => ({
  vehicleInfo: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'vehicleInfo.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    // Grabbing response at transform step to report to redux
    // Needed here instead of api.ts
    // Because dataName is null instead of 'vehicle'

    transformResponse: (response: NormalResult<VehicleInfoMap>) => {
      if (response.data) {
        store.dispatch({
          type: 'session/updateVehicle',
          payload: response.data.vehicle,
        });
      }
      return response;
    },
  }),
  isSiebelProfileExists: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'isSiebelProfileExists.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
      suppressConnectionNotice: true,
    },
  }),
  sasInfo: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'sasInfo.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  vehicleHealth: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'vehicleHealth.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  vehicleHealthWithReportPeriod: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'vehicleHealth.json',
      method: 'POST',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  vehicleStatus: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'vehicleStatus.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  recalls: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'recalls.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  fetchVehicles: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'fetchVehicles.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  updateVehicle: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: 'updateVehicle.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
      suppressConnectionNotice: true,
    },
  }),
  addVehicle: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: 'addVehicle.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
      suppressConnectionNotice: true,
    },
  }),
  vinVerify: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'vinVerify.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
  }),
  updateApiMileage: builder.mutation({
    query: parameters => ({
      params: parameters,
      url: 'updateApiMileage.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  getApiEstimatedMileage: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'getApiEstimatedMileage.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  vehicleValetStatus: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'vehicle/valet/status.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
});

export const vehicleApi = baseApi.injectEndpoints({
  endpoints: vehicleEndpoints,
});
export const {
  useVehicleInfoQuery,
  useIsSiebelProfileExistsQuery,
  useSasInfoQuery,
  useVehicleHealthQuery,
  useVehicleHealthWithReportPeriodQuery,
  useVehicleStatusQuery,
  useRecallsQuery,
  useFetchVehiclesQuery,
  useUpdateVehicleMutation,
  useAddVehicleMutation,
  useVinVerifyQuery,
  useUpdateApiMileageMutation,
  useGetApiEstimatedMileageQuery,
  useVehicleValetStatusQuery,
} = vehicleApi;

const isActiveRecall = (recall: VehicleRecallInfo): boolean => {
  const currentDate = new Date();
  const custNotificationDate = new Date(recall.custNotificationDate);
  // TODO:UA:20230323: Why add 3 days to notice?
  custNotificationDate.setDate(custNotificationDate.getDate() + 3);
  return currentDate >= custNotificationDate;
};

const isOpenRecall = (recall: VehicleRecallInfo): boolean => {
  // TODO:UA:20230316: Cordova app calls .toUpperCase() here. Why?
  return recall.recallStatus == 'Open';
};

export const getFutureRecalls = (
  recallMap: RecallMap | null | undefined,
): VehicleRecallInfo[] => {
  if (!recallMap?.recalls) {
    return [];
  }
  return recallMap.recalls.filter(
    recall => isOpenRecall(recall) && !isActiveRecall(recall),
  );
};

export const getPresentRecalls = (
  recallMap: RecallMap | null | undefined,
): VehicleRecallInfo[] => {
  if (!recallMap?.recalls) {
    return [];
  }
  return recallMap.recalls.filter(
    recall => isOpenRecall(recall) && isActiveRecall(recall),
  );
};

export const getPastRecalls = (
  recallMap: RecallMap | null | undefined,
): VehicleRecallInfo[] => {
  if (!recallMap?.recalls) {
    return [];
  }
  return recallMap.recalls.filter(recall => !isOpenRecall(recall));
};

export const mileagePromptIfNeeded: MgaNavigationFunction = (...args) => {
  const vehicle = getCurrentVehicle();
  if (vehicle && vehicle.needMileagePrompt) {
    const request = vehicleApi.endpoints.getApiEstimatedMileage.initiate({
      vin: vehicle.vin,
    });
    store
      .dispatch(request)
      .unwrap()
      .then(response => {
        if (response.success) {
          const vehicleMileage = response.data?.vehicleMileage;
          if (vehicleMileage != null) {
            navigationRef.navigate('AcceptMileage', {
              vehicleMileage,
              screen: args[0],
            });
          } else {
            navigationRef.navigate(...args);
          }
        } else {
          navigationRef.navigate(...args);
        }
      })
      .catch(trackError('vehicle.api.ts'));
    return true;
  } else {
    return false;
  }
};
