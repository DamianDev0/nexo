'use client'

import { useState, useRef, useCallback } from 'react'

import type { ColorOption } from './types'

const KEYBOARD_STEP = 5

export function useArcColorPicker(onColorChange: (color: string) => void) {
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

  return {
    hue,
    opacity,
    sliderRef,
    handleMouseDown,
    handleTouchStart,
    handleKeyDown,
    handleSwatchSelect,
  }
}
