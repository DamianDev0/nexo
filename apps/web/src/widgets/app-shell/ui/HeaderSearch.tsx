'use client'

import { Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@/shared/ui/shadcn/button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/shadcn/command'

import { useHeaderSearch } from '../model/useHeaderSearch'
import { useSidebarModules } from '../model/useSidebarModules'

export function HeaderSearch() {
  const { t } = useTranslation()
  const { open, setOpen, navigate } = useHeaderSearch()
  const groups = useSidebarModules()

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-64 justify-start gap-2 px-2.5 font-normal text-muted-foreground hover:bg-muted/60 md:flex lg:w-80"
      >
        <Search className="size-3.5" />
        <span className="flex-1 text-left text-sm">{t('nav.search')}</span>
        <kbd className="pointer-events-none rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} title={t('nav.search')}>
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
                  <span>{t(item.titleKey)}</span>
                  {!item.available && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      {t('nav.comingSoon')}
                    </span>
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
