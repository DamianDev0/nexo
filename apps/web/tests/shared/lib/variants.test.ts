import { describe, expect, it } from 'vitest'

import {
  DURATION,
  EASE_SMOOTH,
  fade,
  fadeSlideUp,
  gooeyPopover,
  gooeySpring,
  indicatorSpring,
  instant,
  quickEase,
  scaleUp,
  slideLeft,
  slideRight,
  smoothEase,
  smoothSpring,
  staggerChild,
  staggerContainer,
} from '@/shared/lib/animations/variants'

describe('animation variants', () => {
  it('defines the duration scale and smooth ease curve', () => {
    expect(DURATION).toEqual({ fast: 0.18, base: 0.25, slow: 0.35 })
    expect(EASE_SMOOTH).toEqual([0.25, 0.1, 0.25, 1])
  })

  it('fadeSlideUp moves up on enter and down on exit', () => {
    expect(fadeSlideUp).toEqual({
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -12 },
    })
  })

  it('fade only animates opacity', () => {
    expect(fade).toEqual({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    })
  })

  it('slideRight enters from the left edge and exits to the left', () => {
    expect(slideRight).toEqual({
      initial: { opacity: 0, x: 40 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -40 },
    })
  })

  it('slideLeft enters from the right edge and exits to the right', () => {
    expect(slideLeft).toEqual({
      initial: { opacity: 0, x: -40 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: 40 },
    })
  })

  it('scaleUp grows in and shrinks back out', () => {
    expect(scaleUp).toEqual({
      initial: { opacity: 0, scale: 0.96 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.96 },
    })
  })

  it('staggerContainer delays children with the expected timing', () => {
    expect(staggerContainer).toEqual({
      initial: {},
      animate: {
        transition: {
          staggerChildren: 0.06,
          delayChildren: 0.1,
        },
      },
    })
  })

  it('staggerChild fades and rises without an exit state', () => {
    expect(staggerChild).toEqual({
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
    })
    expect(staggerChild).not.toHaveProperty('exit')
  })

  it('smoothSpring carries the exact spring physics', () => {
    expect(smoothSpring).toEqual({ type: 'spring', stiffness: 260, damping: 28, mass: 0.8 })
  })

  it('smoothEase uses the slow duration with the smooth curve', () => {
    expect(smoothEase).toEqual({ duration: DURATION.slow, ease: EASE_SMOOTH })
  })

  it('quickEase uses the fast duration with the smooth curve', () => {
    expect(quickEase).toEqual({ duration: DURATION.fast, ease: EASE_SMOOTH })
  })

  it('indicatorSpring carries the exact bounce and duration', () => {
    expect(indicatorSpring).toEqual({ type: 'spring', bounce: 0.18, duration: 0.45 })
  })

  it('instant has zero duration', () => {
    expect(instant).toEqual({ duration: 0 })
  })

  it('gooeyPopover blurs in from above and blurs back out on exit', () => {
    expect(gooeyPopover).toEqual({
      initial: { opacity: 0, scale: 0.94, y: -8, filter: 'blur(8px)' },
      animate: { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' },
      exit: { opacity: 0, scale: 0.94, y: -8, filter: 'blur(8px)' },
    })
  })

  it('gooeySpring carries the exact bounce and duration', () => {
    expect(gooeySpring).toEqual({ type: 'spring', bounce: 0.24, duration: 0.36 })
  })
})
