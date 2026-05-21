'use client'

import { Check, Facebook, Instagram, Link } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { useState } from 'react'

export const PostHeroClient: React.FC = () => {
  const t = useTranslations()
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFacebookShare = () => {
    const url = encodeURIComponent(window.location.href)
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener')
  }

  return (
    <div className="flex items-center gap-4 shrink-0">
      <p className="text-[0.55rem] tracking-[0.2em] uppercase font-semibold text-background/50 font-sans m-0">
        {t('share')}
      </p>
      <div className="flex items-center gap-3">
        <a
          href="https://www.instagram.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-background/60 hover:text-background transition-colors"
          aria-label="Instagram"
        >
          <Instagram size={17} strokeWidth={1.5} />
        </a>
        <button
          onClick={handleFacebookShare}
          className="text-background/60 hover:text-background transition-colors bg-transparent p-0 cursor-pointer"
          aria-label="Auf Facebook teilen"
        >
          <Facebook size={17} strokeWidth={1.5} />
        </button>
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
