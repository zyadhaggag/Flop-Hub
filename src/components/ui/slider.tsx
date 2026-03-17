"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
  className?: string
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1 }, ref) => {
    return (
      <input
        type="range"
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={(e) => onValueChange([parseFloat(e.target.value)])}
        className={cn(
          "w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary",
          className
        )}
      />
    )
  }
)
Slider.displayName = "Slider"

export { Slider }
