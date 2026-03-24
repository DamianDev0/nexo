'use client'

import { useTranslation } from 'react-i18next'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Lock } from 'lucide-react'
import type { SidebarModule } from '@repo/shared-types'

import { Switch } from '@/components/atoms/switch'
import { cn } from '@/utils'
import { SIDEBAR_ICON_MAP } from '../constants/icon-map.constants'
import { WizardStep } from './WizardStep'

/* ─── Sortable module row ──────────────────────────────────────── */

interface SortableModuleProps {
  readonly module: SidebarModule
  readonly onToggle: (key: string) => void
}

function SortableModule({ module, onToggle }: SortableModuleProps) {
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
      {/* Drag handle */}
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"
        aria-label={`Drag ${module.label}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>

      {/* Icon */}
      <div
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-md',
          module.enabled ? 'bg-accent' : 'bg-muted',
        )}
      >
        {Icon ? <Icon className="size-4 text-accent-foreground" /> : null}
      </div>

      {/* Label */}
      <div className="flex-1">
        <span className="text-sm font-medium text-foreground">{module.label}</span>
        {module.required && <span className="ml-2 text-xs text-muted-foreground">(required)</span>}
      </div>

      {/* Toggle or lock */}
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

/* ─── Sidebar preview ─────────────────────────────────────────── */

function SidebarPreview({ modules }: { readonly modules: SidebarModule[] }) {
  const enabledModules = modules.filter((m) => m.enabled)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">Sidebar preview</span>
        <span className="text-xs text-muted-foreground">
          {enabledModules.length} modules active
        </span>
      </div>

      <div className="overflow-hidden rounded-xl border border-border shadow-sm">
        {/* App bar */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-2.5">
          <div className="flex gap-1.5">
            <div className="size-2.5 rounded-full bg-red-400/80" />
            <div className="size-2.5 rounded-full bg-amber-400/80" />
            <div className="size-2.5 rounded-full bg-emerald-400/80" />
          </div>
          <div className="ml-4 flex-1 rounded-md bg-background/60 px-3 py-1 text-center text-xs text-muted-foreground">
            app.nexo.com
          </div>
        </div>

        <div className="flex min-h-72 bg-background">
          {/* Sidebar */}
          <div className="flex w-44 shrink-0 flex-col gap-0.5 border-r border-border bg-muted/30 p-2.5">
            {/* Logo */}
            <div className="mb-3 flex items-center gap-2 px-2">
              <div className="size-5 rounded bg-primary" />
              <span className="text-xs font-bold text-foreground">Nexo CRM</span>
            </div>

            {enabledModules.map((mod, i) => {
              const Icon = SIDEBAR_ICON_MAP[mod.icon]
              const isActive = i === 0
              return (
                <div
                  key={mod.key}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs transition-colors',
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground',
                  )}
                >
                  {Icon ? <Icon className="size-3.5" /> : null}
                  <span className={isActive ? 'font-medium' : ''}>{mod.label}</span>
                </div>
              )
            })}
          </div>

          {/* Content placeholder */}
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="h-2.5 w-28 rounded-full bg-foreground/15" />
            <div className="h-2 w-full rounded-full bg-muted-foreground/8" />
            <div className="h-2 w-3/4 rounded-full bg-muted-foreground/8" />
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="h-16 rounded-lg border border-border bg-card" />
              <div className="h-16 rounded-lg border border-border bg-card" />
              <div className="h-16 rounded-lg border border-border bg-card" />
            </div>
            <div className="mt-1 flex-1 rounded-lg border border-border bg-card" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Props ────────────────────────────────────────────────────── */

interface StepNavigationProps {
  readonly modules: SidebarModule[]
  readonly isPending: boolean
  readonly onToggle: (key: string) => void
  readonly onReorder: (activeKey: string, overKey: string) => void
  readonly onNext: () => void
  readonly onBack: () => void
}

/* ─── Component ────────────────────────────────────────────────── */

export function StepNavigation({
  modules,
  isPending,
  onToggle,
  onReorder,
  onNext,
  onBack,
}: StepNavigationProps) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.navigation'

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id))
    }
  }

  const preview = <SidebarPreview modules={modules} />

  return (
    <WizardStep
      badge={t(`${s}.badge`, 'Step 5 of 7')}
      title={t(`${s}.title`, 'Configure your sidebar')}
      description={t(
        `${s}.subtitle`,
        'Drag to reorder, toggle to show or hide. Required modules cannot be disabled.',
      )}
      aside={preview}
      onBack={onBack}
      onNext={onNext}
      isPending={isPending}
      footerNote={t(`${s}.optionalNote`, 'You can change this later in settings.')}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={modules.map((m) => m.key)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1.5">
            {modules.map((module) => (
              <SortableModule key={module.key} module={module} onToggle={onToggle} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </WizardStep>
  )
}
