# Budget Tracker

A personal budget tracker: record income and expenses, sort them into categories, set a monthly budget per category and see a summary for each month. One user, no login, all amounts in euros.

## Requirements

- Node.js 20.19+ or 22.12+ (required by Vite 8)
- pnpm 10 (`npm install -g pnpm`)

## Run

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

| Command         | What it does                                |
| --------------- | ------------------------------------------- |
| `pnpm dev`      | Starts the development server               |
| `pnpm test run` | Runs all tests once (`pnpm test` watches)   |
| `pnpm check`    | Runs ESLint and the Prettier check          |
| `pnpm build`    | Type-checks and builds the app into `dist/` |
| `pnpm preview`  | Serves the production build                 |

## Trying it out

- **Load error:** add `?fail=1` to the address, for example `http://localhost:5173/?fail=1`. Loading fails and the page shows **Try again**. Saving still works.
- **Reset data:** the **Reset data** button in the header restores the data from `src/data/budget-data.json` after a confirmation.
- Changes are saved in `localStorage` and survive a reload.

## Main decisions

- **Mock API in `src/api/`.** All data access is in one place: `mock-db.ts` reads and writes `localStorage` and simulates a 500 ms request, `<domain>-services.ts` has the async API functions, `<domain>-queries.ts` and `<domain>-mutations.ts` wrap them in TanStack Query. Features contain only UI and their own helpers.
- **Amounts in integer cents.** Amount strings are parsed to cents without floats (`src/utils/money.ts`), so `0.10 + 0.20` is exactly `0.30`. Amounts are formatted as `1,250.00 €`.
- **View state in the URL.** Month, filters and sort are search params validated by TanStack Router, so a reload or a shared link opens the same view.
- **Summary as a pure function.** `calculateMonthlySummary` builds totals and category spending from the month's transactions and budgets. Filters change only the list, and the summary updates when a mutation invalidates its data.
- **Dates as strings.** Dates stay `YYYY-MM-DD` strings and are formatted in UTC, so a date never moves to the day before or after.

## Structure

```text
src/
  api/          mock database, services, query factories and mutations
  app/          router, layout and pages
  components/   shared components (components/ui is shadcn/ui)
  features/     transactions, summary, budgets, categories
  hooks/        shared hooks
  lib/          query client and cn
  utils/        pure helpers for money, dates and category names
```
