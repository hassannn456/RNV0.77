import { TomTomSearchResult } from '../features/geolocation/tomtom.api'

export const parseName = (result: TomTomSearchResult): string => {
  if (result.type == 'POI') {
    // eslint-disable-next-line
    return result.poi.name
  } else if (
    result.type == 'Geography' &&
    result.entityType != 'MunicipalitySubdivision'
  ) {
    return result.address.freeformAddress
  } else if (result.type == 'Point Address' || result.type == 'Address Range') {
    return result.address.freeformAddress
  } else {
    return ''
  }
}

export const parseZip = (result: TomTomSearchResult): string | null => {
  const { address } = result
  if (address.countryCode == 'CA') {
    return address.extendedPostalCode != undefined
      ? address.extendedPostalCode
      : address.postalCode != undefined
        ? address.postalCode
        : null
  } else {
    return address.postalCode != undefined ? address.postalCode : ''
  }
}
