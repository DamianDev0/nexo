'use client'

import { useTranslation } from 'react-i18next'

import { PillButton } from '@/shared/ui/atoms/pill-button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/shadcn/sheet'

import { useContactForm } from '../model/useContactForm'

import { ContactFormFields } from './ContactFormFields'

import type { ContactListItem } from '@repo/shared-types'

interface ContactFormSheetProps {
  readonly contact: ContactListItem | null
  readonly open: boolean
  readonly onOpenChange: (open: boolean) => void
}

export function ContactFormSheet({ contact, open, onOpenChange }: Readonly<ContactFormSheetProps>) {
  const { t } = useTranslation()
  const { form, isEdit, isPending, handleSubmit } = useContactForm(contact, () =>
    onOpenChange(false),
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 sm:max-w-md">
        <SheetHeader className="px-6 pt-6">
          <SheetTitle className="text-lg font-black tracking-[-0.02em]">
            {t(isEdit ? 'contacts.form.editTitle' : 'contacts.form.createTitle')}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
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
          <ContactFormFields control={form.control} />
          <SheetFooter className="mt-auto flex-row justify-end gap-2.5 px-0 pb-1 pt-6">
            <PillButton variant="ghost" size="md" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </PillButton>
            <PillButton type="submit" size="md" disabled={isPending}>
              {t(isEdit ? 'contacts.form.submitEdit' : 'contacts.form.submitCreate')}
            </PillButton>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
