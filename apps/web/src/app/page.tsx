import { redirect } from 'next/navigation'

import { ROUTES } from '@/shared/config/routes'

export default function RootPage() {
  redirect(ROUTES.app.dashboard)
}
