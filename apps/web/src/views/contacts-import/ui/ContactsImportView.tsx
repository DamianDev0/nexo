import { ImportWizard } from '@/features/import-contacts'

export function ContactsImportView() {
  return (
    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col">
      <ImportWizard />
    </div>
  )
}
