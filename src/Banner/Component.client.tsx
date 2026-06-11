'use client'
import React, { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import RichText from '@/components/RichText'
import type { Banner } from '@/payload-types'

type Props = {
  data: Banner
}

export function BannerClient({ data }: Props) {
  // Start dismissed to avoid a flash; useEffect reveals it if not yet dismissed.
  const [dismissed, setDismissed] = useState(true)

  const storageKey = `banner-dismissed-${data.updatedAt}`

  useEffect(() => {
    if (!localStorage.getItem(storageKey)) {
      setDismissed(false)
    }
  }, [storageKey])

  if (dismissed || !data.text) return null

  return (
    <div
      className="w-full bg-primary py-2.5 [&_*]:!text-[#FFFFFF]"
      style={{ color: '#FFFFFF' }}
    >
      <div className="container flex items-center justify-center gap-2 text-sm [&_p]:inline [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:opacity-70">
        <RichText data={data.text} enableGutter={false} />
        <button
          onClick={() => {
            localStorage.setItem(storageKey, '1')
            setDismissed(true)
          }}
          className="shrink-0 p-1 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Banner schliessen"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
