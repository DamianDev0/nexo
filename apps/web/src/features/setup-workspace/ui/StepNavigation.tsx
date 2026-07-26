'use client'

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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useTranslation } from 'react-i18next'

import { SidebarPreview } from './navigation/SidebarPreview'
import { SortableModule } from './navigation/SortableModule'
import { WizardStep, type WizardStepNav } from './WizardStep'

import type { SidebarModule } from '@repo/shared-types'

interface NavigationActions {
  readonly onToggle: (key: string) => void
  readonly onReorder: (activeKey: string, overKey: string) => void
}

interface StepNavigationProps {
  readonly data: ReadonlyArray<SidebarModule>
  readonly actions: NavigationActions
  readonly nav: WizardStepNav
}

export function StepNavigation({ data, actions, nav }: Readonly<StepNavigationProps>) {
  const { t } = useTranslation()
  const s = 'onboarding.steps.navigation'

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      actions.onReorder(String(active.id), String(over.id))
    }
  }

  return (
    <WizardStep
      header={{ badge: t(`${s}.badge`), title: t(`${s}.title`), description: t(`${s}.subtitle`) }}
      nav={{ ...nav, footerNote: t(`${s}.optionalNote`) }}
      aside={<SidebarPreview modules={data} />}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={data.map((m) => m.key)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-1.5">
            {data.map((module) => (
              <SortableModule key={module.key} module={module} onToggle={actions.onToggle} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </WizardStep>
  )
}
