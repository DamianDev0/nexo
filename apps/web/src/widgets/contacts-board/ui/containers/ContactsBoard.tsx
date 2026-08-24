'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

import { useContactsBoard } from '../../model/useContactsBoard'
import { ContactsTable } from '../ContactsTable'

const ContactFormSheet = dynamic(() =>
  import('@/features/create-contact').then((m) => m.ContactFormSheet),
)

const ContactPreviewSheet = dynamic(() =>
  import('@/entities/contact').then((m) => m.ContactPreviewSheet),
)

export function ContactsBoard() {
  const { instance, lists, state, actions, sheet, preview } = useContactsBoard()

  const [formMounted, setFormMounted] = useState(false)
  if (sheet.open && !formMounted) setFormMounted(true)

  const [previewMounted, setPreviewMounted] = useState(false)
  if (preview.open && !previewMounted) setPreviewMounted(true)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <ContactsTable instance={instance} lists={lists} state={state} actions={actions} />
      {formMounted && (
        <ContactFormSheet
          contact={sheet.contact}
          open={sheet.open}
          onOpenChange={sheet.onOpenChange}
        />
      )}
      {previewMounted && (
        <ContactPreviewSheet
          contact={preview.contact}
          open={preview.open}
          onOpenChange={preview.onOpenChange}
          onEdit={preview.onEdit}
          taxonomy={preview.taxonomy}
        />
      )}
    </div>
  )
}
