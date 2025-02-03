/* eslint-disable camelcase */

export interface AriaErrorMessage {
  error_key?: string
  error_code?: string
  error_field?: string
}

export interface AriaResponse {
  errors: number
  error_messages: AriaErrorMessage[]
  inSessionID: string
  payment_method_no?: string
}

export const parseAriaRedirectUrl: (url: string) => AriaResponse = url => {
  const response: AriaResponse = {
    errors: 0,
    error_messages: [],
    inSessionID: '',
  }
  const parts = url.split('?')
  if (parts.length < 2) {
    return {
      errors: 1,
      error_messages: [
        {
          error_code: 'redirect_failed',
          error_field: '',
          error_key: 'redirect_failed',
        },
      ],
      inSessionID: '',
    }
  }
  const params = parts[1]?.split('&')
  params.forEach(p => {
    let match: RegExpMatchArray | null
    if ((match = p.match(/errors=(\d+)/))) {
      const [_s, count] = match
      response.errors = parseInt(count)
    } else if ((match = p.match(/payment_method_no=(\w+)/))) {
      const [_s, no] = match
      response.payment_method_no = no
    } else if ((match = p.match(/inSessionID=(\w+)/))) {
      const [_s, id] = match
      response.inSessionID = id
    } else if (
      (match = p.match(
        /error_messages\[(\d+)\]\[(error_key|error_code|error_field)\]=(\w+)/,
      ))
    ) {
      const [_s, indexStr, key, value] = match
      const index = parseInt(indexStr)
      if (!response.error_messages[index]) {
        response.error_messages[index] = {}
      }
      response.error_messages[index][
        key as 'error_key' | 'error_code' | 'error_field'
      ] = value
    }
  })
  return response
}
