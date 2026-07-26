import Link from 'next/link'

export function AuthFooter() {
  return (
    <p className="text-center text-xs text-muted-foreground">
      By continuing you accept our{' '}
      <Link href="/terms" className="underline underline-offset-2 hover:text-foreground">
        Terms
      </Link>{' '}
      and{' '}
      <Link href="/privacy" className="underline underline-offset-2 hover:text-foreground">
        Privacy
      </Link>
    </p>
  )
}
