'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X, ZoomIn } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

import type { Props as MediaProps } from '../types'

import { Media } from '..'
import { VideoPlayer } from '../VideoPlayer'
import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

export const ZoomableMedia: React.FC<MediaProps> = (props) => {
  const { resource, imgClassName, fill, videoClassName, onVideoMeta } = props
  const [open, setOpen] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isInlineLoaded, setIsInlineLoaded] = useState(false)

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

  // Videos: ambient autoplay/muted loop inline, click → modal with VideoPlayer controls
  if (isVideo && typeof resource === 'object' && resource !== null) {
    const { filename, width, height } = resource
    const aspectRatio = width && height ? `${width} / ${height}` : '16 / 9'
    const src = getMediaUrl(`/media/${filename as string}`)

    // Constrain portrait videos in the modal so they don't overflow the viewport.
    const isPortrait = width != null && height != null && height > width
    const modalMaxWidth = isPortrait
      ? `min(80vw, calc(90vh * ${width} / ${height}))`
      : '80rem'

    return (
      <>
        <div
          role="button"
          tabIndex={0}
          aria-label="Video vergrößern"
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setOpen(true)
            }
          }}
          style={fill ? { position: 'absolute', inset: 0 } : undefined}
          className="group relative w-full cursor-zoom-in overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {fill ? (
            <video
              autoPlay
              loop
              muted
              playsInline
              className={cn('h-full w-full object-cover', videoClassName)}
              onLoadedMetadata={(e) => {
                const v = e.currentTarget
                onVideoMeta?.(v.videoWidth, v.videoHeight)
              }}
            >
              <source src={src} />
            </video>
          ) : (
            <div className="relative w-full">
              {!isInlineLoaded && (
                <div
                  className="absolute inset-0 animate-pulse bg-foreground/10 pointer-events-none"
                  style={{ aspectRatio }}
                />
              )}
              <video
                autoPlay
                loop
                muted
                playsInline
                className={cn('block w-full h-auto', videoClassName)}
                onCanPlay={() => setIsInlineLoaded(true)}
                onLoadedMetadata={(e) => {
                  const v = e.currentTarget
                  onVideoMeta?.(v.videoWidth, v.videoHeight)
                }}
              >
                <source src={src} />
              </video>
              {/* Overlay is inside the video wrapper so inset-0 is bounded to the video height */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                <div className="rounded-full bg-black/50 p-4 text-white">
                  <ZoomIn className="size-7" />
                </div>
              </div>
            </div>
          )}
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
              aria-label="Videovorschau"
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
                className="relative w-full"
                style={{ maxWidth: modalMaxWidth }}
              >
                <VideoPlayer resource={resource} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  // Images: click to open full-screen lightbox
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
        style={fill ? { position: 'absolute', inset: 0 } : undefined}
        className="relative cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Media {...props} enableZoom={false} onLoad={() => setIsInlineLoaded(true)} />
        {!isInlineLoaded && (
          <div className="absolute inset-0 animate-pulse bg-foreground/10 pointer-events-none" />
        )}
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
              className="relative flex max-h-full max-w-full cursor-default items-center justify-center"
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
