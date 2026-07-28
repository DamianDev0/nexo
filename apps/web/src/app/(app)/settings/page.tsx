import { redirect } from 'next/navigation'

import { ROUTES } from '@/shared/config/routes'

export default function SettingsIndexPage() {
  redirect(ROUTES.app.settings.general)
}
