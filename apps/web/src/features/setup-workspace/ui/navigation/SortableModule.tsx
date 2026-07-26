import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Lock } from 'lucide-react'

import { cn } from '@/shared/lib'
import { Switch } from '@/shared/ui/shadcn/switch'

import { SIDEBAR_ICON_MAP } from '../../model/icon-map.constants'

import type { SidebarModule } from '@repo/shared-types'

interface SortableModuleProps {
  readonly module: SidebarModule
  readonly onToggle: (key: string) => void
}

export function SortableModule({ module, onToggle }: Readonly<SortableModuleProps>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: module.key,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const Icon = SIDEBAR_ICON_MAP[module.icon]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors',
        isDragging ? 'z-50 border-primary bg-accent shadow-lg' : 'border-border bg-card',
        !module.enabled && 'opacity-50',
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
        aria-label={`Drag ${module.label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-md',
          module.enabled ? 'bg-accent' : 'bg-muted',
        )}
      >
        {Icon ? <Icon className="size-4 text-accent-foreground" /> : null}
      </div>

      <div className="flex-1">
        <span className="text-sm font-medium text-foreground">{module.label}</span>
        {module.required && <span className="ml-2 text-xs text-muted-foreground">(required)</span>}
      </div>

      {module.required ? (
        <Lock className="size-3.5 text-muted-foreground/50" />
      ) : (
        <Switch
          checked={module.enabled}
          onCheckedChange={() => onToggle(module.key)}
          aria-label={`Toggle ${module.label}`}
        />
      )}
    </div>
  )
}
