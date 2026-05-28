import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'
import { type NextRequest, NextResponse } from 'next/server'

const intlMiddleware = createMiddleware(routing)
const LOCALE_COOKIE = 'NEXT_LOCALE'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

function detectLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language') ?? ''
  const prefersGerman = acceptLanguage
    .split(',')
    .some(lang => lang.trim().split(';')[0].trim().toLowerCase().startsWith('de'))
  return prefersGerman ? 'de' : 'en'
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect /{locale}/home → /{locale} (or /home → /) so the active-page
  // check in the nav always sees the canonical root URL.
  if (pathname === '/home') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }
  for (const locale of routing.locales) {
    if (locale !== routing.defaultLocale && pathname === `/${locale}/home`) {
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}`
      return NextResponse.redirect(url)
    }
  }

  if (pathname === '/') {
    const url = request.nextUrl.clone()

    if (!request.cookies.has(LOCALE_COOKIE)) {
      const locale = detectLocale(request)

      if (locale !== routing.defaultLocale) {
        url.pathname = `/${locale}`
        const response = NextResponse.redirect(url)
        response.cookies.set(LOCALE_COOKIE, locale, { path: '/', maxAge: COOKIE_MAX_AGE })
        return response
      }

      url.pathname = `/${routing.defaultLocale}/home`
      const headers = new Headers(request.headers)
      headers.set('x-next-intl-locale', routing.defaultLocale)
      const response = NextResponse.rewrite(url, { request: { headers } })
      response.cookies.set(LOCALE_COOKIE, routing.defaultLocale, { path: '/', maxAge: COOKIE_MAX_AGE })
      return response
    }

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
