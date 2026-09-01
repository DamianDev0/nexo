'use client'

import { useTranslation } from 'react-i18next'

import { useModuleLabels } from '@/entities/nomenclature'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { Text } from '@/shared/ui/atoms/text'
import { MagnifyingGlassIcon } from '@/shared/ui/icons'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/shadcn/command'

import { useHeaderSearch } from '../model/useHeaderSearch'
import { useSidebarModules } from '../query/useSidebarModules'

export function HeaderSearch() {
  const { t } = useTranslation()
  const { open, setOpen, navigate } = useHeaderSearch()
  const groups = useSidebarModules()
  const moduleLabel = useModuleLabels()

  return (
    <>
      <PillButton
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-64 justify-start gap-2 px-2.5 font-normal text-muted-foreground hover:bg-muted/60 md:flex lg:w-80"
      >
        <MagnifyingGlassIcon className="size-3.5" />
        <Text variant="muted" className="flex-1 text-left">
          {t('nav.search')}
        </Text>
        <kbd className="pointer-events-none rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </PillButton>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t('nav.search')}
        description={t('nav.searchCommand')}
      >
        <CommandInput placeholder={t('nav.search')} />
        <CommandList>
          <CommandEmpty>{t('common.noResults')}</CommandEmpty>
          {groups.map((group) => (
            <CommandGroup key={group.key} heading={t(`nav.groups.${group.key}`)}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.key}
                  disabled={!item.available}
                  onSelect={() => navigate(item.url)}
                >
                  <item.icon />
                  <span>{moduleLabel(item.key, item.titleKey)}</span>
                  {!item.available && (
                    <Text variant="hint" className="ml-auto">
                      {t('nav.comingSoon')}
                    </Text>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
