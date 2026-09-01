'use client'

import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { PlusIcon } from '@/shared/ui/icons'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'
import GooeyPopover from '@/shared/ui/smoothui/gooey-popover'

import {
  QUICK_CREATE_PANEL_RADIUS,
  QUICK_CREATE_PANEL_WIDTH,
  QUICK_CREATE_TRIGGER_SIZE,
} from '../config/quick-create.constants'
import { useQuickCreate } from '../model/useQuickCreate'

export function HeaderQuickCreate() {
  const { t } = useTranslation()
  const { open, setOpen, items, onSelect } = useQuickCreate()

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
          <Text
            as="p"
            variant="hint"
            className="px-2 pb-2 pt-1 font-medium capitalize tracking-wider"
          >
            {t('quickCreate.label')}
          </Text>
          {items.map((item) => (
            <GroovyPopover.Item
              key={item.entity}
              disabled={!item.available}
              content={{
                label: item.label,
                icon: item.icon,
                trailing: item.available ? undefined : (
                  <Text variant="fine" className="shrink-0">
                    {t('nav.comingSoon')}
                  </Text>
                ),
              }}
              onSelect={() => onSelect(item.href)}
            />
          ))}
        </GooeyPopover>
      </span>
    </HintTooltip>
  )
}
