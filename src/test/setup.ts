import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { toast } from 'sonner'

// A save and the refresh after it take two simulated API calls of 500 ms each.
configure({ asyncUtilTimeout: 3000 })

// jsdom does not implement these browser APIs, but Radix components call them.
Element.prototype.hasPointerCapture ??= () => false
Element.prototype.releasePointerCapture ??= () => {}
Element.prototype.scrollIntoView ??= () => {}
window.scrollTo = () => {}
globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

afterEach(() => {
  cleanup()
  localStorage.clear()
  // Sonner keeps toasts in a module-level store and shows them again in the next test's Toaster.
  toast.dismiss()
})
