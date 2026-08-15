'use client'

import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useDndReorder } from '@/shared/lib/hooks/useDndReorder'

import { groupModules } from '../lib/navigation'
import { useHighlightKey } from '../model/useHighlightKey'

import { ModuleRow } from './navigation/ModuleRow'
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
  const dnd = useDndReorder(actions.onReorder)
  const focus = useHighlightKey()

  const groups = groupModules(data)
  const activeModule = dnd.activeId ? data.find((m) => m.key === dnd.activeId) : null
  const rowActions = useMemo(
    () => ({ onToggle: actions.onToggle, onHover: focus.highlight, onLeave: focus.clear }),
    [actions.onToggle, focus.highlight, focus.clear],
  )

  return (
    <WizardStep
      header={{ badge: t(`${s}.badge`), title: t(`${s}.title`), description: t(`${s}.subtitle`) }}
      nav={{ ...nav, footerNote: t(`${s}.optionalNote`) }}
      aside={<SidebarPreview modules={data} highlightKey={focus.key} />}
    >
      <DndContext
        sensors={dnd.sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragStart={dnd.handleDragStart}
        onDragEnd={dnd.handleDragEnd}
        onDragCancel={dnd.handleDragCancel}
      >
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <div key={group.key}>
              <div className="mb-2 flex items-center gap-3 px-1">
                <p className="text-[11px] font-semibold tracking-wide text-muted-foreground">
                  {t(`nav.groups.${group.key}`)}
                </p>
                <div className="h-px flex-1 bg-border" />
              </div>
              <SortableContext
                items={group.modules.map((m) => m.key)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-1.5">
                  {group.modules.map((module) => (
                    <SortableModule key={module.key} module={module} actions={rowActions} />
                  ))}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
        <DragOverlay modifiers={[restrictToVerticalAxis]}>
          {activeModule ? <ModuleRow module={activeModule} actions={rowActions} ghost /> : null}
        </DragOverlay>
      </DndContext>
    </WizardStep>
  )
}
