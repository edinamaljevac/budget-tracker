import {
  addMonths,
  formatDayLabel,
  formatMonthLabel,
  isInMonth,
  isValidDate,
  isValidMonth,
} from './date'

describe('isValidDate', () => {
  it.each(['2026-10-03', '2028-02-29', '2026-12-31'])('accepts %s', (date) => {
    expect(isValidDate(date)).toBe(true)
  })

  it.each(['2026-02-29', '2026-02-30', '2026-04-31', '2026-13-01', '2026-00-10', '2026-1-1', ''])(
    'rejects "%s"',
    (date) => {
      expect(isValidDate(date)).toBe(false)
    },
  )
})

describe('isValidMonth', () => {
  it('accepts YYYY-MM', () => {
    expect(isValidMonth('2026-10')).toBe(true)
  })

  it.each(['2026-13', '2026-00', '2026-1', '2026-10-01'])('rejects %s', (month) => {
    expect(isValidMonth(month)).toBe(false)
  })
})

describe('isInMonth', () => {
  it('matches dates on the first and last day of the month', () => {
    expect(isInMonth('2026-10-01', '2026-10')).toBe(true)
    expect(isInMonth('2026-10-31', '2026-10')).toBe(true)
  })

  it('does not match dates in the next or previous month', () => {
    expect(isInMonth('2026-09-30', '2026-10')).toBe(false)
    expect(isInMonth('2026-11-01', '2026-10')).toBe(false)
  })
})

describe('addMonths', () => {
  it.each([
    ['2026-10', 1, '2026-11'],
    ['2026-10', -1, '2026-09'],
    ['2026-12', 1, '2027-01'],
    ['2026-01', -1, '2025-12'],
  ])('%s %+i month is %s', (month, count, expected) => {
    expect(addMonths(month, count)).toBe(expected)
  })
})

describe('formatMonthLabel', () => {
  it('shows the month name and year', () => {
    expect(formatMonthLabel('2026-10')).toBe('October 2026')
  })
})

describe('formatDayLabel', () => {
  it('shows the short month and the day, without a time zone shift', () => {
    expect(formatDayLabel('2026-10-01')).toBe('Oct 1')
    expect(formatDayLabel('2026-12-31')).toBe('Dec 31')
  })
})
