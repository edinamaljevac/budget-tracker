import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { useRef } from 'react'

type GuardedMutationOptions<TData, TVariables> = Omit<
  UseMutationOptions<TData, Error, TVariables>,
  'onSettled'
>

// isPending updates only after a re-render, so a quick second click or Enter would still get through.
export function useGuardedMutation<TData, TVariables>(
  options: GuardedMutationOptions<TData, TVariables>,
) {
  const isRunningRef = useRef(false)
  const mutation = useMutation({
    ...options,
    onSettled: () => {
      isRunningRef.current = false
    },
  })

  const mutate: typeof mutation.mutate = (...args) => {
    if (isRunningRef.current) return
    isRunningRef.current = true
    mutation.mutate(...args)
  }

  return { ...mutation, mutate }
}
