import { ContactsTable } from '@/features/manage-contacts'

export function ContactsView() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col px-9 py-8">
      <ContactsTable />
    </div>
  )
}
