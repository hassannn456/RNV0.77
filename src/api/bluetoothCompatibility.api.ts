// Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/main/src/main/java/com/subaru/tele/cloud/api/controller/bluetoothCompatibilityController.java
import {NormalResult} from '../../@types';
import {
  MSAEndpointBuilder,
  MSAQueryDefinition,
  baseApi,
  MSASuccess,
  MSAContentTypeForm,
} from '../api';

export interface YearsListData {
  code: string;
  year: string;
  active: string;
}

export interface ServiceProviderInfo {
  name: string;
}

export interface BluetoothConnectionInfo {
  connections: object;
  serviceProviders: ServiceProviderInfo[];
}

export interface BluetoothCompatibilityInfo {
  headUnitImagePrefix: string;
  currentVehicleModelYear: string;
  currentVehicleModelCode: string;
  currentVehicleTrim: string;
  yearsList: YearsListData[];
  bluetoothCompatibility: BluetoothConnectionInfo;
}

export interface GetModalNamesParameters {
  modelYear: string;
}

export interface GetTrimsParameters {
  modelYear: string;
  modelName: string;
}

export interface GetManufacturerParameters {
  modelYear: string;
  modelName: string;
  trim: string;
  serviceProvider: string;
}

export interface GetModalPhoneParameters {
  modelYear: string;
  modelName: string;
  trim: string;
  serviceProvider: string;
  manufacturer: string;
}

export interface GetHeadUnitsAndCarrierParameters {
  modelYear: string;
  modelName: string;
  trim: string;
}

export interface ModelNames {
  code: string;
  name: string;
}

export interface ModalResponseInfo extends MSASuccess {
  data: ModelNames[];
}

export interface HeadUnitResponseInfo extends MSASuccess {
  data: BluetoothConnectionInfo;
}

export interface GetHeadUnitsAndCarriersByVinParameters {
  vin: string;
}

export interface bluetoothCompatibilityResultsParameters {
  modelYear?: string;
  modelName?: string;
  trim?: string;
  headUnit: string;
  serviceProvider: string;
  manufacturer: string;
  phoneModel: string;
  headUnitTextDisplay: string;
  modelNameTextDisplay?: string;
  trimTextDisplay?: string;
}

export interface bluetoothCompatibilityResultsResponseInfo extends MSASuccess {
  data: {
    headUnitImagePrefix: string;
    currentVehicleModelYear: string;
    currentVehicleModelCode: string;
    currentVehicleTrim: string;
    serviceProviders: string;
    yearsList: string;
    headUnitList: string;
    results: {code: string; availability: string}[];
    bluetoothCompatibility: string;
    headUnit: string;
    serviceProvider: string;
    manufacturer: string;
    phoneModel: string;
    nickname: string;
  };
}

export const bluetoothCompatibilityEndpoint: (builder: MSAEndpointBuilder) => {
  checkBluetoothCompatibility: MSAQueryDefinition<
    undefined,
    NormalResult<BluetoothCompatibilityInfo>
  >;
  getModalNames: MSAQueryDefinition<GetModalNamesParameters, ModalResponseInfo>;
  getTrims: MSAQueryDefinition<GetTrimsParameters, ModalResponseInfo>;
  getManufacturer: MSAQueryDefinition<
    GetManufacturerParameters,
    ModalResponseInfo
  >;
  getModalPhones: MSAQueryDefinition<
    GetModalPhoneParameters,
    ModalResponseInfo
  >;
  getHeadUnitsAndCarrier: MSAQueryDefinition<
    GetHeadUnitsAndCarrierParameters,
    HeadUnitResponseInfo
  >;
  getHeadUnitsAndCarriersByVin: MSAQueryDefinition<
    GetHeadUnitsAndCarriersByVinParameters,
    HeadUnitResponseInfo
  >;
  bluetoothCompatibilityResults: MSAQueryDefinition<
    bluetoothCompatibilityResultsParameters,
    bluetoothCompatibilityResultsResponseInfo
  >;
} = builder => ({
  checkBluetoothCompatibility: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: '/resource/checkBluetoothCompatibility.json',
      method: 'GET',
      params: parameters,
    }),
  }),
  getModalNames: builder.query({
    query: parameters => ({
      body: parameters,
      url: '/resource/getModelNames.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeForm,
      requires: ['session'],
    },
  }),
  getTrims: builder.query({
    query: parameters => ({
      body: parameters,
      url: '/resource/getTrims.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeForm,
      requires: ['session'],
    },
  }),
  getManufacturer: builder.query({
    query: parameters => ({
      body: parameters,
      url: '/resource/getManufacturer.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeForm,
      requires: ['session'],
    },
  }),
  getModalPhones: builder.query({
    query: parameters => ({
      body: parameters,
      url: '/resource/getModels.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeForm,
      requires: ['session'],
    },
  }),
  getHeadUnitsAndCarrier: builder.query({
    query: parameters => ({
      body: parameters,
      url: '/resource/getHeadUnitsAndCarriers.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeForm,
      requires: ['session'],
    },
  }),
  getHeadUnitsAndCarriersByVin: builder.query({
    query: parameters => ({
      body: parameters,
      url: '/resource/getHeadUnitsAndCarriersByVin.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeForm,
      requires: ['session'],
    },
  }),
  bluetoothCompatibilityResults: builder.query({
    query: parameters => ({
      body: parameters,
      url: '/resource/bluetoothCompatibilityResults.json',
      method: 'POST',
    }),
    extraOptions: {
      contentType: MSAContentTypeForm,
      requires: ['session'],
    },
  }),
});

export const bluetoothCompatibilityApi = baseApi.injectEndpoints({
  endpoints: bluetoothCompatibilityEndpoint,
});
export const {
  useCheckBluetoothCompatibilityQuery,
  useLazyGetModalNamesQuery,
  useLazyGetTrimsQuery,
  useLazyGetManufacturerQuery,
  useLazyGetModalPhonesQuery,
  useLazyGetHeadUnitsAndCarrierQuery,
  useLazyGetHeadUnitsAndCarriersByVinQuery,
  useLazyBluetoothCompatibilityResultsQuery,
} = bluetoothCompatibilityApi;
