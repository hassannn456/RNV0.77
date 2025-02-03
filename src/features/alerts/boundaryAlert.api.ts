import {cNoVehicle} from '../../api/account.api';
import {
  MSAEndpointBuilder,
  MSAMutationDefinition,
  MSAQueryDefinition,
  MSASuccess,
  baseApi,
} from '../../api';
import {store} from '../../store';
import {LngLat} from '../../components';
import {currentVehicleReducer} from '../auth/sessionSlice';
import {
  RemoteCommand,
  RemoteServiceResponse,
  executeRemoteCommand,
} from '../remoteService/remoteService.api';

export interface GeoFence {
  exceedMinimumSeconds: string;
  /** Enum for type of fence:
   * - 0 = enterArea
   * - 1 = exitArea */
  fenceType: '0' | '1';
  center: LngLat;
  radius: number;
  /** Enum for shape of fence:
   * - 0 = circle
   * - 1 = rectangle
   * - 2 = polygon (deprecated) */
  shapeType: 0 | 1 | 2;
  /** Used in rectangle. Null otherwise. */
  topLeft: LngLat | null;
  /** Used in rectangle. Null otherwise. */
  bottomRight: LngLat | null;
  name: string;
  active: boolean;
}

export interface GeoFenceFetchResponse {
  success: true;
  data: GeoFence[];
}

export const g2GeoFenceAlert: RemoteCommand = {
  name: 'boundaryAlert',
  type: 'geoFence',
  url: 'service/g2/geoFence/execute.json',
  statusUrl: 'service/g2/geoFence/status.json',
};

export const g2GeoFenceDeactivate: RemoteCommand = {
  name: 'boundaryAlertDeactivate',
  type: 'geoFence',
  url: 'service/g2/geoFence/execute.json',
  statusUrl: 'service/g2/geoFence/status.json',
};

export const geoFenceEndpoints: (builder: MSAEndpointBuilder) => {
  geoFenceFetch: MSAQueryDefinition<undefined, GeoFenceFetchResponse>;
  geoFenceSave: MSAMutationDefinition<GeoFence[], MSASuccess>;
} = builder => ({
  geoFenceFetch: builder.query({
    query: parameters => ({
      params: parameters,
      url: 'service/g2/geoFence/fetch.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    providesTags: ['geoFence'],
    extraOptions: {
      demoFetchTag: 'geoFence',
      requires: ['session', 'timestamp'],
    },
    transformResponse: (response: GeoFenceFetchResponse) => {
      if (response.success && !response.data) {
        // Convert null to []
        return {...response, data: []};
      } else if (typeof response.data == 'string') {
        // Parse JSON
        const parsed = JSON.parse(response.data) as GeoFence[];
        return {success: true, data: parsed};
      } else {
        return response;
      }
    },
  }),
  geoFenceSave: builder.mutation({
    invalidatesTags: ['geoFence'],
    query: parameters => ({
      body: parameters,
      url: 'service/g2/geoFence/save.json',
      method: 'POST',
    }),
    extraOptions: {
      demoSaveTag: 'geoFence',
      requires: ['session'],
    },
  }),
});

export const geoFenceApi = baseApi.injectEndpoints({
  endpoints: geoFenceEndpoints,
});
export const {useGeoFenceFetchQuery, useGeoFenceSaveMutation} = geoFenceApi;

export const geoFenceSaveAndSend = async (
  alerts: GeoFence[],
  index?: number,
  target?: GeoFence,
): Promise<RemoteServiceResponse> => {
  const vin = currentVehicleReducer(store.getState())?.vin;
  if (!vin) {
    return {success: false, errorCode: cNoVehicle};
  }
  // Only send to vehicle if alert is newly active or if deleted alert was the active one
  if (target || (index != undefined && alerts[index].active)) {
    const parameters = target?.active
      ? {...target, pin: '', vin: vin}
      : {pin: '', vin: vin};
    const send = target?.active
      ? await executeRemoteCommand(g2GeoFenceAlert, parameters, {
          requires: ['PIN', 'session', 'timestamp'],
        })
      : await executeRemoteCommand(g2GeoFenceDeactivate, parameters, {
          requires: ['PIN', 'session', 'timestamp'],
        });
    if (!send.data?.success) {
      return send;
    }
  }
  // On Update: splice in new alert, deactivating others if active
  // On Insert: add alert to end of array
  // On Delete: splice out old alert
  const newAlerts = target
    ? alerts
        .map((alert, i) => {
          // Update / deactivate
          if (i == index) {
            return target;
          } else {
            return Object.assign({}, alert, {active: false});
          }
        })
        .concat(index == undefined ? [target] : []) // Insert
    : alerts.filter((_, i) => index != i); // Delete
  const save = await store.dispatch(
    geoFenceApi.endpoints.geoFenceSave.initiate(newAlerts),
  );
  return save.data as RemoteServiceResponse;
};

export const geoFenceEquals = (x: GeoFence, y: GeoFence): boolean => {
  if (x.center.longitude != y.center.longitude) return false;
  if (x.center.latitude != y.center.latitude) return false;
  if (x.radius != y.radius) return false;
  if (x.shapeType != y.shapeType) return false;
  if (x.shapeType == 1) {
    if (x.topLeft?.latitude != y.topLeft?.latitude) return false;
    if (x.topLeft?.longitude != y.topLeft?.longitude) return false;
    if (x.bottomRight?.latitude != y.bottomRight?.latitude) return false;
    if (x.bottomRight?.longitude != y.bottomRight?.longitude) return false;
  }
  return true;
};
