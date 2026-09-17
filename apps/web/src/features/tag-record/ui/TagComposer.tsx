'use client'

import { useTranslation } from 'react-i18next'

import { TagOptionRow } from '@/entities/tag'
import { Text } from '@/shared/ui/atoms/text'
import { MagnifyingGlassIcon } from '@/shared/ui/icons'
import { buildComposerControlLabels, Composer } from '@/shared/ui/organisms/composer'

import { useTagPicker } from '../model/useTagPicker'

type TagComposerProps = {
  readonly record: { readonly id: string; readonly tags: readonly string[] }
  readonly name: string
  readonly onClose: () => void
}

export function TagComposer({ record, name, onClose }: Readonly<TagComposerProps>) {
  const { t } = useTranslation()
  const picker = useTagPicker(record, onClose)
  const controlLabels = buildComposerControlLabels(t)

  return (
    <Composer label={t('records.tags.title', { name })} onClose={onClose}>
      <Composer.StandardHeader title={t('records.tags.title', { name })} labels={controlLabels} />
      <Composer.Field label={<MagnifyingGlassIcon className="size-4" />}>
        <Composer.Input
          placeholder={t('records.tags.search')}
          value={picker.query}
          onChange={(event) => picker.setQuery(event.target.value)}
          autoFocus
        />
      </Composer.Field>
      <Composer.Body className="flex flex-col gap-0.5 py-2">
        {picker.options.length === 0 ? (
          <Text variant="muted" className="px-2 py-3">
            {t('records.tags.empty')}
          </Text>
        ) : (
          picker.options.map((option) => (
            <TagOptionRow key={option.name} option={option} onToggle={picker.toggle} />
          ))
        )}
      </Composer.Body>
      <Composer.Footer>
        <Text variant="hint">{t('records.tags.selected', { count: picker.selectedCount })}</Text>
        <Composer.Actions
          cancel={{ label: t('common.cancel'), onClick: onClose }}
          action={{
            label: t('records.tags.save'),
            onClick: picker.save,
            disabled: !picker.isDirty,
          }}
        />
      </Composer.Footer>
    </Composer>
  )
}
