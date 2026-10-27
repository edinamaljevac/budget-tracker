import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useGuardedMutation } from '@/hooks/use-guarded-mutation'
import { budgetQueries } from './budget-queries'
import { deleteBudget, saveBudget } from './budget-services'

export function useSaveBudget() {
  const queryClient = useQueryClient()
  return useGuardedMutation({
    mutationFn: saveBudget,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: budgetQueries.all() })
      toast.success('Budget saved')
    },
  })
}

export function useDeleteBudget() {
  const queryClient = useQueryClient()
  return useGuardedMutation({
    mutationFn: deleteBudget,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: budgetQueries.all() })
      toast.success('Budget removed')
    },
  })
}
