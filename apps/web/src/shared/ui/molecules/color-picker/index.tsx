'use client'

import { SWATCH_PRESETS } from '@/shared/config/tokens/effects'
import { cn } from '@/shared/lib'
import { StaticNoise } from '@/shared/ui/atoms/static-noise'

import { DotsPattern } from '../dots-pattern'

import { PreviewColor, ColorSwatches, GrainSlider } from './color-picker-parts'
import { useArcColorPicker } from './useArcColorPicker'

import type { ColorOption } from './types'

interface ArcColorPickerProps {
  readonly selectedColor: string
  readonly onColorChange: (color: string) => void
  readonly grainIntensity: number
  readonly onGrainIntensityChange: (intensity: number) => void
  readonly colors?: ReadonlyArray<ColorOption>
  readonly className?: string
}

const DEFAULT_COLORS: ColorOption[] = [...SWATCH_PRESETS]

export function ArcColorPicker({
  selectedColor,
  onColorChange,
  grainIntensity,
  onGrainIntensityChange,
  colors = DEFAULT_COLORS,
  className,
}: ArcColorPickerProps) {
  const {
    hue,
    opacity,
    sliderRef,
    handleMouseDown,
    handleTouchStart,
    handleKeyDown,
    handleSwatchSelect,
  } = useArcColorPicker(onColorChange)

  return (
    <div
      className={cn(
        'w-full rounded-2xl bg-white/80 p-5 shadow-lg backdrop-blur-xl dark:bg-neutral-900',
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <PreviewColor color={selectedColor} intensity={grainIntensity} />

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
