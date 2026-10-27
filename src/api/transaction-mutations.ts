import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useGuardedMutation } from '@/hooks/use-guarded-mutation'
import { transactionQueries } from './transaction-queries'
import { createTransaction, deleteTransaction, updateTransaction } from './transaction-services'

export function useCreateTransaction() {
  const queryClient = useQueryClient()
  return useGuardedMutation({
    mutationFn: createTransaction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: transactionQueries.all() })
      toast.success('Transaction added')
    },
  })
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient()
  return useGuardedMutation({
    mutationFn: updateTransaction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: transactionQueries.all() })
      toast.success('Changes saved')
    },
  })
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient()
  return useGuardedMutation({
    mutationFn: deleteTransaction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: transactionQueries.all() })
      toast.success('Transaction deleted')
    },
  })
}
