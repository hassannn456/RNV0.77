import { Platform } from 'react-native'
import { mgaOpenURL } from './utils/linking'

export interface LngLat {
  latitude: number
  longitude: number
}
export type URLFunctionForMapLink = (
  target: LngLat,
  source: LngLat | undefined | null,
  label: string | undefined | null,
) => string

/** Native handoff to Apple Maps (used by iOS) */
export const AppleMapsNativeURL: URLFunctionForMapLink = (
  target,
  source,
  label,
) => {
  const labelSegment = label ? `&q=${encodeURIComponent(label)}` : ''
  const sourceSegment = source
    ? `&sll=${source.latitude},${source.longitude}`
    : ''
  const targetSegment = target
    ? `&ll=${target.latitude},${target.longitude}`
    : ''
  return `maps://?t=m${labelSegment}${sourceSegment}${targetSegment}`
}

/** Web handoff to Apple Maps (used by Android and Web) */
export const AppleMapsWebURL: URLFunctionForMapLink = (
  target,
  source,
  label,
) => {
  const labelSegment = label ? `&q=${encodeURIComponent(label)}` : ''
  const sourceSegment = source
    ? `&sll=${source.latitude},${source.longitude}`
    : ''
  const targetSegment = target
    ? `&ll=${target.latitude},${target.longitude}`
    : ''
  return `https://maps.apple.com/?t=m${labelSegment}${sourceSegment}${targetSegment}`
}

/** Universal handoff to Google Maps (auto-converts to native handoff where available) */
export const GoogleMapsURL: URLFunctionForMapLink = (target, source, label) => {
  const labelSegment = label
    ? `&destination_place_id=${encodeURIComponent(label)}`
    : ''
  const sourceSegment = source
    ? `&origin=${source.latitude},${source.longitude}`
    : ''
  const targetSegment = target
    ? `&destination=${target.latitude},${target.longitude}`
    : ''
  return `https://www.google.com/maps/dir/?api=1${labelSegment}${sourceSegment}${targetSegment}`
}

/** Open a link to an external mapping app. Returns false if handoff is not possible.
 *
 * @param target - Destination coordinates
 * @param source - Starting location (optional)
 * @param label - Description of route (optional, shown in external app)
 */
export const CsfLinkToMapApp = (
  target: LngLat,
  source?: LngLat | null,
  label?: string | null,
): boolean => {
  switch (Platform.OS) {
    case 'ios': {
      const url = AppleMapsNativeURL(target, source, label)
      void mgaOpenURL(url)
      return true
    }
    case 'android': {
      const url = GoogleMapsURL(target, source, label)
      void mgaOpenURL(url)
      return true
    }
    default:
      return false
  }
}
