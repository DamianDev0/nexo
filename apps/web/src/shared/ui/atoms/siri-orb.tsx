'use client'

import { SIRI_ORB } from '@/shared/config/tokens/effects'
import { cn } from '@/shared/lib'

import type { CSSProperties } from 'react'

const TINY = 30
const SMALL = 50
const MEDIUM = 100

interface SiriOrbColors {
  readonly bg?: string
  readonly c1?: string
  readonly c2?: string
  readonly c3?: string
}

interface SiriOrbProps {
  readonly size?: number
  readonly animationDuration?: number
  readonly colors?: SiriOrbColors
  readonly className?: string
}

function scaled(
  size: number,
  smallFactor: number,
  smallMin: number,
  largeFactor: number,
  largeMin: number,
): number {
  return size < SMALL
    ? Math.max(size * smallFactor, smallMin)
    : Math.max(size * largeFactor, largeMin)
}

function maskRadius(size: number): string {
  if (size < TINY) return '0%'
  if (size < SMALL) return '5%'
  if (size < MEDIUM) return '15%'
  return '25%'
}

function contrast(size: number): number {
  const base = scaled(size, 0.004, 1.2, 0.008, 1.5)
  if (size < TINY) return 1.1
  if (size < SMALL) return Math.max(base * 1.2, 1.3)
  return base
}

export function SiriOrb({
  size = 192,
  animationDuration = 20,
  colors,
  className,
}: Readonly<SiriOrbProps>) {
  const palette = { ...SIRI_ORB.light, ...colors }
  const style = {
    width: size,
    height: size,
    '--siri-bg': palette.bg,
    '--siri-c1': palette.c1,
    '--siri-c2': palette.c2,
    '--siri-c3': palette.c3,
    '--siri-duration': `${animationDuration}s`,
    '--siri-blur': `${scaled(size, 0.008, 1, 0.015, 4)}px`,
    '--siri-contrast': contrast(size),
    '--siri-dot': `${scaled(size, 0.004, 0.05, 0.008, 0.1)}px`,
    '--siri-shadow': `${scaled(size, 0.004, 0.5, 0.008, 2)}px`,
    '--siri-mask': maskRadius(size),
  } as CSSProperties

  return (
    <div data-slot="siri-orb" aria-hidden className={cn('siri-orb', className)} style={style} />
  )
}
