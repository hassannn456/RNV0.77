const {
  parseDateObject,
  formatFullDateTime,
  formatFullDate,
  formatShortDateWithWeekday,
  dateByAddingWeekdays,
  isIsoDateString,
} = require('./dates')

it('Parses server date object', () => {
  const sampleDateObject = {
    year: 2023,
    month: 'OCTOBER',
    chronology: {
      calendarType: 'iso8601',
      id: 'ISO',
    },
    era: 'CE',
    leapYear: false,
    dayOfMonth: 3,
    monthValue: 10,
    dayOfWeek: 'TUESDAY',
    dayOfYear: 276,
  }
  const date = parseDateObject(sampleDateObject)
  const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'long' })
  const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long' })
  expect(dayFormatter.format(date).toUpperCase()).toBe(
    sampleDateObject.dayOfWeek,
  )
  expect(monthFormatter.format(date).toUpperCase()).toBe(sampleDateObject.month)
})

it('Parses string (ISO) date', () => {
  expect(formatFullDate('2026-12-10', { timeZone: 'UTC' })).toBe('Dec 10, 2026')
  expect(formatFullDate('2012-10-26', { timeZone: 'UTC' })).toBe('Oct 26, 2012')
})

// const spyEnUsOptions = jest
//   .spyOn(Date.prototype, 'toLocaleString')
//   .mockImplementation(function (locale, options) {
//     return originalToLocaleString.call(this, 'en-US', options)
//   })

// expect(formatFullDate(numLate, { timeZone: '+01' })).toBe('Dec 14, 2023')
// expect(formatFullDate(numMid, { timeZone: '+01' })).toBe('Dec 13, 2023')

// spyEnUsOptions.mockRestore()

const defaultFullDateOptions = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
}

const testFullDate = new Date()
it('Formats formatFullDate according to device locale seetings', () => {
  expect(formatFullDate(testFullDate)).toBe(
    testFullDate.toLocaleString(undefined, defaultFullDateOptions),
  )
  expect(formatFullDate(testFullDate, { locale: 'fr-CA' })).toBe(
    testFullDate.toLocaleString('fr-CA', defaultFullDateOptions),
  )
  expect(formatFullDate(testFullDate, { timeZone: 'UTC' })).toBe(
    testFullDate.toLocaleString(undefined, {
      timeZone: 'UTC',
      ...defaultFullDateOptions,
    }),
  )
})

const defaultFullDateTimeOptions = {
  year: '2-digit',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  hour12: true,
}

const testFullDateTime = new Date()
it('Formats formatFullDateTime according to device locale seetings', () => {
  expect(formatFullDateTime(testFullDateTime)).toBe(
    testFullDateTime.toLocaleString(undefined, defaultFullDateTimeOptions),
  )
  expect(formatFullDateTime(testFullDateTime, { locale: 'fr-CA' })).toBe(
    testFullDateTime.toLocaleString('fr-CA', defaultFullDateTimeOptions),
  )
  expect(formatFullDateTime(testFullDateTime, { timeZone: 'UTC' })).toBe(
    testFullDateTime.toLocaleString(undefined, {
      timeZone: 'UTC',
      ...defaultFullDateTimeOptions,
    }),
  )
})

const defaultShortDateWithWeekdayOptions = {
  weekday: 'short',
  month: 'short',
  day: '2-digit',
}
const testShortDateWithWeekday = new Date()
it('Formats formatShortDateWithWeekday according to device locale seetings', () => {
  expect(
    formatShortDateWithWeekday(testShortDateWithWeekday, {
      timeZone: 'UTC',
    }),
  ).toBe(
    testShortDateWithWeekday.toLocaleString(undefined, {
      ...defaultShortDateWithWeekdayOptions,
      timeZone: 'UTC',
    }),
  )
})

it('Skips Saturday and Sunday', () => {
  const currTuesday = new Date('2024-02-27')
  const nextTuesday = new Date('2024-03-05')
  // 5 work days
  expect(dateByAddingWeekdays(currTuesday, 5)).toStrictEqual(nextTuesday)
})

describe('isIsoDateString', () => {
  it('should return true for a valid ISO date string', () => {
    expect(isIsoDateString('2024-12-05T21:13:27.906Z')).toBe(true)
    expect(isIsoDateString('2024-01-01T00:00:00.000Z')).toBe(true)
  })

  it('should return false for a string not in ISO format', () => {
    expect(isIsoDateString('2024-12-05')).toBe(false) // No time component
    expect(isIsoDateString('21:13:27.906Z')).toBe(false) // No date component
    expect(isIsoDateString('random string')).toBe(false) // Random non-date string
    expect(isIsoDateString('')).toBe(false) // Empty string
  })

  it('should return false for non-string inputs', () => {
    expect(isIsoDateString(12345)).toBe(false) // Number
    expect(isIsoDateString(null)).toBe(false) // Null
    expect(isIsoDateString(undefined)).toBe(false) // Undefined
    expect(isIsoDateString({})).toBe(false) // Object
    expect(isIsoDateString([])).toBe(false) // Array
  })

  it('should return false for date objects and non-UTC formats', () => {
    expect(isIsoDateString(new Date())).toBe(false) // Date object
    expect(isIsoDateString('2024-12-05T21:13:27.906')).toBe(false) // No 'Z'
    expect(isIsoDateString('2024-12-05T21:13:27')).toBe(false) // No milliseconds or 'Z'
  })
})
