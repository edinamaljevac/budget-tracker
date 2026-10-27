import { buildCategory } from '@/test/factories'
import { isCategoryNameTaken } from './categories'

const categories = [
  buildCategory({ id: 1, name: 'Groceries' }),
  buildCategory({ id: 2, name: 'Dining out' }),
]

describe('isCategoryNameTaken', () => {
  it('finds a duplicate name ignoring upper and lower case', () => {
    expect(isCategoryNameTaken(categories, 'groceries')).toBe(true)
    expect(isCategoryNameTaken(categories, 'DINING OUT')).toBe(true)
  })

  it('ignores spaces around the name', () => {
    expect(isCategoryNameTaken(categories, '  Groceries ')).toBe(true)
  })

  it('accepts a new name', () => {
    expect(isCategoryNameTaken(categories, 'Travel')).toBe(false)
  })

  it('lets a category keep its own name in a different case', () => {
    expect(isCategoryNameTaken(categories, 'GROCERIES', 1)).toBe(false)
  })

  it('does not let a category take the name of another category', () => {
    expect(isCategoryNameTaken(categories, 'groceries', 2)).toBe(true)
  })
})
