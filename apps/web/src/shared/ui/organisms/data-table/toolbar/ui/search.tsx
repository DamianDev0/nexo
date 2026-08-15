'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/shared/lib/cn'
import { MagnifyingGlassIcon, XIcon } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/shadcn/button'

import {
  DATA_TABLE_SEARCH_COLLAPSED,
  DATA_TABLE_SEARCH_EXPANDED,
  DATA_TABLE_SEARCH_SPRING,
} from '../../config/table.constants'
import { useExpandableSearch } from '../model/use-expandable-search'

interface SearchInputProps {
  readonly value: string
  readonly placeholder: string
  readonly onChange: (value: string) => void
  readonly className?: string
}

export function DataTableSearch({
  value,
  placeholder,
  onChange,
  className,
}: Readonly<SearchInputProps>) {
  const { t } = useTranslation()
  const { open, toggle, containerRef, inputRef } = useExpandableSearch(value, onChange)
  const toggleLabel = t(open ? 'common.table.closeSearch' : 'common.table.search')

  return (
    <div
      ref={containerRef}
      data-slot="table-search"
      className={cn('relative shrink-0', className)}
      style={{ width: DATA_TABLE_SEARCH_COLLAPSED, height: DATA_TABLE_SEARCH_COLLAPSED }}
    >
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ width: DATA_TABLE_SEARCH_COLLAPSED, opacity: 0 }}
            animate={{ width: DATA_TABLE_SEARCH_EXPANDED, opacity: 1 }}
            exit={{ width: DATA_TABLE_SEARCH_COLLAPSED, opacity: 0 }}
            transition={DATA_TABLE_SEARCH_SPRING}
            className="absolute left-0 top-0 flex h-9 items-center overflow-hidden rounded-full border border-input bg-background shadow-xs"
          >
            <input
              ref={inputRef}
              type="search"
              value={value}
              placeholder={placeholder}
              onChange={(event) => onChange(event.target.value)}
              className="h-full w-full min-w-0 bg-transparent pl-10 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-expanded={open}
        aria-label={toggleLabel}
        onClick={toggle}
        className={cn(
          'absolute inset-0 z-10 size-9 rounded-full text-foreground/70 hover:bg-transparent hover:text-foreground',
          !open && 'border border-input bg-secondary hover:bg-secondary',
        )}
      >
        {open ? <XIcon className="size-4" /> : <MagnifyingGlassIcon className="size-4" />}
      </Button>
    </div>
  )
}
