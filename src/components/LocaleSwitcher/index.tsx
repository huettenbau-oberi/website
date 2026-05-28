'use client'

import React from 'react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { locales } from '@/i18n/localization'
import { cn } from '@/utilities/ui'

export function LocaleSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()

  const switchLocale = (next: string) => router.replace(pathname, { locale: next })

  return (
    <div className="flex items-center gap-1 mt-4 text-xs font-bold tracking-widest">
      {locales.map((l, i) => {
        const code = typeof l === 'object' ? l.code : l
        const isActive = locale === code
        return (
          <React.Fragment key={code}>
            {i > 0 && (
              <span aria-hidden="true" className="text-white/40">|</span>
            )}
            <button
              onClick={() => switchLocale(code)}
              disabled={isActive}
              aria-label={`Switch to ${code.toUpperCase()}`}
              className={cn(
                'inline-flex items-center justify-center px-1 py-1 uppercase transition-colors',
                isActive ? 'text-white cursor-default' : 'text-white/50 hover:text-white',
              )}
            >
              {code}
            </button>
          </React.Fragment>
        )
      })}
    </div>
  )
}
