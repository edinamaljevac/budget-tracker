import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addMonths, formatMonthLabel } from '@/utils/date'

type MonthSwitcherProps = {
  month: string
}

export function MonthSwitcher({ month }: MonthSwitcherProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 aria-live="polite" className="text-2xl font-semibold sm:text-4xl">
        {formatMonthLabel(month)}
      </h2>
      <nav aria-label="Month" className="flex gap-2">
        <Button asChild variant="outline" size="icon-lg">
          <Link
            to="/"
            search={(previous) => ({ ...previous, month: addMonths(month, -1) })}
            aria-label="Previous month"
          >
            <ChevronLeft aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="outline" size="icon-lg">
          <Link
            to="/"
            search={(previous) => ({ ...previous, month: addMonths(month, 1) })}
            aria-label="Next month"
          >
            <ChevronRight aria-hidden="true" />
          </Link>
        </Button>
      </nav>
    </div>
  )
}
