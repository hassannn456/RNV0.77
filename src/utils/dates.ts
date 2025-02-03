// cSpell:ignore millis, Millis
import { LocalDate, LocalDateTime } from '../../@types'
import { format } from 'date-fns'

export const parseDateObject = (
  dateObject: LocalDate | null | undefined,
): Date | null | undefined => {
  if (!dateObject) return dateObject
  return new Date(
    dateObject.year,
    dateObject.monthValue - 1,
    dateObject.dayOfMonth,
  )
}

export const parseLocalDateTime = (localDateTime: LocalDateTime): Date => {
  return new Date(
    localDateTime.year,
    localDateTime.monthValue - 1,
    localDateTime.dayOfMonth,
    localDateTime.hour,
    localDateTime.minute,
  )
}

export const fixOffsetISO = (
  value?: Date | string | number | null | undefined,
): Date | string | number | null | undefined => {
  const isoDate = /^\d\d\d\d-\d\d-\d\d$/
  if (value == undefined) {
    return '--'
  } else if (typeof value == 'string' && value.match(isoDate)) {
    return (value = value + 'T12:00:00')
  } else {
    return value
  }
}

export type DateOptions = {
  timeZone?: DateFormatOptions['timeZone']
  locale?: Intl.UnicodeBCP47LocaleIdentifier
}

type DateFormatOptions = Pick<
  Intl.DateTimeFormatOptions,
  'timeZone' | 'year' | 'month' | 'day' | 'hour' | 'minute' | 'hour12'
>

/**
 * Because some backend data timezone codes are not standard IANA,
 * we add a lookup table that replaces invalid values with their valid counterparts.
 */
const timeZoneMapping: Record<string, string> = {
  'Canada/Atlantic': 'America/Halifax',
  'Canada/Central': 'America/Winnipeg',
  'Canada/Eastern': 'America/Toronto',
  'Canada/Mountain': 'America/Edmonton',
  'Canada/Newfoundland': 'America/St_Johns',
  'Canada/Pacific': 'America/Vancouver',
}

const normalizeTimeZone = (
  timeZone: string | undefined,
): string | undefined => {
  if (!timeZone) return undefined
  return timeZoneMapping[timeZone] || timeZone
}

const formatter = (
  defaultOptions: DateFormatOptions,
  value?: Date | string | number | null,
  options?: DateOptions,
): string => {
  if (value === undefined || value === null) {
    return '--'
  }

  const theDate = new Date(value)
  if (isNaN(theDate.getTime())) {
    return '--'
  }

  const normalizedTimeZone = normalizeTimeZone(options?.timeZone)

  const mergedOptions: Intl.DateTimeFormatOptions = {
    ...defaultOptions,
    timeZone: normalizedTimeZone,
  }

  try {
    return theDate.toLocaleString(options?.locale, mergedOptions)
  } catch (error) {
    console.error('Date formatting failed:', error)
    return '--'
  }
}
/**
 * Format a date, time and timezone for display
 **/
export const formatFullDateTime = (
  value?: Date | string | number | null,
  options?: DateOptions,
): string => {
  const defaultOptions: DateFormatOptions = {
    year: '2-digit',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }

  return formatter(defaultOptions, value, options)
}

export const formatFullDate = (
  value?: Date | string | number | null,
  options?: DateOptions,
): string => {
  const defaultOptions: DateFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }

  return formatter(defaultOptions, value, options)
}

/* format a date with weekday (Mon, Tue, Wed, etc.)
  option to have year or not 
*/
export const formatShortDateWithWeekday = (
  value?: Date | string | number | null,
  options?: DateOptions,
): string => {
  const defaultOptions: DateFormatOptions = {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
  }
  return formatter(defaultOptions, value, options)
}

/** 
 * Get Weekday (Monday, Tuesday, Wednesday, etc.) 
 
*/
export const formatWeekday = (value: Date | string | number): string => {
  const date =
    typeof value == 'number' || typeof value == 'string'
      ? new Date(value)
      : value
  return format(date, 'EEEE')
}
/**
 * Format a date with month and year only.
 *
 * Used in: Trip Tracking
 **/
export const formatMonthYear = (
  value?: Date | string | number | null | undefined,
): string => {
  if (value == undefined) {
    return '--'
  }
  value = fixOffsetISO(value)
  const date =
    typeof value == 'number' || typeof value == 'string'
      ? new Date(value)
      : value
  return format(date, 'MMM yyyy')
}

/**
 * Format a time (no date) for display
 *
 * Used in: Trip Logs, Charging
 **/
export const formatShortTime = (value?: Date | string | number): string => {
  if (value == undefined) {
    return '--'
  }
  const date =
    typeof value == 'number' || typeof value == 'string'
      ? new Date(value)
      : value

  return format(date, 'h:mm a')
}

/** Add weekdays, skipping Saturday and Sunday
 *
 * TODO:UA:20240611 determine if this is actually needed
 **/
export const dateByAddingWeekdays = (date: Date, count: number): Date => {
  const result = new Date(date)
  for (let i = 0; i < count; i++) {
    const day = result.getDay()
    if (day === 6) {
      result.setDate(result.getDate() + 2)
    } else if (day === 5) {
      result.setDate(result.getDate() + 3)
    } else {
      result.setDate(result.getDate() + 1)
    }
  }
  return result
}

/**
 * Check any input against ISO 8601 date format.
 **/
export const isIsoDateString = (value: unknown): boolean => {
  if (typeof value !== 'string') return false

  const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/
  if (!isoDateRegex.test(value)) return false

  const date = new Date(value)
  return date.toISOString() === value
}
