// cSpell:ignore vehicleattributes
import {NormalResult} from '../../@types';
import {MSAEndpointBuilder, MSAQueryDefinition, baseApi} from '../api';
import {store} from '../store';
import {getCurrentVehicle} from '../features/auth/sessionSlice';

type VehicleUserAttributeItem = {
  attributeId: number;
  vehicleId: number;
  masterAttributeId: number;
  accountId: number;
  attributeValue: string | number;
  createDate: number;
  updateDate: number;
};

export type GetAttributesResponse = VehicleUserAttributeItem[];

export const userAttributesEndpoints: (builder: MSAEndpointBuilder) => {
  getAttributes: MSAQueryDefinition<
    undefined,
    NormalResult<GetAttributesResponse>
  >;
  getVehicleAccountAttributes: MSAQueryDefinition<
    {vehicleId: number},
    NormalResult<GetAttributesResponse>
  >;

  deleteVehicleAccountAttribute: MSAQueryDefinition<
    {masterAttributeId: number; vehicleId: number},
    NormalResult<GetAttributesResponse>
  >;

  putVehicleAccountAttributes: MSAQueryDefinition<
    {
      vehicleId: number;
      data: [
        {
          masterAttributeId: number;
          value?: string | undefined;
        },
      ];
    },
    NormalResult<GetAttributesResponse>
  >;
} = builder => ({
  getAttributes: builder.query({
    extraOptions: {
      requires: ['mysToken'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: '/micro/vehicleattributes/vehicleAccountAttributes',
      method: 'GET',
      params: parameters,
    }),
  }),

  getVehicleAccountAttributes: builder.query({
    extraOptions: {
      requires: ['mysToken'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: '/micro/vehicleattributes/vehicleAccountAttributes',
      method: 'POST',
      body: parameters,
    }),
  }),
  putVehicleAccountAttributes: builder.query({
    extraOptions: {
      requires: ['mysToken'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: '/micro/vehicleattributes/vehicleAccountAttributes',
      method: 'PUT',
      body: parameters,
    }),
  }),
  deleteVehicleAccountAttribute: builder.query({
    extraOptions: {
      requires: ['mysToken'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: '/micro/vehicleattributes/vehicleAccountAttributes',
      method: 'DELETE',
      body: parameters,
    }),
  }),
});

export const userAttributesApi = baseApi.injectEndpoints({
  endpoints: userAttributesEndpoints,
});
export const {
  useGetAttributesQuery,
  useLazyGetAttributesQuery,
  useGetVehicleAccountAttributesQuery,
  useLazyGetVehicleAccountAttributesQuery,
  useLazyPutVehicleAccountAttributesQuery,
  usePutVehicleAccountAttributesQuery,
} = userAttributesApi;

export const loadVehicleAccountAttributes = async (): Promise<
  NormalResult<GetAttributesResponse>
> => {
  // putting user attributes lookup into login
  const vehicle = getCurrentVehicle();
  const attributes = await store
    .dispatch(
      userAttributesApi.endpoints.getVehicleAccountAttributes.initiate({
        vehicleId: vehicle?.vehicleKey as number,
      }),
    )
    .unwrap();

  // TODO:AG:20240826 - eventually it will matter if this service fails.
  // on failure we should update store to reflect failure
  // so  UI can appropriately disable features depending on this data.

  return attributes;
};

// TODO:AG:20240832 generate type from API
export const VehicleUserAttributes = {
  'mga.communicationPreferences.firstTime': 1,
  'mga.device.osVersion': 2,
  'mga.device.appVersion': 3,
  'mga.account.wirelessCarPin': 4,
  'mga.account.tos.20240628': 5,
  'mga.account.emergencyContactPrompt': 7,
};

export type VehicleUserAttributeKey = keyof typeof VehicleUserAttributes;

export const getVehicleUserAttributeKeyById = (
  attributeId: number,
): VehicleUserAttributeKey | undefined => {
  return (
    Object.keys(VehicleUserAttributes) as Array<VehicleUserAttributeKey>
  ).find(key => VehicleUserAttributes[key] === attributeId);
};

export const updateVehicleAccountAttribute = async (
  attribute: VehicleUserAttributeKey,
  value: VehicleAttributePayloads[keyof VehicleAttributePayloads],
): Promise<NormalResult<GetAttributesResponse>> => {
  const vehicle = getCurrentVehicle();
  const response = await store
    .dispatch(
      userAttributesApi.endpoints.putVehicleAccountAttributes.initiate({
        vehicleId: vehicle?.vehicleKey as number,
        data: [
          {
            masterAttributeId: VehicleUserAttributes[attribute],
            value: value as string,
          },
        ],
      }),
    )
    .unwrap();

  if (response.success) {
    void store.dispatch(
      userAttributesApi.util.upsertQueryData(
        'getVehicleAccountAttributes',
        {
          vehicleId: vehicle?.vehicleKey as number,
        },
        response,
      ),
    );
  }

  return response;
};

export const deleteVehicleAccountAttribute = async (
  attribute: VehicleUserAttributeKey,
): Promise<NormalResult<GetAttributesResponse>> => {
  const vehicle = getCurrentVehicle();
  const response = await store
    .dispatch(
      userAttributesApi.endpoints.deleteVehicleAccountAttribute.initiate({
        vehicleId: vehicle?.vehicleKey as number,
        masterAttributeId: VehicleUserAttributes[attribute],
      }),
    )
    .unwrap();

  if (response.success) {
    void store.dispatch(
      userAttributesApi.util.upsertQueryData(
        'getVehicleAccountAttributes',
        {
          vehicleId: vehicle?.vehicleKey as number,
        },
        response,
      ),
    );
  }

  return response;
};

export const selectVehicleAccountAttribute = (
  attribute: VehicleUserAttributeKey,
): string | undefined => {
  const vehicle = getCurrentVehicle();
  const result = userAttributesApi.endpoints.getVehicleAccountAttributes.select(
    {
      vehicleId: vehicle?.vehicleKey as number,
    },
  )(store.getState());

  const {data, isSuccess} = result;

  if (isSuccess && data.success && data.data) {
    const item = data.data?.find(
      (d: VehicleUserAttributeItem) =>
        d.masterAttributeId === VehicleUserAttributes[attribute],
    ) as VehicleUserAttributeItem;
    return (item?.attributeValue as string) || undefined;
  }

  return undefined;
};

export type VehicleAttributePayloads = {
  'communicationPreferences.firstTime'?: string;
  'mga.communicationPreferences.firstTime'?: string;
  'mga.device.osVersion': string;
  'mga.device.appVersion': string;
  'mga.account.wirelessCarPin'?: string; // If `false`, PIN Screen will be shown in login flow
  'mga.account.tos.20240628'?: string; // ISO Date String of the date the user signed TOS
  'mga.account.emergencyContactPrompt'?: boolean; // If `false`, Prompt will be shown
};
