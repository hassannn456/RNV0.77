type Encodable = string | number | boolean | null | undefined
export type EncodableFormData = { [key: string]: Encodable | Encodable[] }

/** Encode a value for endpoints that require x-www-form-urlencoded.
 *
 * https://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1
 *
 * Exposed to be called directly to pass values to GET endpoints. */
export const encode = (s: Encodable): string => {
  if (s == null || s == undefined) {
    return ''
  }
  // encodeURIComponent strips commas
  // but Subaru's backend expects them in some dates
  if (typeof s == 'string' && s.includes(',')) {
    return s.split(',').map(encode).join(',')
  }
  return encodeURIComponent(s).replaceAll('%20', '+')
}

/** Encode an object for endpoints that require x-www-form-urlencoded.
 *
 * https://www.w3.org/TR/html401/interact/forms.html#h-17.13.4.1
 *
 * See tests for examples. */
export const encodeFormData = (data: EncodableFormData): string => {
  return Object.keys(data)
    .map(key => {
      const value = data[key]
      if (Array.isArray(value)) {
        return value
          .map(element => `${encode(key)}=${encode(element)}`)
          .join('&')
      } else {
        return `${encode(key)}=${encode(value)}`
      }
    })
    .join('&')
}
