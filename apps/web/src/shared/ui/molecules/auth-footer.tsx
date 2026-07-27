'use client'

import Link from 'next/link'
import { useTranslation } from 'react-i18next'

export function AuthFooter() {
  const { t } = useTranslation()

  return (
    <p className="text-center text-xs text-muted-foreground">
      {t('auth.byContinuing')}{' '}
      <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
        {t('auth.terms')}
      </Link>{' '}
      {t('auth.and')}{' '}
      <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
        {t('auth.privacy')}
      </Link>
    </p>
  )
}
