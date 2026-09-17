'use client'

import { CONTACT_DESCRIPTOR } from '@/entities/contact'
import { ObjectDescriptorProvider } from '@/entities/object-descriptor'
import { ImportWizard } from '@/features/import-records'

export function ContactsImportView() {
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      <ObjectDescriptorProvider descriptor={CONTACT_DESCRIPTOR}>
        <ImportWizard />
      </ObjectDescriptorProvider>
    </div>
  )
}
