export type RegionalSpeedUnit = 'MPH' | 'KPH'

export const mphToMps = (mph: number): number => {
  const unitMPH = 0.447 /* Meter per Second */
  const mps = mph * unitMPH
  return Math.round(mps)
}

export const mpsToMph = (mps: number): number => {
  const mph = Math.round(((mps * 3600) / 1610.3) * 1000) / 1000
  return Math.round(mph)
}

export const mpsToKph = (mps: number): number => {
  return Math.round(mps * 3.6)
}

export const mpsToRegionalSpeed = (
  mps: number,
  regionalUnit: RegionalSpeedUnit,
): number | Error => {
  if (regionalUnit == 'MPH') {
    return mpsToMph(mps)
  } else if (regionalUnit == 'KPH') {
    return mpsToKph(mps)
  }

  return new Error('Invalid regional unit entered.')
}

// TODO:MN:20240529 Merge this with units which also handles meters
export const metersToMiles = (meters: number): string => {
  return (meters * 0.000621371192).toFixed(1)
}

export const numericIndexToUpperCaseLetter = (
  index: number,
): string | undefined => {
  if (index < 0 || index >= 26) {
    return undefined // Out of range
  }
  return String.fromCharCode(65 + index) // 65 is the ASCII code for 'A'
}
