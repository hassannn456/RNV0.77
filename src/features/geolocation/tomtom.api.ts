// cSpell:ignore ofs, mapcodes, typeahead, mapcodes, Pois

import { store } from '../../store'
import { getAppRegion } from '../localization/localization.i18n'

export interface Coordinates {
  latitude: number
  longitude: number
}

interface ClassificationName {
  nameLocal: string
  name: string
}

interface Classification {
  code: string
  names: Array<ClassificationName>
}

interface Category {
  id: string
}

export interface Poi {
  name: string
  phone: string
  categorySet: Array<Category>
  categories: Array<string>
  classifications: Array<Classification>
}

export interface TomTomStructuredGeocodeRequest {
  countryCode?: string
  limit?: string
  ofs?: string
  streetNumber?: string
  streetName?: string
  crossStreet?: string
  municipality?: string
  municipalitySubdivision?: string
  countryTertiarySubdivision?: string
  countrySecondarySubdivision?: string
  countrySubdivision?: string
  postalCode?: string
  language?: string
  extendedPostalCodesFor?: string
  view?: string
  mapcodes?: string
  entityTypeSet?: string
}

export interface TomTomSearchRequest {
  typeahead?: string
  limit?: string
  ofs?: string
  countrySet?: string
  lat?: string
  lon?: string
  radius?: string
  topLeft?: string
  btmRight?: string
  language?: string
  extendedPostalCodesFor?: string
  minFuzzyLevel?: string
  maxFuzzyLevel?: string
  idxSet?: string
  categorySet?: string
  brandSet?: string
  connectorSet?: string
  minPowerKW?: string
  maxPowerKW?: string
  fuelSet?: string
  view?: string
  openingHours?: string
  timeZone?: string
  mapcodes?: string
  relatedPois?: string
  entityTypeSet?: string
}

export interface TomTomSearchResult {
  type: string
  id: string
  score: number
  dist: number
  entityType: string
  poi: Poi
  address: {
    streetNameAndNumber: string
    streetNumber: string
    streetName: string
    localName: string
    municipalitySubdivision: string
    municipality: string
    countrySecondarySubdivision: string
    countrySubdivision: string
    countrySubdivisionName: string
    postalCode: string
    postalName: string
    countryCode: string
    country: string
    countryCodeISO3: string
    freeformAddress: string
    extendedPostalCode: string | undefined
  }
  position: {
    lat: number
    lon: number
  }
  viewport: {
    topLeftPoint: {
      lat: number
      lon: number
    }
    btmRightPoint: {
      lat: number
      lon: number
    }
  }
  boundingBox: {
    topLeftPoint: {
      lat: number
      lon: number
    }
    btmRightPoint: {
      lat: number
      lon: number
    }
  }
  dataSources: {
    geometry: {
      id: string
    }
  }
}

export interface TomTomSearchResponse {
  summary?: {
    query: string
    queryType: string
    queryTime: number
    numResults: number
    offset: number
    totalResults: number
    fuzzyLevel: number
  }
  addresses?: TomTomSearchResult[]
  results?: TomTomSearchResult[]
  errorText?: string
  detailedError?: {
    code: string
    message: string
    target: string
  }
  httpStatusCode?: string
}

const tomTomGetApiKey = (): string => {
  const key = store.getState().session?.tomtomKey
  if (!key) {
    throw {
      errorText: 'API Key not found!',
    }
  }
  return key
}

const tomTomResponseOk = async (response: Response) => {
  if (!response.ok) {
    throw {
      errorText: response.statusText,
      detailedError: {
        code: `${response.status}`,
        message: await response.text(),
        target: '',
      },
    }
  }
}

const tomTomJSErrorToTomTomPayload = (
  error: string | Error | TomTomSearchResponse,
): TomTomSearchResponse => {
  if (typeof error == 'string') {
    return {
      errorText: error,
    }
  }
  if (error instanceof Error) {
    return {
      errorText: error.message,
    }
  } else {
    return error
  }
}

export const tomTomStructuredGeocodeSearch = async (
  parameters: TomTomStructuredGeocodeRequest,
): Promise<TomTomSearchResponse> => {
  try {
    const req = { key: tomTomGetApiKey(), ...parameters }
    const url = new URL(
      'https://api.tomtom.com/search/2/structuredGeocode.json',
    )
    Object.keys(req).forEach(key => {
      const value = req[key as keyof TomTomStructuredGeocodeRequest] ?? ''
      url.searchParams.append(key, value)
    })
    const response = await fetch(url.toString(), { method: 'GET' })
    await tomTomResponseOk(response)
    const json = (await response.json()) as TomTomSearchResponse
    return json
  } catch (error) {
    return tomTomJSErrorToTomTomPayload(error)
  }
}

export const tomTomSearch = async (
  query: string,
  parameters: TomTomSearchRequest,
): Promise<TomTomSearchResponse> => {
  try {
    const req = { key: tomTomGetApiKey(), ...parameters }
    let url = `https://api.tomtom.com/search/2/search/${query}.json`
    Object.keys(req).forEach((key, index) => {
      const value = req[key as keyof typeof req] ?? ''
      // TomTom has some problems if you actually start encoding here
      url = url + (index == 0 ? '?' : '&') + key + '=' + value
    })
    const response = await fetch(url, { method: 'GET' })
    await tomTomResponseOk(response)
    const json = (await response.json()) as TomTomSearchResponse
    return json
  } catch (error) {
    return tomTomJSErrorToTomTomPayload(error)
  }
}

export const tomtomCategorySearch = async (
  parameters: TomTomSearchRequest,
): Promise<TomTomSearchResponse> => {
  try {
    const req = { key: tomTomGetApiKey(), ...parameters }
    let url = 'https://api.tomtom.com/search/2/categorySearch/.json'
    Object.keys(req).forEach((key, index) => {
      const value = req[key as keyof typeof req] ?? ''
      // TomTom has some problems if you actually start encoding here
      url = url + (index == 0 ? '?' : '&') + key + '=' + value
    })
    const response = await fetch(url, { method: 'GET' })
    await tomTomResponseOk(response)
    const json = (await response.json()) as TomTomSearchResponse
    return json
  } catch (error) {
    return tomTomJSErrorToTomTomPayload(error)
  }
}

/** Lookup geographic data by postal code. */
export const tomTomFindByPostalCode = async (
  postalCode: string,
): Promise<TomTomSearchResult | null> => {
  try {
    const req = {
      key: tomTomGetApiKey(),
      limit: 6,
      countrySet: 'US,CA,GU,MX,PR,VI,AS',
      idxSet: 'Geo,PAD,Addr',
    }
    let url = `https://api.tomtom.com/search/2/search/${postalCode}.json`
    Object.keys(req).forEach((key, index) => {
      const value = (req[key as keyof typeof req] ?? '') as string
      // TomTom has some problems if you actually start encoding here
      url = url + (index == 0 ? '?' : '&') + key + '=' + value
    })
    const response = await fetch(url, { method: 'GET' })
    await tomTomResponseOk(response)
    const json = (await response.json()) as TomTomSearchResponse
    const countryCode = getAppRegion()
    const result = json.results?.find(r => r.address.countryCode == countryCode)
    return result ?? null
  } catch (error: any) {
    return null
  }
}

export const tomTomGetAddressForLatLng = async (
  lat: number,
  long: number,
): Promise<TomTomSearchResponse | null> => {
  try {
    const req = {
      key: tomTomGetApiKey(),
      limit: 6,
      countrySet: 'US,CA,GU,MX,PR,VI,AS',
      idxSet: 'Geo,PAD,Addr',
    }
    let url = `https://api.tomtom.com/search/2/reverseGeocode/${lat},${long}.json`
    Object.keys(req).forEach((key, index) => {
      const value = (req[key as keyof typeof req] ?? '') as string
      // TomTom has some problems if you actually start encoding here
      url = url + (index == 0 ? '?' : '&') + key + '=' + value
    })
    const response = await fetch(url, { method: 'GET' })
    await tomTomResponseOk(response)
    const json = (await response.json()) as TomTomSearchResponse
    return json
  } catch (error) {
    return null
  }
}
