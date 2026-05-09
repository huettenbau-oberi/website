import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'

import type { Footer } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Logo } from '@/components/Logo/Logo'
import { SendIcon } from 'lucide-react'
// import { ThemeSelector } from '@/providers/Theme/ThemeSelector'


export async function Footer() {
  const footerData: Footer = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []

  return (
    <footer className="mt-auto border-t border-border bg-black dark:bg-card text-white">
      <div className="container py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <div>
          <Link className="flex items-center" href="/">
            <Logo />
          </Link>

          <button className="primary flex items-center mt-4">
            Kontakt <SendIcon className="size-4 ml-1 stroke-2" />
          </button>

          {/* <ThemeSelector /> */}
        </div>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          <nav className="flex flex-col md:flex-row gap-4">
            {navItems.map(({ link }, i) => {
              return <CMSLink className="text-white" key={i} {...link} />
            })}
          </nav>
        </div>
      </div>
      <div className="text-center py-4 text-sm">
        &copy; {new Date().getFullYear()} Hüttenbau Oberi. Alle Rechte vorbehalten.
      </div>
    </footer>
  )
}
