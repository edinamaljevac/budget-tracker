import { useRef, type RefObject } from 'react'

// Returns focus to the element that opened the dialog. That element can be gone when the dialog
// closes, for example a row that a save or delete removed, so focus then goes to the fallback.
export function useDialogFocus(fallbackRef: RefObject<HTMLElement | null>) {
  const openerRef = useRef<HTMLElement | null>(null)

  return {
    onOpenAutoFocus: () => {
      openerRef.current = document.activeElement as HTMLElement | null
    },
    onCloseAutoFocus: (event: Event) => {
      event.preventDefault()
      const opener = openerRef.current
      if (opener?.isConnected) opener.focus()
      else fallbackRef.current?.focus()
    },
  }
}
