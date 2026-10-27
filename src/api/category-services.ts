import type { BudgetData, Category } from '@/types'
import { isCategoryNameTaken } from '@/utils/categories'
import { findIndexById, nextId, readData, simulateRequest, writeData } from './mock-db'

type CategoryInput = Omit<Category, 'id'>

function assertNameAvailable(data: BudgetData, name: string, exceptCategoryId?: number): void {
  if (isCategoryNameTaken(data.categories, name, exceptCategoryId)) {
    throw new Error('A category with this name already exists.')
  }
}

export function getCategories(): Promise<Category[]> {
  return simulateRequest(() => readData().categories, { isLoad: true })
}

export function createCategory(input: CategoryInput): Promise<Category> {
  return simulateRequest(() => {
    const data = readData()
    assertNameAvailable(data, input.name)

    const category = { id: nextId(data.categories), ...input }
    data.categories.push(category)
    writeData(data)
    return category
  })
}

export function updateCategory(category: Category): Promise<Category> {
  return simulateRequest(() => {
    const data = readData()
    const index = findIndexById(data.categories, category.id, 'Category')
    assertNameAvailable(data, category.name, category.id)

    data.categories[index] = category
    writeData(data)
    return category
  })
}

export function deleteCategory(id: number): Promise<void> {
  return simulateRequest(() => {
    const data = readData()
    findIndexById(data.categories, id, 'Category')
    if (data.transactions.some((transaction) => transaction.category_id === id)) {
      throw new Error('This category has transactions, so it cannot be deleted.')
    }

    data.categories = data.categories.filter((category) => category.id !== id)
    data.budgets = data.budgets.filter((budget) => budget.category_id !== id)
    writeData(data)
  })
}
