'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CalendarClock, Hammer } from 'lucide-react'

import type { InArbeitBlock as InArbeitBlockProps } from '@/payload-types'

/* Pivot sits on the handle end of the lucide hammer glyph (~18%/82% of its
   24px box) so the head swings while the grip stays put. */
const keyframes = `
@keyframes inArbeitHammer {
  0%, 52%, 100% { transform: rotate(0deg); }
  62% { transform: rotate(-30deg); }
  72% { transform: rotate(12deg); }
  80% { transform: rotate(-6deg); }
  86% { transform: rotate(0deg); }
}
`

const tapeStyle: React.CSSProperties = {
  backgroundImage:
    'repeating-linear-gradient(-45deg, hsl(var(--primary)) 0 14px, hsl(var(--background)) 14px 28px)',
}

export const InArbeitBlockComponent: React.FC<InArbeitBlockProps> = ({
  title,
  message,
  progress,
  eta,
}) => {
  const clamped = typeof progress === 'number' ? Math.min(100, Math.max(0, progress)) : null

  return (
    <section className="w-full bg-card text-card-foreground">
      <style>{keyframes}</style>

      <div aria-hidden className="h-2.5" style={tapeStyle} />

      <motion.div
        className="container py-14 text-center"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Hammer
            aria-hidden
            className="h-7 w-7"
            style={{
              transformOrigin: '18% 82%',
              animation: 'inArbeitHammer 2.6s ease-in-out infinite',
            }}
          />
        </div>

        <h2 className="mb-3">{title}</h2>

        {message && <p className="mx-auto mb-0 max-w-[34rem] text-muted-foreground">{message}</p>}

        {clamped !== null && (
          <div className="mx-auto mt-10 w-full max-w-md">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Baufortschritt
              </span>
              <span className="text-sm font-bold tabular-nums">{clamped} %</span>
            </div>
            {/* Same idiom as the GalleryTimeline rail: hairline border track,
                3px solid primary fill, node dot marking the current position. */}
            <div
              className="relative flex h-4 items-center"
              role="progressbar"
              aria-label="Baufortschritt"
              aria-valuenow={clamped}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="h-px w-full bg-border" />
              <motion.div
                className="absolute left-0 flex items-center"
                initial={{ width: '0%' }}
                whileInView={{ width: `${clamped}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="h-[3px] w-full bg-primary" />
                <div className="absolute right-0 h-4 w-4 translate-x-1/2 rounded-full border-4 border-primary bg-background" />
              </motion.div>
            </div>
          </div>
        )}

        {eta && (
          <div className="mt-8 flex justify-center">
            <span className="inline-flex items-center gap-2 bg-background/70 px-4 py-1.5 text-sm font-medium text-muted-foreground">
              <CalendarClock aria-hidden className="h-4 w-4 text-primary" />
              {eta}
            </span>
          </div>
        )}
      </motion.div>

      <div aria-hidden className="h-2.5" style={tapeStyle} />
    </section>
  )
}
