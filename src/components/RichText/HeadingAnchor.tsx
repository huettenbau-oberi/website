'use client'

import { Check, Link } from 'lucide-react'
import React, { useState } from 'react'
import { usePathname } from 'next/navigation'

type HeadingTag = 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

export function HeadingAnchor({
  tag: Tag,
  id,
  children,
  className,
  style,
}: {
  tag: HeadingTag
  id: string
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const pathname = usePathname()
  const isHomePage = pathname === '/' || pathname === '/home'

  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const base = window.location.href.split('#')[0]
    await navigator.clipboard.writeText(`${base}#${id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Tag
      id={id}
      className={['group relative', className].filter(Boolean).join(' ')}
      style={{ scrollMarginTop: 'calc(var(--header-height, 6rem) + 1rem)', ...style }}
    >
      {children}
      {!isHomePage && (
        <button
          onClick={handleCopy}
          aria-label={copied ? 'Link kopiert' : 'Link kopieren'}
          className="ml-2 inline-flex cursor-pointer items-center bg-transparent p-0 align-middle opacity-0 transition-opacity group-hover:opacity-100"
        >
          {copied ? (
            <Check size={15} strokeWidth={1.5} className="text-primary" />
          ) : (
            <Link size={15} strokeWidth={1.5} className="text-foreground/30 hover:text-foreground/70 transition-colors" />
          )}
        </button>
      )}
    </Tag>
  )
}
