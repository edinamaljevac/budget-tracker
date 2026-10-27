import { buildCategory } from '@/test/factories'
import { createCategoryFormSchema } from './schema'

const groceries = buildCategory({ id: 1, name: 'Groceries' })
const rent = buildCategory({ id: 2, name: 'Rent' })
const schema = createCategoryFormSchema([groceries, rent])

function getNameError(name: string, exceptCategoryId?: number) {
  const result = createCategoryFormSchema([groceries, rent], exceptCategoryId).safeParse({
    name,
    color: '#123456',
  })
  return result.error?.issues[0]?.message
}

describe('createCategoryFormSchema', () => {
  it('trims the name before it is saved', () => {
    expect(schema.parse({ name: '  Pets  ', color: '#a1b2c3' })).toEqual({
      name: 'Pets',
      color: '#a1b2c3',
    })
  })

  it('accepts a name of exactly 30 characters', () => {
    expect(getNameError('a'.repeat(30))).toBeUndefined()
  })

  it('lets a category keep its own name in a different case when it is renamed', () => {
    expect(getNameError('GROCERIES', groceries.id)).toBeUndefined()
  })

  it.each([
    ['', 'Enter a name.'],
    ['   ', 'Enter a name.'],
    ['a'.repeat(31), 'Use 30 characters or fewer.'],
    ['groceries', 'A category with this name already exists.'],
    [' RENT ', 'A category with this name already exists.'],
  ])('rejects the name %j', (name, message) => {
    expect(getNameError(name)).toBe(message)
  })

  it('does not let a category take the name of another category', () => {
    expect(getNameError('Rent', groceries.id)).toBe('A category with this name already exists.')
  })

  it('rejects a color that is not a hex color', () => {
    expect(schema.safeParse({ name: 'Pets', color: 'blue' }).error?.issues[0]?.message).toBe(
      'Choose a color.',
    )
  })
})
