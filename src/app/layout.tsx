import { Link, Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'
import { ResetDataButton } from '@/components/reset-data-button'

const NAV_LINK_CLASS_NAME =
  'rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:bg-secondary aria-[current=page]:text-foreground'

export function Layout() {
  return (
    <>
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <p className="font-heading text-xl font-semibold">Budget Tracker</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <nav aria-label="Main">
              <ul className="flex gap-1">
                <li>
                  <Link
                    to="/"
                    activeOptions={{ exact: true, includeSearch: false }}
                    className={NAV_LINK_CLASS_NAME}
                  >
                    Overview
                  </Link>
                </li>
                <li>
                  <Link
                    to="/categories"
                    activeOptions={{ includeSearch: false }}
                    className={NAV_LINK_CLASS_NAME}
                  >
                    Categories
                  </Link>
                </li>
              </ul>
            </nav>
            <ResetDataButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
      <Toaster position="bottom-center" style={{ fontFamily: 'inherit' }} />
    </>
  )
}
