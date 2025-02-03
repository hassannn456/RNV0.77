// cSpell:ignore Luhn

/** Format Credit Card Number for display
 *
 * Standard - "4444444444444448" => "4444 4444 4444 4448"
 *
 * Amex     - "344444444444447"  => "3444 444444 44447"
 **/
export const formatCC = (number: string | undefined): string => {
  if (number == undefined) {
    return ''
  }
  const stripped = number.replace(/[^0-9]/g, '')
  const issuer = getIssuer(stripped)
  if (issuer == 'amex') {
    return `${stripped.substring(0, 4)} ${stripped.substring(
      4,
      10,
    )} ${stripped.substring(10, 15)}`.trimEnd()
  } else {
    return `${stripped.substring(0, 4)} ${stripped.substring(
      4,
      8,
    )} ${stripped.substring(8, 12)} ${stripped.substring(12, 16)}`.trimEnd()
  }
}
/**
 * Check Credit Card Number
 * @param number
 * @returns "ok" or errorCode */
export const checkCC = (number: string | undefined): boolean => {
  if (number == undefined || number == '') {
    return false
  }
  const stripped = number.replace(/\s/g, '')
  if (stripped.length < 15 || stripped.length > 19) {
    return false
  }
  // Luhn algorithm
  // https://en.wikipedia.org/wiki/Luhn_algorithm
  const nDigits = stripped.length
  const parity = (nDigits - 2) % 2
  let sum = 0
  for (let i = 0; i < nDigits; i++) {
    let digit = parseInt(stripped[i])
    if (i % 2 == parity) {
      digit = digit * 2
    }
    if (digit > 9) {
      digit = digit - 9
    }
    sum = sum + digit
  }
  return sum % 10 == 0
}

export type Issuer = 'amex' | 'discover' | 'mastercard' | 'visa'
/** Detect card issuer from beginning of card number.
 *
 * Partial (US-centric) listing, add cases as needed.
 * Reference: https://en.wikipedia.org/wiki/Payment_card_number#Issuer_identification_number_(IIN)
 */
export const getIssuer = (number: string | undefined): Issuer | unknown => {
  if (!number) return undefined
  if (number.startsWith('****')) return undefined
  const stripped = number.replace(/[^0-9]/g, '')
  const firstSix = parseInt(stripped.padEnd(6, '0').substring(0, 6))
  // 2221–2720
  if (222100 <= firstSix && firstSix <= 272099) return 'mastercard'
  // 34
  if (340000 <= firstSix && firstSix <= 349999) return 'amex'
  // 37
  if (370000 <= firstSix && firstSix <= 379999) return 'amex'
  // 4
  if (400000 <= firstSix && firstSix <= 499999) return 'visa'
  // 51-55
  if (510000 <= firstSix && firstSix <= 559999) return 'mastercard'
  // 6011
  if (601100 <= firstSix && firstSix <= 601199) return 'discover'
  // 644-649
  if (644000 <= firstSix && firstSix <= 649999) return 'discover'
  // 622126–622925 (China UnionPay co-branded)
  if (622126 <= firstSix && firstSix <= 622925) return 'discover'
  return undefined
}
