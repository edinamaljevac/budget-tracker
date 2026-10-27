const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

const monthLabelFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
})

const dayLabelFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
})

export function isValidDate(value: string): boolean {
  const match = DATE_PATTERN.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))

  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  )
}

export function isValidMonth(value: string): boolean {
  return MONTH_PATTERN.test(value)
}

export function monthOf(date: string): string {
  return date.slice(0, 7)
}

export function isInMonth(date: string, month: string): boolean {
  return monthOf(date) === month
}

export function addMonths(month: string, count: number): string {
  const [year, monthNumber] = month.split('-').map(Number)
  const monthIndex = year * 12 + (monthNumber - 1) + count
  const newYear = Math.floor(monthIndex / 12)
  const newMonth = (monthIndex % 12) + 1
  return `${newYear}-${String(newMonth).padStart(2, '0')}`
}

export function getToday(): string {
  const today = new Date()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${today.getFullYear()}-${month}-${day}`
}

export function getCurrentMonth(): string {
  return monthOf(getToday())
}

export function formatMonthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number)
  return monthLabelFormatter.format(Date.UTC(year, monthNumber - 1, 1))
}

export function formatDayLabel(date: string): string {
  const [year, monthNumber, day] = date.split('-').map(Number)
  return dayLabelFormatter.format(Date.UTC(year, monthNumber - 1, day))
}
