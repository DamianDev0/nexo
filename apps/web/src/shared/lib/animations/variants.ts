import type { Variants } from 'motion/react'

/**
 * Smooth fade + slide up transition for page-level content.
 * Use with PageTransition component or directly with motion components.
 */
export const fadeSlideUp: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

/**
 * Simple fade in/out without movement.
 */
export const fade: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * Slide in from the right — useful for forward navigation.
 */
export const slideRight: Variants = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
}

/**
 * Slide in from the left — useful for backward navigation.
 */
export const slideLeft: Variants = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 40 },
}

/**
 * Scale up from slightly smaller — good for modals, cards appearing.
 */
export const scaleUp: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
}

/**
 * Stagger children animation — apply to parent container.
 * Children should use any of the above variants individually.
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

/**
 * Individual stagger child — use inside a staggerContainer parent.
 */
export const staggerChild: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

/** Default spring transition for smooth, natural-feeling animations */
export const smoothSpring = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 28,
  mass: 0.8,
}

/** Default ease transition — lighter than spring, good for fades */
export const smoothEase = {
  duration: 0.35,
  ease: [0.25, 0.1, 0.25, 1] as const,
}
