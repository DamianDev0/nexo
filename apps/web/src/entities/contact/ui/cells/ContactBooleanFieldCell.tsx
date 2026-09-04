'use client'

import { AnimatedToggle } from '@/shared/ui/smoothui/animated-toggle'

type ContactBooleanFieldCellProps = {
  readonly checked: boolean
  readonly label: string
  readonly onSave?: (checked: boolean) => void
}

export function ContactBooleanFieldCell({
  checked,
  label,
  onSave,
}: Readonly<ContactBooleanFieldCellProps>) {
  return (
    <AnimatedToggle
      size="sm"
      checked={checked}
      label={label}
      onChange={onSave}
      disabled={!onSave}
    />
  )
}
