'use client'

import { useTranslation } from 'react-i18next'

import { useEntityLabels } from '@/entities/nomenclature'
import { PillButton } from '@/shared/ui/atoms/pill-button'
import { EdgeCollapseButton } from '@/shared/ui/molecules/edge-collapse-button'
import { SplitButton } from '@/shared/ui/molecules/split-button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/shadcn/sheet'

import { useContactForm } from '../model/useContactForm'

import { ContactDuplicateNotice } from './ContactDuplicateNotice'
import { ContactFormFields } from './ContactFormFields'
import { CustomFieldsSection } from './CustomFieldsSection'

import type { ContactListItem } from '@repo/shared-types'

function focusFirstField(event: Event) {
  const panel = event.currentTarget
  if (!(panel instanceof HTMLElement)) return
  const field = panel.querySelector<HTMLInputElement>('input:not([type="hidden"]):not(:disabled)')
  if (!field) return
  event.preventDefault()
  field.focus()
}

type ContactFormSheetProps = {
  readonly contact: ContactListItem | null
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

export function ContactFormSheet({ contact, open, onOpenChange }: Readonly<ContactFormSheetProps>) {
  const { t } = useTranslation()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        onOpenAutoFocus={focusFirstField}
        className="w-full gap-0 overflow-visible sm:max-w-md"
      >
        <EdgeCollapseButton
          edge="left"
          label={t('contacts.form.hidePanel')}
          onClick={() => onOpenChange(false)}
        />
        <ContactFormBody
          key={contact?.id ?? 'new'}
          contact={contact}
          onClose={() => onOpenChange(false)}
        />
      </SheetContent>
    </Sheet>
  )
}

function ContactFormBody({
  contact,
  onClose,
}: Readonly<{ contact: ContactListItem | null; onClose: () => void }>) {
  const { t } = useTranslation()
  const entityLabel = useEntityLabels()
  const entity = entityLabel('contact', 'singular')
  const {
    form,
    taxonomy,
    customFields,
    isEdit,
    isPending,
    handleSubmit,
    submitAndAddAnother,
    duplicateNotice,
    confirmDuplicate,
    dismissDuplicate,
    probeField,
  } = useContactForm(contact, onClose)

  return (
    <>
      <SheetHeader className="gap-0.5 border-b border-border px-6 pb-4 pt-5">
        <SheetTitle className="text-lg font-bold tracking-[-0.01em]">
          {t(isEdit ? 'contacts.form.editTitle' : 'contacts.form.createTitle', { entity })}
        </SheetTitle>
        <SheetDescription className="text-xs text-muted-foreground">
          {t(isEdit ? 'contacts.form.editDescription' : 'contacts.form.createDescription')}
        </SheetDescription>
      </SheetHeader>
      <form
        className="flex min-h-0 flex-1 flex-col"
        onSubmit={(event) => {
          event.preventDefault()
          void handleSubmit(event)
        }}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <ContactFormFields
            control={form.control}
            setValue={form.setValue}
            taxonomy={taxonomy}
            onProbeField={(field) => {
              void probeField(field)
            }}
          />
          <CustomFieldsSection data={customFields} />
          <ContactDuplicateNotice
            notice={duplicateNotice}
            isEdit={isEdit}
            onConfirm={confirmDuplicate}
            onDismiss={dismissDuplicate}
          />
        </div>

        <SheetFooter className="flex-row items-center justify-end gap-2 border-t border-border px-6 py-3">
          <PillButton variant="ghost" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </PillButton>
          <SplitButton
            type="submit"
            disabled={isPending}
            label={t(isEdit ? 'contacts.form.submitEdit' : 'contacts.form.submitCreate', {
              entity,
            })}
            actions={
              isEdit
                ? []
                : [{ label: t('contacts.form.submitAndNew'), onSelect: submitAndAddAnother }]
            }
          />
        </SheetFooter>
      </form>
    </>
  )
}
