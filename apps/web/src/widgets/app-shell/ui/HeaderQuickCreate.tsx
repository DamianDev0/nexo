'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useEntityLabels } from '@/entities/nomenclature'
import { PlusIcon } from '@/shared/ui/icons'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import GooeyPopover from '@/shared/ui/smoothui/gooey-popover'

import {
  QUICK_CREATE_PANEL_RADIUS,
  QUICK_CREATE_PANEL_WIDTH,
  QUICK_CREATE_TRIGGER_SIZE,
} from '../config/quick-create.constants'
import { buildQuickCreateItems } from '../lib/quick-create-items'

export function HeaderQuickCreate() {
  const { t } = useTranslation()
  const router = useRouter()
  const entityLabel = useEntityLabels()
  const [open, setOpen] = useState(false)

  const items = buildQuickCreateItems(entityLabel)

  const handleSelect = useCallback(
    (href: string) => {
      setOpen(false)
      router.push(href)
    },
    [router],
  )

  return (
    <HintTooltip asChild hint={t('quickCreate.label')} side="bottom">
      <span className="inline-flex">
        <GooeyPopover
          isOpen={open}
          onOpenChange={setOpen}
          side="bottom"
          align="end"
          sideOffset={10}
          triggerSize={QUICK_CREATE_TRIGGER_SIZE}
          contentWidth={QUICK_CREATE_PANEL_WIDTH}
          contentRadius={QUICK_CREATE_PANEL_RADIUS}
          bgClassName="bg-popover"
          surfaceClassName="border border-border/70 shadow-e3"
          contentClassName="p-1.5"
          trigger={
            <>
              <PlusIcon className="size-4 text-primary-deep dark:text-primary" />
              <span className="sr-only">{t('quickCreate.label')}</span>
            </>
          }
        >
          <p className="px-2 pb-2 pt-1 text-xs font-medium capitalize tracking-wider text-muted-foreground">
            {t('quickCreate.label')}
          </p>
          {items.map((item) => (
            <GroovyPopover.Item
              key={item.entity}
              disabled={!item.available}
              content={{
                label: item.label,
                icon: item.icon,
                trailing: item.available ? undefined : (
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {t('nav.comingSoon')}
                  </span>
                ),
              }}
              onSelect={() => handleSelect(item.href)}
            />
          ))}
        </GooeyPopover>
      </span>
    </HintTooltip>
  )
}
