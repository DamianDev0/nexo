import { getT } from '@/shared/i18n/server'
import { BulkActionsView } from '@/views/bulk-actions'

import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()
  return { title: t('bulkActions.title') }
}

export default function BulkActionsPage() {
  return <BulkActionsView />
}
