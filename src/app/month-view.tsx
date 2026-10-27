import { useRef, useState } from 'react'
import { MonthSwitcher } from '@/components/month-switcher'
import { BudgetFormDialog } from '@/features/budgets/components/budget-form-dialog'
import { getCategoriesWithoutBudget } from '@/features/budgets/utils'
import { CategorySpending } from '@/features/summary/components/category-spending'
import { SummaryTotals } from '@/features/summary/components/summary-totals'
import { calculateMonthlySummary } from '@/features/summary/utils'
import { TransactionsSection } from '@/features/transactions/components/transactions-section'
import type { Budget, Category, Transaction } from '@/types'

type MonthViewProps = {
  month: string
  transactions: Transaction[]
  categories: Category[]
  budgets: Budget[]
}

type BudgetDialogState = {
  open: boolean
  category: Category | null
  budgetCents: number | null
}

export function MonthView({ month, transactions, categories, budgets }: MonthViewProps) {
  const [budgetDialog, setBudgetDialog] = useState<BudgetDialogState>({
    open: false,
    category: null,
    budgetCents: null,
  })
  const spendingHeadingRef = useRef<HTMLHeadingElement>(null)

  const summary = calculateMonthlySummary(month, transactions, categories, budgets)
  const categoriesWithoutBudget = getCategoriesWithoutBudget(categories, budgets, month)

  return (
    <div className="flex flex-col gap-6">
      <MonthSwitcher month={month} />
      <SummaryTotals summary={summary} />

      <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <CategorySpending
          summaries={summary.categories}
          canSetBudget={categoriesWithoutBudget.length > 0}
          headingRef={spendingHeadingRef}
          onSetBudget={() => setBudgetDialog({ open: true, category: null, budgetCents: null })}
          onBudgetClick={(item) =>
            setBudgetDialog({
              open: true,
              category: item.category,
              budgetCents: item.budget?.budgetCents ?? null,
            })
          }
        />
        <TransactionsSection month={month} transactions={transactions} categories={categories} />
      </div>

      <BudgetFormDialog
        open={budgetDialog.open}
        onOpenChange={(open) => setBudgetDialog((previous) => ({ ...previous, open }))}
        month={month}
        category={budgetDialog.category}
        budgetCents={budgetDialog.budgetCents}
        availableCategories={categoriesWithoutBudget}
        fallbackFocusRef={spendingHeadingRef}
      />
    </div>
  )
}
