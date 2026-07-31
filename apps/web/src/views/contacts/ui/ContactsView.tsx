import { ContactsTable } from '@/features/manage-contacts'

export function ContactsView() {
  return (
    <div className="flex min-h-full w-full flex-col">
      <ContactsTable />
    </div>
  )
}
