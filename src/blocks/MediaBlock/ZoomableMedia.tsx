'use client'

import type { StaticImageData } from 'next/image'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import type { Media as MediaType } from '@/payload-types'

import { Media } from '@/components/Media'
import { cn } from '@/utilities/ui'

type Props = {
  resource?: MediaType | string | number | null
  staticImage?: StaticImageData
  imgClassName?: string
  showCaption?: boolean
  size?: string
}

export const ZoomableMedia: React.FC<Props> = ({
  resource,
  staticImage,
  imgClassName,
  showCaption,
  size,
}) => {
  const [open, setOpen] = useState(false)

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [open, close])

  if (isVideo) {
    return (
      <Media
        imgClassName={imgClassName}
        resource={resource}
        src={staticImage}
        showCaption={showCaption}
      />
    )
  }

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        aria-label="Bild vergrößern"
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className="cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-[0.8rem]"
      >
        <Media
          imgClassName={imgClassName}
          resource={resource}
          src={staticImage}
          showCaption={showCaption}
          size={size}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label="Bildvorschau"
            onClick={close}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm cursor-zoom-out p-4 sm:p-8"
          >
            <button
              type="button"
              onClick={close}
              aria-label="Schließen"
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            >
              <X className="size-6" />
            </button>
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-full max-w-full items-center justify-center"
            >
              <Media
                imgClassName={cn('max-h-[90vh] max-w-[90vw] w-auto h-auto rounded-lg', imgClassName)}
                resource={resource}
                src={staticImage}
                showCaption={showCaption}
                size="100vw"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
