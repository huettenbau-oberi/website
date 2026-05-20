import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'

import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { SendIcon } from 'lucide-react'
import { getLocale } from 'next-intl/server'
import type { TypedLocale } from 'payload'

export async function Footer() {
  const locale = (await getLocale()) as TypedLocale
  const footerData = (await getCachedGlobal('footer', 1, locale)()) as Footer

  const navItems = footerData?.navItems || []
  const legalItems = footerData?.legalItems || []

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <div>
          <Link className="flex items-center" href="/" data-theme="dark">
            <Logo />
          </Link>
          {legalItems.length > 0 && (
            <div className="flex items-center flex-wrap gap-x-1 mt-2 text-sm">
              {legalItems.map(({ link }, i) => (
                <span key={i} className="flex items-center gap-x-1">
                  {i > 0 && (
                    <span aria-hidden="true" className="text-white/60">
                      |
                    </span>
                  )}
                  <CMSLink
                    className="text-white/70 hover:text-white transition-colors"
                    {...link}
                  />
                </span>
              ))}
            </div>
          )}

          <button className="primary flex items-center mt-6">
            Kontakt <SendIcon className="size-4 ml-1 stroke-2" />
          </button>
        </div>

        <div className="flex flex-col items-start md:flex-row gap-8">
          {navItems.map(({ title, links }, i) => (
            <div key={i} className="flex flex-col gap-1">
              <span className="font-semibold text-white text-sm uppercase tracking-wide">
                {title}
              </span>
              <nav className="flex flex-col">
                {(links || []).map(({ link }, j) => (
                  <CMSLink
                    className="text-white/70 hover:text-white transition-colors text-sm"
                    key={j}
                    {...link}
                  />
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center py-4 text-sm text-white/50">
        &copy; {new Date().getFullYear()} Hüttenbau Oberi. Alle Rechte vorbehalten.
        {process.env.NEXT_PUBLIC_BUILD_VERSION && (
          <span className="ml-4 text-white/60">{process.env.NEXT_PUBLIC_BUILD_VERSION}</span>
        )}
      </div>
    </footer>
  )
}
