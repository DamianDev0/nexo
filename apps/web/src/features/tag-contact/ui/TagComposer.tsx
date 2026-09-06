'use client'

import { useTranslation } from 'react-i18next'

import { contactFullName } from '@/entities/contact'
import { TagOptionRow } from '@/entities/tag'
import { Text } from '@/shared/ui/atoms/text'
import { MagnifyingGlassIcon } from '@/shared/ui/icons'
import { buildComposerControlLabels, Composer } from '@/shared/ui/organisms/composer'

import { useTagPicker } from '../model/useTagPicker'

import type { ContactListItem } from '@repo/shared-types'

type TagComposerProps = {
  readonly contact: ContactListItem
  readonly onClose: () => void
}

export function TagComposer({ contact, onClose }: Readonly<TagComposerProps>) {
  const { t } = useTranslation()
  const picker = useTagPicker(contact, onClose)
  const controlLabels = buildComposerControlLabels(t)
  const name = contactFullName(contact)

  return (
    <Composer label={t('contacts.composers.tags.title', { name })} onClose={onClose}>
      <Composer.StandardHeader
        title={t('contacts.composers.tags.title', { name })}
        labels={controlLabels}
      />
      <Composer.Field label={<MagnifyingGlassIcon className="size-4" />}>
        <Composer.Input
          placeholder={t('contacts.composers.tags.search')}
          value={picker.query}
          onChange={(event) => picker.setQuery(event.target.value)}
          autoFocus
        />
      </Composer.Field>
      <Composer.Body className="flex flex-col gap-0.5 py-2">
        {picker.options.length === 0 ? (
          <Text variant="muted" className="px-2 py-3">
            {t('contacts.composers.tags.empty')}
          </Text>
        ) : (
          picker.options.map((option) => (
            <TagOptionRow key={option.name} option={option} onToggle={picker.toggle} />
          ))
        )}
      </Composer.Body>
      <Composer.Footer>
        <Text variant="hint">
          {t('contacts.composers.tags.selected', { count: picker.selectedCount })}
        </Text>
        <Composer.Actions
          cancel={{ label: t('common.cancel'), onClick: onClose }}
          action={{
            label: t('contacts.composers.tags.save'),
            onClick: picker.save,
            disabled: !picker.isDirty || picker.isPending,
          }}
        />
      </Composer.Footer>
    </Composer>
  )
}
