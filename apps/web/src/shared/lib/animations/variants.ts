import type { Variants } from 'motion/react'

export const DURATION = {
  fast: 0.18,
  base: 0.25,
  slow: 0.35,
} as const

export const EASE_SMOOTH = [0.25, 0.1, 0.25, 1] as const

export const fadeSlideUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

export const fade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const slideRight: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

export const slideLeft: Variants = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
}

export const scaleUp: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
}

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

export const staggerChild: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

export const smoothSpring = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 28,
  mass: 0.8,
}

export const smoothEase = {
  duration: DURATION.slow,
  ease: EASE_SMOOTH,
}

export const quickEase = {
  duration: DURATION.fast,
  ease: EASE_SMOOTH,
}

export const indicatorSpring = {
  type: 'spring' as const,
  bounce: 0.18,
  duration: 0.45,
}

export const instant = { duration: 0 }

export const gooeyPopover: Variants = {
  initial: { opacity: 0, scale: 0.94, y: -8, filter: 'blur(8px)' },
  animate: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, scale: 0.94, y: -8, filter: 'blur(8px)' },
}

export const gooeySpring = {
  type: 'spring' as const,
  bounce: 0.24,
  duration: 0.36,
}
