/** Compute checksum for a VIN
 *  Source: https://en.wikipedia.org/wiki/Vehicle_identification_number
 */
export const computeVINCheckDigit = (vin: string): string => {
  const transliterate: { [key: string]: number } = {
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    E: 5,
    F: 6,
    G: 7,
    H: 8,
    J: 1,
    K: 2,
    L: 3,
    M: 4,
    N: 5,
    P: 7,
    R: 9,
    S: 2,
    T: 3,
    U: 4,
    V: 5,
    W: 6,
    X: 7,
    Y: 8,
    Z: 9,
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
  }
  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]
  const sum = vin
    .toUpperCase()
    .split('')
    .map((value, index) => {
      return transliterate[value] * weights[index]
    })
    .reduce((lhs, rhs) => {
      return lhs + rhs
    })
  const output = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'X']
  return output[sum % output.length]
}
/**
 * Check Vehicle Identification Number
 * @param vin
 * @returns boolean
 */
export const checkVIN = (vin: string): boolean => {
  if (vin.length != 17) {
    return false
  }
  if (computeVINCheckDigit(vin) !== vin[8]) {
    return false
  }
  return true
}
