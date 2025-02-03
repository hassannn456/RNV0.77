// cSpell:ignore Invehicle
import {
  MSAEndpointBuilder,
  MSAMutationDefinition,
  MSAQueryDefinition,
  MSASuccess,
  baseApi,
} from '../../../../api'
import {
  executeRemoteCommand,
  RemoteCommand,
  RemoteServiceRequestBase,
  RemoteServiceResponse,
} from '../../../remoteService/remoteService.api'

const resetValetPinCommand: RemoteCommand = {
  name: 'valetModeReset',
  type: 'valetMode',
  url: 'service/g2/valetInvehiclePinReset/execute.json',
  statusUrl: 'service/g2/remoteService/status.json',
}

export interface ValidatePinRequest {
  pin: string
  vin?: string
}

export interface VehicleRequest {
  serviceRequestId: string
}

export interface VehicleResponse {
  success: boolean
  dataName: string
  data: {
    serviceRequestId: string
    success: boolean
    cancelled: boolean
    remoteServiceType: string
    remoteServiceState: string
    subState: string
    errorCode: string
    result: string
    updateTime: number
    vin: string
    errorDescription: string
  }
}

export interface ValetPasscodeRequest extends RemoteServiceRequestBase {
  vin: string
  pin: string
}

export const valetPasscode = async (
  parameters?: ValetPasscodeRequest,
): Promise<RemoteServiceResponse> => {
  const request: ValetPasscodeRequest = {
    vin: parameters?.vin ?? '',
    pin: parameters?.pin ?? '',
  }
  return await executeRemoteCommand(resetValetPinCommand, request, {
    requires: ['PIN', 'session', 'timestamp'],
  })
}

export const valetPasscodeResetEndpoints: (builder: MSAEndpointBuilder) => {
  validatePin: MSAMutationDefinition<ValidatePinRequest, MSASuccess>
  valetPasscodeResetVehicle: MSAQueryDefinition<VehicleRequest, VehicleResponse>
} = builder => ({
  validatePin: builder.mutation({
    query: parameters => ({
      body: parameters,
      url: 'service/g2/valetInvehiclePinReset/execute.json',
      method: 'POST',
    }),
    extraOptions: { requires: ['session'] },
  }),
  valetPasscodeResetVehicle: builder.query({
    extraOptions: {
      requires: ['session'],
    },
    query: parameters => ({
      url: 'service/g2/remoteService/status.json',
      method: 'GET',
      params: parameters,
    }),
  }),
})

export const valetPasscodeResetApi = baseApi.injectEndpoints({
  endpoints: valetPasscodeResetEndpoints,
})

export const { useValidatePinMutation, useValetPasscodeResetVehicleQuery } =
  valetPasscodeResetApi
