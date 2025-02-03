import { MobileMessage, NormalResult } from '../../../@types'
import {
  MSAEndpointBuilder,
  MSAQueryDefinition,
  MSASuccess,
  baseApi,
} from '../../api'
import { CsfDropdownItem } from '../../components'
// import revisionJson from '../../../build/revision.json'
import { store } from '../../store'
import { useTranslation } from 'react-i18next'
import { trackError } from '../../components/useTracking'

export type MySAlertsResponse = MSASuccess

export type StartupPropertiesResponseData = {
  rvccRefreshEnabled: boolean
  valetInitStatusCheck: boolean
  evAndroidAppUrl: string
  isSwoopEnabled: boolean
  rvccHomeEnabled: boolean
  rateUsEnabled: boolean
  evIosAppUrl: string
  chatEnabled: boolean
  isValetModeEnabled: boolean
} & Record<string, string | boolean>

export interface StartupPropertiesResponse extends MSASuccess {
  data: StartupPropertiesResponseData
}

export interface TimeZoneData {
  referenceKey: number
  type: string
  name: string
  value: string
  displayOrder: number
  createdDate: number
  modifiedDate: number
}

export const adminEndpoints: (builder: MSAEndpointBuilder) => {
  mobileMessage: MSAQueryDefinition<undefined, NormalResult<MobileMessage>>
  mysAlerts: MSAQueryDefinition<undefined, MySAlertsResponse>
  startupProperties: MSAQueryDefinition<undefined, StartupPropertiesResponse>
} = builder => ({
  mobileMessage: builder.query({
    query: _parameters => ({
      url: 'admin/mobileMessage.json',
      method: 'GET',
      // params: { appVersion: revisionJson.version },
    }),
    extraOptions: {
      requires: ['timestamp'],
      suppressConnectionNotice: true,
    },
  }),
  mysAlerts: builder.query({
    query: parameters => ({
      url: 'admin/mysAlerts.json',
      method: 'GET',
      params: parameters,
    }),
    extraOptions: {
      requires: ['session', 'timestamp'],
      suppressConnectionNotice: true,
    },
  }),
  startupProperties: builder.query({
    query: parameters => ({
      url: 'admin/startupProperties.json',
      method: 'GET',
      params: parameters,
    }),
    extraOptions: {
      requires: ['timestamp'],
      suppressConnectionNotice: true,
    },
  }),
})

export const adminApi = baseApi.injectEndpoints({ endpoints: adminEndpoints })
export const {
  useMobileMessageQuery,
  useMysAlertsQuery,
  useStartupPropertiesQuery,
} = adminApi

export const getStartupProperty = (
  property: keyof StartupPropertiesResponseData | string,
): string | boolean | undefined => {
  const startupPropertiesResult = adminApi.endpoints.startupProperties.select(
    undefined,
  )(store.getState())
  // everything is optional because mobileApi
  return startupPropertiesResult?.data?.data?.[property]
}

/** Hook to provide a list of region-specific time zones for a dropdown. */
export const useTimeZones = (): CsfDropdownItem[] => {
  const { t } = useTranslation()
  const content = t('timeZones:data', {
    returnObjects: true,
  }) as unknown as TimeZoneData[]
  if (!Array.isArray(content)) {
    trackError('useTimeZones')('content::notArray')
    return []
  }
  const options = content
    .filter(tz => tz.name && tz.value)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((tz: TimeZoneData) => ({ label: tz.name, value: tz.value }))
  return options
}
