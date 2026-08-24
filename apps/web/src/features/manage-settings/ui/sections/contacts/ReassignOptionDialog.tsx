'use client'

import { Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { useEntityTerms } from '@/entities/nomenclature'
import { ColorDot } from '@/shared/ui/atoms/color-dot'
import { AsyncSelect } from '@/shared/ui/molecules/async-select'
import { FieldError } from '@/shared/ui/molecules/field-error'
import { Button } from '@/shared/ui/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/shadcn/dialog'

import { useReassignForm } from '../../../model/useReassignForm'

import type { ReassignCandidate, ReassignSource } from '../../../model/types'

interface ReassignOptionDialogProps {
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly source: ReassignSource
  readonly candidates: ReadonlyArray<ReassignCandidate>
  readonly onConfirm: (toKey: string) => void
}

function candidateOption(candidate: ReassignCandidate) {
  return (
    <span className="flex items-center gap-2">
      <ColorDot color={candidate.color} className="size-2.5" />
      {candidate.label}
    </span>
  )
}

export function ReassignOptionDialog({
  open,
  onOpenChange,
  source,
  candidates,
  onConfirm,
}: Readonly<ReassignOptionDialogProps>) {
  const { t } = useTranslation()
  const terms = useEntityTerms('contact')
  const form = useReassignForm({ candidates, onConfirm })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('settings.reassign.title', { entities: terms.lowerPlural })}</DialogTitle>
          <DialogDescription>
            {t('settings.reassign.description', {
              count: source.count,
              name: source.label,
              entities: terms.lowerPlural,
            })}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.submit}>
          <Controller
            control={form.control}
            name="target"
            render={({ field, fieldState }) => (
              <div>
                <AsyncSelect
                  value={field.value}
                  onChange={field.onChange}
                  source={{
                    fetcher: () => Promise.resolve(candidates),
                    getValue: (candidate) => candidate.key,
                    preload: true,
                    filterFn: (candidate, query) =>
                      candidate.label.toLowerCase().includes(query.toLowerCase()),
                    renderOption: candidateOption,
                  }}
                  view={{
                    display: form.selected ? candidateOption(form.selected) : undefined,
                    placeholder: t('settings.reassign.target'),
                    searchPlaceholder: t('common.search'),
                    empty: t('common.noResults'),
                  }}
                />
                <FieldError message={fieldState.error?.message} />
              </div>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="destructive" disabled={!form.canSubmit}>
              {t('settings.reassign.confirm')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
