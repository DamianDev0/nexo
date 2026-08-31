'use client'

import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { useState } from 'react'

import { cn } from '@/shared/lib'

import { CHECKBOX_BOX_CLASSES, CheckboxMark } from './mark'

export { SmoothCheckboxGlyph } from './mark'

export interface CheckboxProps {
  'aria-label'?: string
  checked?: boolean
  defaultChecked?: boolean
  className?: string
  disabled?: boolean
  id?: string
  indeterminate?: boolean
  name?: string
  onCheckedChange?: (checked: boolean) => void
  required?: boolean
  value?: string
}

export function SmoothCheckbox({
  'aria-label': ariaLabel,
  checked,
  defaultChecked = false,
  indeterminate = false,
  onCheckedChange,
  disabled = false,
  className,
  name,
  value,
  id,
  required,
}: CheckboxProps) {
  const [internal, setInternal] = useState(defaultChecked)
  const isChecked = checked ?? internal

  const derivedState = indeterminate ? 'indeterminate' : isChecked ? 'checked' : 'unchecked'

  const handleChange = (state: boolean | 'indeterminate') => {
    if (state === 'indeterminate') {
      return
    }
    setInternal(state)
    onCheckedChange?.(state)
  }

  return (
    <CheckboxPrimitive.Root
      aria-checked={indeterminate ? 'mixed' : isChecked}
      aria-label={ariaLabel}
      checked={indeterminate ? 'indeterminate' : isChecked}
      className={cn(CHECKBOX_BOX_CLASSES, className)}
      data-slot="checkbox"
      disabled={disabled}
      id={id}
      name={name}
      onCheckedChange={handleChange}
      required={required}
      value={value}
    >
      <CheckboxPrimitive.Indicator
        className="grid place-content-center text-current"
        data-slot="checkbox-indicator"
        forceMount
      >
        <CheckboxMark state={derivedState} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
