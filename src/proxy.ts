import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { type NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware(routing)

export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = `/${routing.defaultLocale}/home`
    const headers = new Headers(request.headers)
    headers.set('x-next-intl-locale', routing.defaultLocale)
    return NextResponse.rewrite(url, { request: { headers } })
  }
  return intlMiddleware(request)
}

export const config = {
  matcher: '/((?!admin|api|trpc|_next|_vercel|media|.*\\..*).*)',
}
