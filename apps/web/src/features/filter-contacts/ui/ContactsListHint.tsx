'use client'

import { Text } from '@/shared/ui/atoms/text'
import { LightbulbIcon } from '@/shared/ui/icons'
import { RotatingText } from '@/shared/ui/molecules/rotating-text'

import { CONTACT_HINT_ROTATION_MS } from '../config/contact-hints.constants'

export function ContactsListHint({ hints }: Readonly<{ hints: ReadonlyArray<string> }>) {
  if (hints.length === 0) return null

  return (
    <Text variant="hint" className="flex min-w-0 items-center gap-1.5">
      <LightbulbIcon className="size-3.5 shrink-0 text-primary-deep dark:text-primary" />
      <RotatingText
        items={hints}
        intervalMs={CONTACT_HINT_ROTATION_MS}
        className="bg-gradient-to-r from-primary-deep to-primary-deep/75 bg-clip-text font-medium text-transparent dark:from-primary dark:to-primary/65"
      />
    </Text>
  )
}
