// cSpell:ignore ONETENTHOF

export const convertUnits = (
  value: number | null | undefined,
  source: string,
  target: string,
): number | null | undefined => {
  if (value == null || value == undefined || source == target) {
    return value
  }
  switch (source) {
    case 'mi':
      switch (target) {
        case 'km':
          return value * 1.609344
        case 'm':
          return value * 1609.344
      }
      break
    case 'km':
      switch (target) {
        case 'm':
          return value * 1000
        case 'mi':
          return value * 0.6213712
      }
      break
    // ONETENTHOF-MILE is used in Trip Logs
    case 'ONETENTHOF-MILE':
      switch (target) {
        case 'km':
          return value * 0.1609344
        case 'mi':
          return value / 10
      }
      break
    // ONETENTHOF-KM is used in Trip Logs
    case 'ONETENTHOF-KM':
      switch (target) {
        case 'km':
          return value / 10
        case 'mi':
          return value * 0.06213712
      }
      break
  }
  console.warn(`Undefined conversion: "${source} => ${target}`)
  return undefined
}

/** TODO:MN:20240123: Possibly better to move this to units.ts function,
 * but make this one call, so mi/h -> km/h, km/h -> mi/h exist without a round trip through m/s.
 * Might need a longer discussion here. */
