import { useTranslation } from 'react-i18next'
import {
  baseApi,
  cAbortedTimeout,
  MSAEndpointBuilder,
  MSAMutationDefinition,
  MSAQueryDefinition,
  MSASuccess,
} from '../../api'
import { alertBadConnection } from '../../components'
import { EngineStartSettings, getVehicleType } from '../../utils/vehicle'
import { useCurrentVehicle } from '../auth/sessionSlice'
import { trackError } from '../../components/useTracking'
import { cNoVehicle } from '../../api/account.api'

export interface QuickStartSettingsResponse {
  success: true
  data: EngineStartSettings
  errorCode: null
}

export interface PresetSettingsResponse {
  success: true
  data: EngineStartSettings[]
  errorCode: null
}

/** Endpoints for climate control presets used during remote engine start.
 *
 * NOTE:
 * - climatePresetSettings/fetch returns array of JSON strings
 * - remoteEngineQuickStartSettings/fetch returns string of JSON
 * - remoteEngineStartSettings/fetch returns string of JSON array
 *
 * Cleanup handled in transformResponse. Samples in demo folder.
 */
export const climateEndpoints: (builder: MSAEndpointBuilder) => {
  remoteEngineStartSettingsFetch: MSAQueryDefinition<
    undefined,
    PresetSettingsResponse
  >
  remoteEngineStartSettingsSave: MSAMutationDefinition<
    EngineStartSettings[],
    MSASuccess
  >
  remoteEngineQuickStartSettingsFetch: MSAQueryDefinition<
    undefined,
    QuickStartSettingsResponse
  >
  remoteEngineQuickStartSettingsSave: MSAMutationDefinition<
    EngineStartSettings,
    MSASuccess
  >
} = builder => ({
  remoteEngineStartSettingsFetch: builder.query({
    providesTags: ['remoteEngineStartSettings'],
    query: parameters => ({
      params: parameters,
      url: 'service/g2/remoteEngineStartSettings/fetch.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    transformResponse: (response: PresetSettingsResponse) => {
      if (response.success && !response.data) {
        // Convert null to []
        return { ...response, data: [] }
      } else if (typeof response.data == 'string') {
        // Parse JSON
        const parsed = JSON.parse(response.data) as EngineStartSettings[]
        return { success: true, data: parsed }
      } else if (response?.errorCode == cAbortedTimeout) {
        alertBadConnection()
      } else {
        return response
      }
    },
  }),
  remoteEngineStartSettingsSave: builder.mutation({
    invalidatesTags: ['remoteEngineStartSettings'],
    query: parameters => ({
      body: parameters,
      url: 'service/g2/remoteEngineStartSettings/save.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
  remoteEngineQuickStartSettingsFetch: builder.query({
    providesTags: ['remoteEngineQuickStartSettings'],
    query: parameters => ({
      params: parameters,
      url: 'service/g2/remoteEngineQuickStartSettings/fetch.json',
      method: 'GET',
    }),
    forceRefetch: () => true,
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
    transformResponse: (response: QuickStartSettingsResponse) => {
      if (response.success && !response.data) {
        // Convert null to []
        return { ...response, data: [] }
      } else if (typeof response.data == 'string') {
        // Parse JSON
        const parsed = JSON.parse(response.data) as EngineStartSettings[]
        return { success: true, data: parsed }
      } else if (response?.errorCode == cAbortedTimeout) {
        alertBadConnection()
      } else {
        return response
      }
    },
  }),
  remoteEngineQuickStartSettingsSave: builder.mutation({
    invalidatesTags: ['remoteEngineQuickStartSettings'],
    query: parameters => ({
      body: parameters,
      url: 'service/g2/remoteEngineQuickStartSettings/save.json',
      method: 'POST',
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
    },
  }),
})

export const climateApi = baseApi.injectEndpoints({
  endpoints: climateEndpoints,
})
export const {
  useRemoteEngineStartSettingsFetchQuery,
  useRemoteEngineStartSettingsSaveMutation,
  useRemoteEngineQuickStartSettingsFetchQuery,
  useRemoteEngineQuickStartSettingsSaveMutation,
} = climateApi

/**
 * Hook to provide a list of region-specific climate presets.
 *
 * This replaces calling service/g2/remoteEngineQuickStartSettings/fetch.json.
 **/
export const useSubaruPresets = (): EngineStartSettings[] => {
  const { t } = useTranslation()
  const vehicle = useCurrentVehicle()
  if (!vehicle) {
    trackError('useClimatePresets')(cNoVehicle)
    return []
  }
  const vehicleType = getVehicleType(vehicle)
  const content = t('climate:presets', {
    returnObjects: true,
  }) as unknown as EngineStartSettings[]
  if (!Array.isArray(content)) {
    trackError('useClimatePresets')('content::notArray')
    return []
  }
  const presets = content
    .filter(p => {
      // Content has gas and phev presets for all vehicles, filter unrelated items
      return p.vehicleType == vehicleType
    })
    .map(p => {
      // Content returns universal settings,
      // even if vehicle cannot implement them.
      // Fix presets with incorrect settings here.
      if (p.name.toLowerCase() == 'full cool') {
        if (vehicle.features?.includes('RVFS') != true) {
          p.heatedSeatFrontLeft = 'OFF'
          p.heatedSeatFrontRight = 'OFF'
        }
      }
      return p
    })
  return presets
}
