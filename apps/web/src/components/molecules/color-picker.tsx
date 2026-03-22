import { cn } from '@/utils'

interface ColorPickerProps {
  readonly colors: ReadonlyArray<string>
  readonly selected: string
  readonly onChange: (color: string) => void
  readonly className?: string
}

export function ColorPicker({ colors, selected, onChange, className }: ColorPickerProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={cn(
            'size-8 rounded-full border-3 transition-transform duration-150',
            selected === color
              ? 'scale-110 border-foreground'
              : 'border-transparent hover:scale-105',
          )}
          style={{ background: color }}
          aria-label={`Select color ${color}`}
          aria-pressed={selected === color}
        />
      ))}
    </div>
  )
}
