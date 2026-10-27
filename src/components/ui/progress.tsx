"use client"

import * as React from "react"
import { cn } from "cn"
import { Progress as ProgressPrimitive } from "radix-ui"

function Progress({
  className,
  value,
  max = 100,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root>) {
  // Radix rejects values outside 0..max (e.g. spending over budget or a refund),
  // so clamp before passing it on and before drawing the bar.
  const clampedValue = value == null ? value : Math.min(Math.max(value, 0), max)

  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      value={clampedValue}
      max={max}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="size-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - ((clampedValue ?? 0) / max) * 100}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
