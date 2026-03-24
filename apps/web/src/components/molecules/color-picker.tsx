'use client'

import { useState, useRef, useCallback } from 'react'

import { cn } from '@/utils'
import { DotsPattern } from './patterns/dots-pattern'
import { StaticNoise } from '@/components/atoms/static-noise'

/* ─── Types ────────────────────────────────────────────────────── */

interface ColorOption {
  readonly value: string
  readonly gradient?: boolean
}

interface ArcColorPickerProps {
  readonly selectedColor: string
  readonly onColorChange: (color: string) => void
  readonly grainIntensity: number
  readonly onGrainIntensityChange: (intensity: number) => void
  readonly colors?: ReadonlyArray<ColorOption>
  readonly className?: string
}

/* ─── Default swatches ─────────────────────────────────────────── */

const DEFAULT_COLORS: ColorOption[] = [
  { value: 'linear-gradient(45deg, #ff9a9e, #fad0c4)', gradient: true },
  { value: '#6B6E8D' },
  { value: 'linear-gradient(45deg, #ff9a9e, #fad0c4, #ffd1ff)', gradient: true },
  { value: 'linear-gradient(45deg, #f6d365, #fda085)', gradient: true },
  { value: 'linear-gradient(45deg, #84fab0, #8fd3f4)', gradient: true },
  { value: '#79E7D0' },
  { value: '#7AA2F7' },
]

const KEYBOARD_STEP = 5

/* ─── Sub-components ───────────────────────────────────────────── */

function PreviewColor({
  color,
  intensity,
}: {
  readonly color: string
  readonly intensity: number
}) {
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

function ColorSwatches({
  colors,
  selectedColor,
  onSelect,
}: {
  readonly colors: ReadonlyArray<ColorOption>
  readonly selectedColor: string
  readonly onSelect: (color: ColorOption) => void
}) {
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

function GrainSlider({
  intensity,
  onChange,
}: {
  readonly intensity: number
  readonly onChange: (v: number) => void
}) {
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

/* ─── Main component ───────────────────────────────────────────── */

export function ArcColorPicker({
  selectedColor,
  onColorChange,
  grainIntensity,
  onGrainIntensityChange,
  colors = DEFAULT_COLORS,
  className,
}: ArcColorPickerProps) {
  const [hue, setHue] = useState(0)
  const [opacity, setOpacity] = useState(100)
  const sliderRef = useRef<HTMLDivElement>(null)

  const handleSliderMove = useCallback(
    (event: MouseEvent | TouchEvent) => {
      if (!sliderRef.current) return

      const rect = sliderRef.current.getBoundingClientRect()
      const point = 'touches' in event ? event.touches[0] : event
      if (!point) return
      const clientX = point.clientX
      const clientY = point.clientY
      const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
      const newHue = Math.round(x * 360)
      const newOpacity = Math.round((1 - y) * 100)

      setHue(newHue)
      setOpacity(newOpacity)
      onColorChange(`hsla(${newHue}, 100%, 50%, ${newOpacity / 100})`)
    },
    [onColorChange],
  )

  function handleMouseDown(e: React.MouseEvent) {
    handleSliderMove(e.nativeEvent)
    const onMove = (ev: MouseEvent) => handleSliderMove(ev)
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  function handleTouchStart(e: React.TouchEvent) {
    handleSliderMove(e.nativeEvent)
    const onMove = (ev: TouchEvent) => handleSliderMove(ev)
    const onEnd = () => {
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onEnd)
    }
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onEnd, { passive: true })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    let newHue = hue
    let newOpacity = opacity

    switch (e.key) {
      case 'ArrowLeft':
        newHue = Math.max(0, hue - KEYBOARD_STEP)
        break
      case 'ArrowRight':
        newHue = Math.min(360, hue + KEYBOARD_STEP)
        break
      case 'ArrowUp':
        newOpacity = Math.min(100, opacity + KEYBOARD_STEP)
        break
      case 'ArrowDown':
        newOpacity = Math.max(0, opacity - KEYBOARD_STEP)
        break
      default:
        return
    }

    setHue(newHue)
    setOpacity(newOpacity)
    onColorChange(`hsla(${newHue}, 100%, 50%, ${newOpacity / 100})`)
  }

  function handleSwatchSelect(color: ColorOption) {
    onColorChange(color.value)
  }

  return (
    <div
      className={cn(
        'w-full rounded-2xl bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:bg-neutral-900',
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <PreviewColor color={selectedColor} intensity={grainIntensity} />

        {/* 2-axis hue/opacity slider */}
        <div
          ref={sliderRef}
          className="relative h-32 cursor-crosshair overflow-hidden rounded-md"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          tabIndex={0}
          aria-label={`Color picker — Hue: ${hue}, Opacity: ${opacity}%`}
          onKeyDown={handleKeyDown}
        >
          <div
            className="absolute inset-0 border-4 border-white/50 dark:border-black/50"
            style={{
              backgroundImage:
                'linear-gradient(90deg, oklch(90% 0.10 0), oklch(90% 0.10 60), oklch(90% 0.10 120), oklch(90% 0.10 180), oklch(90% 0.10 240), oklch(90% 0.10 300), oklch(90% 0.10 360))',
              maskImage: 'linear-gradient(to bottom, white, transparent)',
            }}
          />
          <DotsPattern className="absolute inset-0 fill-neutral-400/20" width={8} height={8} />
          <StaticNoise
            opacity={grainIntensity / 100 / 2}
            backgroundSize="200px"
            className="absolute inset-0 z-20 mix-blend-screen dark:mix-blend-multiply"
          />
          <div
            className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-lg dark:border-black"
            style={{ left: `${(hue / 360) * 100}%`, top: `${100 - opacity}%` }}
          />
        </div>

        <ColorSwatches
          colors={colors}
          selectedColor={selectedColor}
          onSelect={handleSwatchSelect}
        />
        <GrainSlider intensity={grainIntensity} onChange={onGrainIntensityChange} />
      </div>
    </div>
  )
}
