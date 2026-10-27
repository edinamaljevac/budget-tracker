import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/render-app'

afterEach(() => {
  window.history.replaceState(null, '', '/')
})

describe('month in the URL', () => {
  it('opens on the month of the newest transaction and replaces the history entry', async () => {
    const { router, history } = renderApp('/')

    expect(await screen.findByRole('heading', { name: 'October 2026' })).toBeInTheDocument()
    expect(router.state.location.search).toEqual({ month: '2026-10' })
    expect(history.length).toBe(1)
  })

  it('opens on the month of the newest transaction when the month is not valid', async () => {
    const { router } = renderApp('/?month=2026-13')

    expect(await screen.findByRole('heading', { name: 'October 2026' })).toBeInTheDocument()
    expect(router.state.location.search).toEqual({ month: '2026-10' })
  })

  it('goes to the previous and next month and keeps the filters', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/?month=2026-10&type=expense')

    await user.click(await screen.findByRole('link', { name: 'Previous month' }))

    expect(await screen.findByRole('heading', { name: 'September 2026' })).toBeInTheDocument()
    expect(router.state.location.search).toEqual({ month: '2026-09', type: 'expense' })

    await user.click(screen.getByRole('link', { name: 'Next month' }))

    expect(await screen.findByRole('heading', { name: 'October 2026' })).toBeInTheDocument()
  })

  it('keeps a search text that looks like a number', async () => {
    const { router } = renderApp('/?month=2026-10&q=2026')

    expect(await screen.findByRole('heading', { name: 'October 2026' })).toBeInTheDocument()
    expect(router.state.location.search).toEqual({ month: '2026-10', q: '2026' })
  })

  it('keeps ?fail=1 when the user goes to another page', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/?month=2026-10&fail=1')

    await user.click(await screen.findByRole('link', { name: 'Categories' }))

    expect(await screen.findByRole('heading', { name: 'Categories' })).toBeInTheDocument()
    expect(router.state.location.search).toEqual({ fail: 1 })
  })
})

describe('loading with ?fail=1', () => {
  it('shows the error when the URL already contains a month', async () => {
    window.history.replaceState(null, '', '/?month=2026-10&fail=1')
    renderApp('/?month=2026-10&fail=1')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load your data. Please try again.',
    )
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument()
  })

  it('shows the error, and opens the month when the user tries again', async () => {
    const user = userEvent.setup()
    window.history.replaceState(null, '', '/?fail=1')
    renderApp('/?fail=1')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load your data. Please try again.',
    )

    window.history.replaceState(null, '', '/')
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Loading your data…')
    expect(await screen.findByRole('heading', { name: 'October 2026' })).toBeInTheDocument()
  })
})
