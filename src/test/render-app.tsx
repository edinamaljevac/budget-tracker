import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render } from '@testing-library/react'
import { routeTree } from '@/app/router'
import { createQueryClient } from '@/lib/query-client'

export function renderApp(url: string) {
  const history = createMemoryHistory({ initialEntries: [url] })
  const queryClient = createQueryClient()
  const router = createRouter({ routeTree, history, context: { queryClient } })
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { router, history, queryClient }
}
