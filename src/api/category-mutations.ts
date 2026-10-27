import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useGuardedMutation } from '@/hooks/use-guarded-mutation'
import { budgetQueries } from './budget-queries'
import { categoryQueries } from './category-queries'
import { createCategory, deleteCategory, updateCategory } from './category-services'

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useGuardedMutation({
    mutationFn: createCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryQueries.all() })
      toast.success('Category added')
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useGuardedMutation({
    mutationFn: updateCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoryQueries.all() })
      toast.success('Category saved')
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useGuardedMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: categoryQueries.all() }),
        queryClient.invalidateQueries({ queryKey: budgetQueries.all() }),
      ])
      toast.success('Category deleted')
    },
  })
}
