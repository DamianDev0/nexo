'use client'

import { useTranslation } from 'react-i18next'

import { Text } from '@/shared/ui/atoms/text'
import { PlusIcon } from '@/shared/ui/icons'
import { GroovyPopover } from '@/shared/ui/molecules/groovy-popover'
import { HeaderIconButton } from '@/shared/ui/molecules/header-icon-button'
import { HintTooltip } from '@/shared/ui/molecules/hint-tooltip'

import { useQuickCreate } from '../model/useQuickCreate'

export function HeaderQuickCreate() {
  const { t } = useTranslation()
  const { open, setOpen, items, onSelect } = useQuickCreate()

  return (
    <GroovyPopover open={open} onOpenChange={setOpen}>
      <HintTooltip asChild hint={t('quickCreate.label')} side="bottom">
        <GroovyPopover.Trigger asChild>
          <HeaderIconButton aria-label={t('quickCreate.label')} aria-expanded={open}>
            <PlusIcon className="size-4 text-primary-deep dark:text-primary" />
          </HeaderIconButton>
        </GroovyPopover.Trigger>
      </HintTooltip>
      <GroovyPopover.Content side="bottom" align="end" sideOffset={10} className="w-52">
        <Text
          as="p"
          variant="hint"
          className="px-2 pt-1 pb-2 font-medium tracking-wider capitalize"
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
      </GroovyPopover.Content>
    </GroovyPopover>
  )
}
