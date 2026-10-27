import { RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useResetData } from '@/api/data-mutations'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

export function ResetDataButton() {
  const [open, setOpen] = useState(false)
  const resetData = useResetData()
  const isResetting = resetData.isPending

  const handleOpenChange = (nextOpen: boolean) => {
    if (isResetting) return
    if (!nextOpen) resetData.reset()
    setOpen(nextOpen)
  }

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <RotateCcw aria-hidden="true" />
          Reset data
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset all data?</AlertDialogTitle>
          <AlertDialogDescription>
            Your transactions, categories and budgets go back to the data from the file. Your
            changes are lost.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {resetData.error && (
          <p role="alert" className="text-sm font-medium text-destructive">
            {resetData.error.message}
          </p>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isResetting}
            onClick={(event) => {
              event.preventDefault()
              resetData.mutate(undefined, { onSuccess: () => setOpen(false) })
            }}
          >
            {isResetting ? 'Resetting…' : 'Reset data'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
