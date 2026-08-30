import { NextResponse, type NextRequest } from 'next/server'

import { ROUTES } from '@/shared/config/routes'
import { decideRoute } from '@/shared/lib/route-access'
import { isSessionActive } from '@/shared/lib/session-token'

const SESSION_COOKIE = 'access_token'

function dropStaleSession(response: NextResponse, stale: boolean): NextResponse {
  if (stale) response.cookies.delete(SESSION_COOKIE)
  return response
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const hasSession = isSessionActive(token)
  const stale = Boolean(token) && !hasSession
  const decision = decideRoute(request.nextUrl.pathname, hasSession)

  if (decision === 'redirect-login') {
    const loginUrl = new URL(ROUTES.auth.login, request.url)
    loginUrl.searchParams.set('from', request.nextUrl.pathname)
    return dropStaleSession(NextResponse.redirect(loginUrl), stale)
  }

  if (decision === 'redirect-dashboard') {
    if (request.nextUrl.searchParams.has('stale')) {
      return dropStaleSession(NextResponse.next(), true)
    }
    return NextResponse.redirect(new URL(ROUTES.app.dashboard, request.url))
  }

  return dropStaleSession(NextResponse.next(), stale)
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)'],
}
