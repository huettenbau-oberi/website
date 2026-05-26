'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import type { Props as MediaProps } from '../types'

import { Media } from '..'
import { cn } from '@/utilities/ui'

export const ZoomableMedia: React.FC<MediaProps> = (props) => {
  const { resource, imgClassName, fill } = props
  const [open, setOpen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const isVideo = typeof resource === 'object' && resource?.mimeType?.includes('video')

  const blurDataUrl =
    typeof resource === 'object' && resource !== null
      ? (resource.blurDataUrl ?? undefined)
      : undefined

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (open) setImageLoaded(false)
  }, [open])

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

  // Videos opt out of the zoom wrapper — clicking a video should stay default behaviour.
  // `enableZoom={false}` prevents Media from delegating back to ZoomableMedia.
  if (isVideo) {
    return <Media {...props} enableZoom={false} />
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
        // Mirror Media's `fill` mode on the wrapper so position:absolute children
        // (the <picture>) still resolve against the intended ancestor.
        style={fill ? { position: 'absolute', inset: 0 } : undefined}
        className="cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Media {...props} enableZoom={false} />
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
              <div className="relative">
                <Media
                  {...props}
                  enableZoom={false}
                  fill={false}
                  imgClassName={cn(
                    'max-h-[90vh] max-w-[90vw] w-auto h-auto rounded-lg',
                    imgClassName,
                  )}
                  size="100vw"
                  priority
                  onLoad={() => setImageLoaded(true)}
                />
                {blurDataUrl && (
                  <div
                    aria-hidden
                    className={cn(
                      'absolute inset-0 rounded-lg overflow-hidden transition-opacity duration-300 pointer-events-none',
                      imageLoaded ? 'opacity-0' : 'opacity-100',
                    )}
                  >
                    <img
                      src={blurDataUrl}
                      alt=""
                      className="w-full h-full object-cover blur-2xl scale-110"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
