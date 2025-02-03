// cSpell:ignore pois
import {
  NormalResult,
  POIRequest,
  POIResponse,
  VehicleInfoRequest,
  CreateTripParams,
  CreateTripResponse,
  UpdateTripParams,
  RetrieveAllTripsResponse,
  DeleteTripParams,
  DeleteTripResponse,
  DeletePOIRequest,
} from '../../@types';
import {
  MSAEndpointBuilder,
  MSAQueryDefinition,
  MSAMutationDefinition,
  baseApi,
} from '../api';
import {
  RemoteServiceRequestBase,
  RemoteServiceResponse,
} from '../features/remoteService/remoteService.api';
import {getCurrentVehicle} from '../features/auth/sessionSlice';
import {cNoVehicle} from './account.api';
import {
  executeRemoteCommand,
  RemoteCommand,
} from '../features/remoteService/remoteService.api';

const sendPOI: RemoteCommand = {
  name: 'trip',
  type: 'other',
  url: '/service/g2/sendPoi/execute.json',
  statusUrl: '/service/g2/sendPoi/status.json',
};

export const tripEndpoints: (builder: MSAEndpointBuilder) => {
  createFavoritePOI: MSAQueryDefinition<POIRequest, NormalResult<POIResponse>>;
  retrieveFavoritePOIs: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<POIResponse[]>
  >;
  saveHomeOrWorkPOI: MSAQueryDefinition<POIRequest, NormalResult<POIResponse>>;
  updatePOI: MSAQueryDefinition<POIRequest, NormalResult<POIResponse>>;
  deletePOI: MSAMutationDefinition<DeletePOIRequest, NormalResult<POIResponse>>;
  deleteAllFavoritePOIs: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<POIResponse | POIResponse[]>
  >;
  retrieveAllTrips: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<RetrieveAllTripsResponse[]>
  >;
  createTrip: MSAQueryDefinition<
    CreateTripParams,
    NormalResult<CreateTripResponse>
  >;
  updateTrip: MSAQueryDefinition<
    UpdateTripParams,
    NormalResult<CreateTripResponse>
  >;
  deleteTrip: MSAQueryDefinition<
    DeleteTripParams,
    NormalResult<DeleteTripResponse>
  >;
  deleteAllTrips: MSAQueryDefinition<
    VehicleInfoRequest,
    NormalResult<POIResponse>
  >;
} = builder => ({
  createFavoritePOI: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: '/create/poi.json',
      method: 'POST',
      body: parameters,
    }),
  }),
  retrieveFavoritePOIs: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: () => ({
      url: '/retrieve/favorite/pois.json',
      method: 'GET',
    }),
  }),
  saveHomeOrWorkPOI: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: '/save/work-home/poi.json',
      method: 'POST',
      body: parameters,
    }),
  }),
  updatePOI: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: '/update/poi.json',
      method: 'POST',
      body: parameters,
    }),
  }),
  deletePOI: builder.mutation({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    query: parameters => ({
      url: '/delete/favorite/poi.json',
      method: 'GET',
      params: parameters,
    }),
  }),
  deleteAllFavoritePOIs: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: _parameters => ({
      url: '/deleteAll/favorite/pois.json',
      method: 'GET',
    }),
  }),
  retrieveAllTrips: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    providesTags: ['trips'],
    query: _parameters => ({
      url: '/retrieve/trips.json',
      method: 'GET',
    }),
  }),
  createTrip: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: '/create/trip.json',
      invalidateTags: ['trips'],
      // eslint-disable-next-line
      method: 'POST',
      body: parameters,
    }),
  }),
  updateTrip: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    invalidatesTags: ['trips'],
    query: parameters => ({
      url: '/update/trip.json',
      method: 'POST',
      body: parameters,
    }),
  }),
  deleteTrip: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    invalidatesTags: ['trips'],
    query: parameters => ({
      url: '/delete/trip.json',
      method: 'GET',
      params: parameters,
    }),
  }),
  deleteAllTrips: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: '/deleteAll/trips.json',
      method: 'GET',
      params: parameters,
    }),
  }),
});

export const tripsApi = baseApi.injectEndpoints({
  endpoints: tripEndpoints,
});

export interface RemoteSendPOIToVehicleRequest
  extends RemoteServiceRequestBase {
  pois: Array<POIRequest>;
}

export const sendPOIToVehicle = async (
  parameters: RemoteSendPOIToVehicleRequest,
): Promise<RemoteServiceResponse> => {
  const vehicle = getCurrentVehicle();
  if (!vehicle) {
    return {success: false, errorCode: cNoVehicle};
  }
  const request: RemoteSendPOIToVehicleRequest = {
    ...parameters,
    vin: parameters?.vin ?? vehicle.vin,
    pin: parameters?.pin ?? '',
  };
  return await executeRemoteCommand(sendPOI, request, {
    requires: ['PIN', 'session', 'timestamp'],
  });
};

export const {useRetrieveFavoritePOIsQuery, useRetrieveAllTripsQuery} =
  tripsApi;
