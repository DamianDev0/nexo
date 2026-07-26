import { NextResponse, type NextRequest } from 'next/server'

import { ROUTES } from '@/shared/config/routes'
import { decideRoute } from '@/shared/lib/route-access'

const SESSION_COOKIE = 'access_token'

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE)
  const decision = decideRoute(request.nextUrl.pathname, hasSession)

  if (decision === 'redirect-login') {
    const loginUrl = new URL(ROUTES.auth.login, request.url)
    loginUrl.searchParams.set('from', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (decision === 'redirect-dashboard') {
    return NextResponse.redirect(new URL(ROUTES.app.dashboard, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/login'],
}
