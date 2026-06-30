'use client'

import { Check, Link } from 'lucide-react'
import React, { useState } from 'react'

export const PostHeroClient: React.FC = () => {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-4 shrink-0">
      <p className="text-[0.55rem] tracking-[0.2em] uppercase font-semibold text-background/50 font-sans m-0">
        Teilen
      </p>
      <div className="flex items-center gap-3">
        <button
          onClick={handleCopyLink}
          className="text-background/60 hover:text-background transition-colors bg-transparent p-0 cursor-pointer"
          aria-label={copied ? 'Link kopiert' : 'Link kopieren'}
        >
          {copied ? <Check size={17} strokeWidth={1.5} /> : <Link size={17} strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  )
}
