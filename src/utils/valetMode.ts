import { mpsToRegionalSpeed } from './conversion'

const second = 1000
const minute: number = 60 * second

export const rapidPollIntervalMs: number = 5 * second // 5 seconds — used on valet status screen
export const longPollIntervalMs: number = 2 * minute // 2 minutes - used on dashboard screen
export const shortPollIntervalMs: number = 0.5 * minute // 30 seconds - used on dashboard screen

// By default, server assigns `63 MPS` AKA `141 MPH` to the `maxSpeedMPS` field.
// We use this number to deduce if valet speed options have previously been set by user or not.
export const defaultSpeedLimitMPH = 141
export const defaultSpeedLimitMPS = 63

export interface SpeedAlertOption {
  label: string
  value: string
}

export const speedAlertValuesMps: Array<11 | 18 | 29> = [11, 18, 29]
export const speedAlertOptionsMph: Array<SpeedAlertOption> =
  speedAlertValuesMps.map(val => {
    const result = mpsToRegionalSpeed(val, 'MPH')
    if (result instanceof Error) {
      throw result
    }
    return { label: `${result} MPH`, value: `${val}` }
  })
