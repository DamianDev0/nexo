'use client'

import { closestCenter, DndContext, DragOverlay } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import {
  groupModules,
  ModuleRow,
  SidebarPreview,
  SortableModule,
  useHighlightKey,
} from '@/features/setup-workspace'
import { useDndReorder } from '@/shared/lib/hooks/useDndReorder'
import { TooltipProvider } from '@/shared/ui/shadcn/tooltip'

import { useManageSettings } from '../../model/settings-context'

export function NavigationSettings() {
  const { t } = useTranslation()
  const { navigation } = useManageSettings()
  const modules = useWatch({ control: navigation.control, name: 'modules' })
  const dnd = useDndReorder(navigation.handleReorder)
  const focus = useHighlightKey()

  const groups = groupModules(modules)
  const activeModule = dnd.activeId ? modules.find((module) => module.key === dnd.activeId) : null
  const rowActions = useMemo(
    () => ({ onToggle: navigation.handleToggle, onHover: focus.highlight, onLeave: focus.clear }),
    [navigation.handleToggle, focus.highlight, focus.clear],
  )

  return (
    <div className="flex flex-col gap-6 xl:flex-row xl:gap-8">
      <div className="w-full xl:max-w-md">
        <TooltipProvider delayDuration={400}>
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
        </TooltipProvider>
      </div>

      <div className="w-full xl:sticky xl:top-6 xl:flex-1 xl:self-start">
        <SidebarPreview modules={modules} highlightKey={focus.key} />
      </div>
    </div>
  )
}
