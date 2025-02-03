// cSpell:ignore NANP, GIIMA

/** Produce a formatted phone number.
 *
 * Based on existing apps. See tests for examples. May need revised for outside NANP. */
export function formatPhone(input: string): string {
  if (input != null) {
    input = input.replace(/\D/g, '')
    /* GIIMA-1427 - Change Phone Number Format */
    if (input.length == 11) {
      input = input.replace(
        /(\d{1})-?(\d{3})-?(\d{3})-?(\d{4})/,
        '$1 ($2) $3-$4',
      )
    } else if (input.length == 10) {
      input = input.replace(/(\d{3})-?(\d{3})-?(\d{4})/, '($1) $2-$3')
    } else if (input.length == 7) {
      input = input.replace(/(\d\d\d)(\d\d\d)(\d)/, '($1) $2-$3')
    } else if (input.length == 4) {
      input = input.replace(/(\d\d\d)(\d)/, '($1) $2')
    } else {
      return input
    }
    return input
  } else {
    return ''
  }
}

export function validPhone(input: string | null): boolean {
  if (input != null) {
    const formattedInput = formatPhone(input)
    const digits = formattedInput.replace(/\D/g, '')
    return (
      !!formattedInput.match(/^[+]*(?:\d{1,3}[-\s])?\(\d{3}\)[- \d]*$/g) &&
      digits.length >= 10 // this part might not work for some international numbers
    )
  } else {
    return false
  }
}
