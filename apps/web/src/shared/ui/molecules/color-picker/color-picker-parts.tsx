'use client'

import { cn } from '@/shared/lib'
import { StaticNoise } from '@/shared/ui/atoms/static-noise'

import type { ColorOption } from './types'

export function PreviewColor({
  color,
  intensity,
}: Readonly<{
  readonly color: string
  readonly intensity: number
}>) {
  return (
    <div className="flex justify-center">
      <div className="relative size-10 overflow-hidden rounded-full border-3 border-white shadow-lg shadow-neutral-400/50 dark:border-white/80 dark:shadow-none">
        <div className="z-10 size-full opacity-50" style={{ background: color }} />
        <StaticNoise
          opacity={intensity / 100}
          backgroundSize="150px"
          className="absolute inset-0 z-20 mix-blend-screen dark:mix-blend-multiply"
        />
      </div>
    </div>
  )
}

export function ColorSwatches({
  colors,
  selectedColor,
  onSelect,
}: Readonly<{
  readonly colors: ReadonlyArray<ColorOption>
  readonly selectedColor: string
  readonly onSelect: (color: ColorOption) => void
}>) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {colors.map((color) => (
        <button
          key={color.value}
          type="button"
          onClick={() => onSelect(color)}
          className={cn(
            'size-6 rounded-full transition-transform hover:scale-110',
            selectedColor === color.value
              ? 'border-2 border-white shadow-lg'
              : 'outline-transparent',
          )}
          style={{ background: color.value }}
          aria-label={`Select color ${color.value}`}
          aria-pressed={selectedColor === color.value}
        />
      ))}
    </div>
  )
}

export function GrainSlider({
  intensity,
  onChange,
}: Readonly<{
  readonly intensity: number
  readonly onChange: (v: number) => void
}>) {
  return (
    <div className="relative flex h-8 items-center">
      <svg className="h-5 w-full" viewBox="0 0 200 20">
        <title>Grain intensity</title>
        <path
          d="M0 10 Q 20 20, 40 10 T 80 10 T 120 10 T 160 10 T 200 10"
          fill="none"
          stroke="currentColor"
          className="text-neutral-300 dark:text-neutral-700"
          strokeWidth="2"
        />
      </svg>
      <input
        type="range"
        min="0"
        max="100"
        value={intensity}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
        aria-label="Grain intensity"
      />
      <div
        className="pointer-events-none absolute top-1/2 h-8 w-5 -translate-y-1/2 rounded-full border-2 border-neutral-400/20 bg-white shadow-md transition-all dark:bg-neutral-700"
        style={{ left: `calc(${intensity}% - 10px)` }}
      />
    </div>
  )
}
