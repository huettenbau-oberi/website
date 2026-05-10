'use client'
import React, { useEffect } from 'react'
import { animate, motion, useInView, useMotionValue, useTransform } from 'framer-motion'
import type { CampFactsBlock as CampFactsBlockProps } from '@/payload-types'
import { useRef } from 'react'

function CountUp({ to, inView }: { to: number; inView: boolean }) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, Math.round)

  useEffect(() => {
    if (!inView) return
    const ctrl = animate(count, to, { duration: 1.4, ease: 'easeOut' })
    return () => ctrl.stop()
  }, [count, to, inView])

  return <motion.span>{rounded}</motion.span>
}

const vp = { once: true, margin: '-60px' as const }

export const CampFactsBlock: React.FC<CampFactsBlockProps> = ({ title, facts }) => {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-60px' })

  if (!facts?.length) return null

  return (
    <section ref={sectionRef} className="w-full bg-[hsl(var(--border))] py-10 md:py-14">
      <div className="container">
        {/* Title */}
        {title && (
          <motion.p
            className="mb-6 text-center text-xl font-bold tracking-[0.25em] uppercase text-foreground/70"
            initial={{ opacity: 0, y: -8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={vp}
            transition={{ duration: 0.45, ease: 'easeOut' }}
          >
            {title}
          </motion.p>
        )}

        {/* Facts row */}
        <div className="relative px-8 py-2 md:px-14">
          {/* Top-left bracket */}
          <span
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 h-8 w-8 border-t-2 border-l-2 border-foreground/40"
          />
          {/* Bottom-right bracket */}
          <span
            aria-hidden
            className="pointer-events-none absolute bottom-0 right-0 h-8 w-8 border-b-2 border-r-2 border-foreground/40"
          />

          <div className="grid grid-cols-2 gap-y-8 sm:grid-cols-3 md:flex md:items-start md:justify-between md:gap-4">
            {facts.map((fact, i) => {
              const numeric = fact.value ? parseInt(fact.value, 10) : NaN
              const isNumeric = !isNaN(numeric)

              return (
                <motion.div
                  key={fact.id ?? i}
                  className="flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={vp}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
                >
                  {fact.prefix && (
                    <span className="mb-1 text-xs font-medium tracking-wide text-foreground/70 mt-4">
                      {fact.prefix}
                    </span>
                  )}
                  <span
                    className="text-5xl font-black leading-none text-foreground md:text-6xl"
                    style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
                  >
                    {isNumeric ? <CountUp to={numeric} inView={inView} /> : fact.value}
                  </span>
                  {fact.suffix && (
                    <span className="mt-4 text-xs font-medium tracking-wide text-foreground/70 mb-4">
                      {fact.suffix}
                    </span>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
