'use client'

import { PlusIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'
import { Input } from '@/shared/ui/shadcn/input'

interface AddOptionInputProps {
  readonly form: {
    readonly value: string
    readonly onChange: (value: string) => void
    readonly onSubmit: () => void
  }
  readonly placeholder: string
  readonly label: string
  readonly disabled?: boolean
}

export function AddOptionInput({
  form,
  placeholder,
  label,
  disabled = false,
}: Readonly<AddOptionInputProps>) {
  return (
    <div className="mt-4 flex items-center gap-2">
      <Input
        className="h-9 max-w-xs text-sm"
        value={form.value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => form.onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            form.onSubmit()
          }
        }}
      />
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5"
        disabled={disabled}
        onClick={form.onSubmit}
      >
        <PlusIcon className="size-3.5" />
        {label}
      </Button>
    </div>
  )
}
