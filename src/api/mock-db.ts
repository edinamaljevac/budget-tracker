import seedData from '@/data/budget-data.json'
import { budgetDataSchema, type BudgetData } from '@/types'

export const API_DELAY_MS = 500
export const STORAGE_KEY = 'budget-tracker-data'

const initialData = budgetDataSchema.parse(seedData)

export class StorageError extends Error {}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

export function readData(): BudgetData {
  const savedData = localStorage.getItem(STORAGE_KEY)
  if (savedData === null) return structuredClone(initialData)

  const result = budgetDataSchema.safeParse(parseJson(savedData))
  if (!result.success) {
    throw new StorageError("Your saved data can't be read. Reset the data to start again.")
  }
  return result.data
}

export function writeData(data: BudgetData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function shouldLoadingFail(): boolean {
  return new URLSearchParams(window.location.search).get('fail') === '1'
}

export async function simulateRequest<T>(action: () => T, { isLoad = false } = {}): Promise<T> {
  await new Promise((resolve) => setTimeout(resolve, API_DELAY_MS))
  if (isLoad && shouldLoadingFail()) {
    throw new Error('Could not load your data. Please try again.')
  }
  return action()
}

export function nextId(items: { id: number }[]): number {
  return Math.max(0, ...items.map((item) => item.id)) + 1
}

export function findIndexById(items: { id: number }[], id: number, label: string): number {
  const index = items.findIndex((item) => item.id === id)
  if (index === -1) throw new Error(`${label} not found.`)
  return index
}

export function assertCategoryExists(data: BudgetData, categoryId: number): void {
  if (!data.categories.some((category) => category.id === categoryId)) {
    throw new Error('The selected category does not exist.')
  }
}

export function resetData(): Promise<void> {
  return simulateRequest(() => localStorage.removeItem(STORAGE_KEY))
}
