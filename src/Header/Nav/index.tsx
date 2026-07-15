'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Moon, Sun, X } from 'lucide-react'

import type { Header as HeaderType } from '@/payload-types'
import type { Page, Post } from '@/payload-types'

import { UserDropdown } from '@/components/UserDropdown'
import { Logo } from '@/components/Logo/Logo'
import { useTheme } from '@/providers/Theme'
import { cn } from '@/utilities/ui'

type NavLink = NonNullable<HeaderType['navItems']>[number]['link']

function resolveHref(link: NavLink): string | null {
  if (link.type === 'reference' && typeof link.reference?.value === 'object' && link.reference.value !== null) {
    const val = link.reference.value as Page | Post
    if (!val.slug) return null
    const prefix = link.reference.relationTo === 'pages' ? '' : `/${link.reference.relationTo}`
    return `${prefix}/${val.slug}`
  }
  return link.url ?? null
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const MENU_DIALOG_ID = 'site-menu-dialog'
const MENU_DIALOG_LABEL_ID = 'site-menu-dialog-label'

export const HeaderNav: React.FC<{ data: HeaderType; isPreview: boolean }> = ({
  data,
  isPreview,
}) => {
  const navItems = data?.navItems || []
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const menuLabel = 'Menü'
  const isDark = mounted && theme === 'dark'

  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  // Element that had focus before the dialog opened — focus returns here on close so the
  // user lands back where they were in the tab order rather than at the top of the page.
  const lastFocusedBeforeOpen = useRef<HTMLElement | null>(null)

  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (!dialogRef.current) return []
    return Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter((el) => !el.hasAttribute('inert') && el.getAttribute('aria-hidden') !== 'true')
  }, [])

  // Focus management when the dialog opens.
  useEffect(() => {
    if (!open) return
    lastFocusedBeforeOpen.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    // requestAnimationFrame so the dialog DOM is committed before we hand off focus.
    const raf = requestAnimationFrame(() => {
      closeButtonRef.current?.focus()
    })
    return () => cancelAnimationFrame(raf)
  }, [open])

  // Restore focus to the trigger when the dialog closes. Skip the initial render
  // (no prior focus to restore).
  useEffect(() => {
    if (open) return
    const previous = lastFocusedBeforeOpen.current
    if (!previous) return
    lastFocusedBeforeOpen.current = null
    // The trigger may have been re-rendered; prefer the live ref over the stale node
    // we captured on open. Falls back to the captured node if the ref isn't connected.
    const target = triggerRef.current ?? (previous.isConnected ? previous : null)
    target?.focus()
  }, [open])

  // ESC closes, Tab / Shift+Tab cycle within the dialog (focus trap).
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
      if (e.key !== 'Tab') return
      const focusables = getFocusableElements()
      if (focusables.length === 0) {
        e.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (e.shiftKey && (active === first || !dialogRef.current?.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (active === last || !dialogRef.current?.contains(active))) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, getFocusableElements])

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <nav className="flex items-center gap-1 sm:gap-4">
        {navItems.length > 0 && (
          <ul className="hidden xl:flex items-center gap-6 mr-2">
            {navItems.map(({ link }, i) => {
              const href = resolveHref(link)
              if (!href) return null
              return (
                <li key={i}>
                  <Link
                    href={href}
                    className={cn(
                      'text-sm font-bold tracking-widest uppercase transition-colors',
                      pathname === href ? 'text-foreground' : 'text-foreground/70 hover:text-foreground',
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}

        <button
          ref={triggerRef}
          onClick={() => setOpen(true)}
          className="xl:hidden inline-flex items-center px-1 sm:px-2 py-2 text-sm font-bold tracking-widest text-foreground transition-colors hover:text-primary"
          aria-expanded={open}
          aria-controls={MENU_DIALOG_ID}
          aria-haspopup="dialog"
        >
          {menuLabel.toUpperCase()}
        </button>

        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          className="hidden xl:flex relative h-9 w-9 overflow-hidden rounded-full transition-colors hover:text-primary text-foreground"
        >
          <Sun
            size={18}
            className={cn(
              'absolute inset-0 m-auto transition-all duration-300',
              isDark ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0',
            )}
          />
          <Moon
            size={18}
            className={cn(
              'absolute inset-0 m-auto transition-all duration-300',
              isDark ? '-rotate-90 opacity-0' : 'rotate-0 opacity-100',
            )}
          />
        </button>

        <UserDropdown isPreview={isPreview} />
      </nav>

      {/* Overlay */}
      {open && (
        <div
          ref={dialogRef}
          id={MENU_DIALOG_ID}
          className="fixed inset-0 z-50 flex flex-col"
          style={{ backgroundColor: '#3d2b24' }}
          data-theme="dark"
          role="dialog"
          aria-modal="true"
          aria-labelledby={MENU_DIALOG_LABEL_ID}
        >
          {/* Top bar */}
          <div className="container flex items-center justify-between py-6">
            <span
              id={MENU_DIALOG_LABEL_ID}
              className="text-sm font-bold tracking-widest text-white/50 uppercase"
            >
              {menuLabel}
            </span>
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="absolute left-1/2 -translate-x-1/2"
            >
              <Logo theme="light" loading="eager" priority="high" />
            </Link>
            <button
              ref={closeButtonRef}
              onClick={() => setOpen(false)}
              aria-label="Menü schließen"
              className="inline-flex h-11 w-11 items-center justify-center text-white/70 transition-colors hover:text-white"
            >
              <X size={28} />
            </button>
          </div>

          {/* Nav items */}
          <div className="flex flex-1 flex-col items-center justify-center gap-2">
            {navItems.map(({ link }, i) => {
              const href = resolveHref(link)
              if (!href) return null
              const isActive = pathname === href || (pathname === '/' && href === '/home')

              return (
                <Link
                  key={i}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="group relative flex items-center gap-3 px-6 py-2 text-2xl font-black tracking-[0.12em] text-white/80 uppercase transition-colors hover:text-white md:text-3xl"
                >
                  <ChevronRight
                    size={24}
                    className={cn(
                      'absolute -left-2 transition-opacity',
                      isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40',
                    )}
                  />
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Theme toggle */}
          <div className="container flex justify-center items-center gap-4 py-8">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="inline-flex items-center justify-center p-2 text-white/60 transition-colors hover:text-white"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
