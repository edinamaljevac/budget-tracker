import { getErrorMessage, type FallbackProps } from 'react-error-boundary'
import { useResetData } from '@/api/data-mutations'
import { StorageError } from '@/api/mock-db'
import { Button } from '@/components/ui/button'

export function LoadError({ error, resetErrorBoundary }: FallbackProps) {
  const resetData = useResetData()

  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-4 rounded-xl border border-destructive/30 bg-card p-5"
    >
      <p className="font-medium">{getErrorMessage(error) ?? 'Something went wrong.'}</p>
      {error instanceof StorageError ? (
        <Button
          disabled={resetData.isPending}
          onClick={() => resetData.mutate(undefined, { onSuccess: () => resetErrorBoundary() })}
        >
          {resetData.isPending ? 'Resetting data…' : 'Reset data'}
        </Button>
      ) : (
        <Button onClick={() => resetErrorBoundary()}>Try again</Button>
      )}
      {resetData.isError && (
        <p className="text-sm text-destructive">Could not reset your data. Please try again.</p>
      )}
    </div>
  )
}
