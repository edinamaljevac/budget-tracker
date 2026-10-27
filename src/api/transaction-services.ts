import type { Transaction } from '@/types'
import {
  assertCategoryExists,
  findIndexById,
  nextId,
  readData,
  simulateRequest,
  writeData,
} from './mock-db'

export type TransactionInput = Omit<Transaction, 'id'>

export function getTransactions(): Promise<Transaction[]> {
  return simulateRequest(() => readData().transactions, { isLoad: true })
}

export function createTransaction(input: TransactionInput): Promise<Transaction> {
  return simulateRequest(() => {
    const data = readData()
    assertCategoryExists(data, input.category_id)

    const transaction = { id: nextId(data.transactions), ...input }
    data.transactions.push(transaction)
    writeData(data)
    return transaction
  })
}

export function updateTransaction(transaction: Transaction): Promise<Transaction> {
  return simulateRequest(() => {
    const data = readData()
    const index = findIndexById(data.transactions, transaction.id, 'Transaction')
    assertCategoryExists(data, transaction.category_id)

    data.transactions[index] = transaction
    writeData(data)
    return transaction
  })
}

export function deleteTransaction(id: number): Promise<void> {
  return simulateRequest(() => {
    const data = readData()
    findIndexById(data.transactions, id, 'Transaction')

    data.transactions = data.transactions.filter((transaction) => transaction.id !== id)
    writeData(data)
  })
}
