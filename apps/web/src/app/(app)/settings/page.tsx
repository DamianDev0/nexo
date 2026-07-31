import { redirect } from 'next/navigation'

import { ROUTES } from '@/shared/config/routes'

export default function Page() {
  redirect(ROUTES.app.settings.company)
}
