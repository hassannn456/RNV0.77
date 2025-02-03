// Backend: https://github.com/SubaruOfAmerica/tb2c-mobile-api/blob/development/src/main/java/com/subaru/tele/cloud/api/controller/OtaController.java.
import {MSAEndpointBuilder, MSAQueryDefinition, baseApi} from '../api';
import {NormalResult} from '../../@types';
import {CampaignDataParams} from '../screens/MgaVehicleSoftwareUpdates/MgaOTASoftwareUpdateLanding';

export interface VehicleOTACampaignParameters {
  vin: string;
}

export const vehicleEndpoints: (builder: MSAEndpointBuilder) => {
  vehicleOTACampaign: MSAQueryDefinition<
    VehicleOTACampaignParameters,
    NormalResult<CampaignDataParams>
  >;
} = builder => ({
  vehicleOTACampaign: builder.query({
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    forceRefetch: () => true,
    query: parameters => ({
      url: '/otaCampaigns.json',
      method: 'GET',
      params: parameters,
    }),
  }),
});

export const vehicleApi = baseApi.injectEndpoints({
  endpoints: vehicleEndpoints,
});
export const {useVehicleOTACampaignQuery} = vehicleApi;
