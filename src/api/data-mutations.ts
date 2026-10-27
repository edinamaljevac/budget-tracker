import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useGuardedMutation } from '@/hooks/use-guarded-mutation'
import { budgetQueries } from './budget-queries'
import { categoryQueries } from './category-queries'
import { resetData } from './mock-db'
import { transactionQueries } from './transaction-queries'

export function useResetData() {
  const queryClient = useQueryClient()
  return useGuardedMutation({
    mutationFn: resetData,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: transactionQueries.all() }),
        queryClient.invalidateQueries({ queryKey: categoryQueries.all() }),
        queryClient.invalidateQueries({ queryKey: budgetQueries.all() }),
      ])
      toast.success('Data reset')
    },
  })
}
