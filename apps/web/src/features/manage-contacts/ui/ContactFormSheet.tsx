'use client'

import { useTranslation } from 'react-i18next'

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

import type { ContactListItem } from '@repo/shared-types'

interface ContactFormSheetProps {
  readonly contact: ContactListItem | null
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

export function ContactFormSheet({ contact, open, onOpenChange }: Readonly<ContactFormSheetProps>) {
  const { t } = useTranslation()
  const {
    form,
    taxonomy,
    isEdit,
    isPending,
    handleSubmit,
    submitAndAddAnother,
    duplicateNotice,
    confirmDuplicate,
    dismissDuplicate,
    probeField,
  } = useContactForm(contact, () => onOpenChange(false))

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent showCloseButton={false} className="w-full gap-0 overflow-visible sm:max-w-md">
        <EdgeCollapseButton
          edge="left"
          label={t('contacts.form.hidePanel')}
          onClick={() => onOpenChange(false)}
        />
        <SheetHeader className="gap-0.5 border-b border-border px-6 pb-4 pt-5">
          <SheetTitle className="text-lg font-bold tracking-[-0.01em]">
            {t(isEdit ? 'contacts.form.editTitle' : 'contacts.form.createTitle')}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {t(isEdit ? 'contacts.form.editDescription' : 'contacts.form.createDescription')}
          </SheetDescription>
        </SheetHeader>
        <form
          className="flex flex-1 flex-col overflow-y-auto px-6 py-5"
          onSubmit={(event) => {
            event.preventDefault()
            void handleSubmit(event)
          }}
        >
          <ContactFormFields
            control={form.control}
            setValue={form.setValue}
            taxonomy={taxonomy}
            onProbeField={(field) => {
              void probeField(field)
            }}
          />
          <ContactDuplicateNotice
            notice={duplicateNotice}
            isEdit={isEdit}
            onConfirm={confirmDuplicate}
            onDismiss={dismissDuplicate}
          />
          <SheetFooter className="-mx-6 -mb-5 mt-auto flex-row items-center justify-end gap-2 border-t border-border px-6 py-3">
            <PillButton variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </PillButton>
            <SplitButton
              type="submit"
              disabled={isPending}
              label={t(isEdit ? 'contacts.form.submitEdit' : 'contacts.form.submitCreate')}
              actions={
                isEdit
                  ? []
                  : [{ label: t('contacts.form.submitAndNew'), onSelect: submitAndAddAnother }]
              }
            />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
