'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { cn } from '@/utilities/ui'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import type { CampHeroBlock as CampHeroBlockProps } from '@/payload-types'

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calcTimeLeft(targetDate: string): TimeLeft {
  const diff = new Date(targetDate).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  const days = Math.floor(diff / 86_400_000)
  const hours = Math.floor((diff % 86_400_000) / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  const seconds = Math.floor((diff % 60_000) / 1_000)
  return { days, hours, minutes, seconds }
}

export const CampHeroBlock: React.FC<CampHeroBlockProps> = ({
  title,
  subtitle,
  countdownDate,
  countdownLabel,
  countdownSuffix,
  registrationText,
  links,
  flyerImage,
  flyerFile,
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    if (!countdownDate) return
    setTimeLeft(calcTimeLeft(countdownDate))
    const id = setInterval(() => setTimeLeft(calcTimeLeft(countdownDate)), 1_000)
    return () => clearInterval(id)
  }, [countdownDate])

  const t = useTranslations()
  const pad = (n: number) => String(n).padStart(2, '0')
  const showDays = timeLeft !== null && timeLeft.days > 0

  const units = timeLeft
    ? showDays
      ? [
          { value: String(timeLeft.days), label: t('days') },
          { value: pad(timeLeft.hours), label: t('hours') },
          { value: pad(timeLeft.minutes), label: t('minutes') },
        ]
      : [
          { value: pad(timeLeft.hours), label: t('hours') },
          { value: pad(timeLeft.minutes), label: t('minutes') },
          { value: pad(timeLeft.seconds), label: t('seconds') },
        ]
    : null

  const flyerUrl =
    flyerFile && typeof flyerFile === 'object' ? (flyerFile.url ?? undefined) : undefined
  const hasFlyerImage = flyerImage && typeof flyerImage === 'object'

  return (
    <section className="overflow-hidden py-20 pb-16">
      <div className="container px-4">
        <motion.h1
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
          }}
          className="m-0 font-bold leading-[1.1] tracking-[-0.02em] text-foreground text-center"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="mt-2 mb-0 text-base font-semibold text-muted-foreground text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          >
            {subtitle}
          </motion.p>
        )}

        <div className="mt-6 grid grid-cols-1 items-start gap-12 md:grid-cols-[1fr_380px] md:items-center md:gap-16 lg:grid-cols-[1fr_420px]">
          {/* Left column */}
          <motion.div
            className="flex flex-col gap-6"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          >
            {countdownDate && units && (
              <div className="flex flex-col gap-2">
                {countdownLabel && (
                  <p className="text-[0.9375rem] font-semibold text-muted-foreground">
                    {countdownLabel}
                  </p>
                )}
                <div className="flex justify-start items-center gap-6">
                  {units.map(({ value, label }, i) => (
                    <div
                      key={label}
                      className={cn(
                        'flex flex-col gap-1',
                        i < units.length - 1 && 'mr-6 border-r border-foreground/15 pr-6',
                      )}
                    >
                      <span
                        style={{ fontSize: 'clamp(2.5rem, 6vw, 3.5rem)' }}
                        className="font-bold leading-none tabular-nums tracking-[-0.03em] text-foreground"
                      >
                        {value}
                      </span>
                      <span className="text-xs font-medium uppercase tracking-[0.05em] text-muted-foreground">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                {countdownSuffix && (
                  <p className="m-0 mt-1 text-[0.9375rem] font-semibold text-muted-foreground">
                    {countdownSuffix}
                  </p>
                )}
              </div>
            )}

            {registrationText && (
              <p className="m-0 max-w-[38rem] text-[0.9375rem] leading-relaxed text-foreground">
                {registrationText}
              </p>
            )}

            {Array.isArray(links) && links.length > 0 && (
              <ul className="m-0 flex list-none flex-wrap gap-3 p-0">
                {links.map(({ link }, i) => (
                  <li key={i}>
                    <CMSLink {...link} />
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Right column — flyer */}
          {(hasFlyerImage || flyerUrl) && (
            <motion.div
              className="flex justify-center md:justify-start"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            >
              {flyerUrl ? (
                <Link
                  href={flyerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open flyer"
                  className="block w-full max-w-[380px] no-underline transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:rotate-1 hover:shadow-[0_16px_48px_rgba(0,0,0,0.15)]"
                >
                  <FlyerCard image={hasFlyerImage ? flyerImage : null} />
                </Link>
              ) : (
                <div className="w-full max-w-[380px]">
                  <FlyerCard image={hasFlyerImage ? flyerImage : null} />
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

const FlyerCard: React.FC<{ image: CampHeroBlockProps['flyerImage'] | null }> = ({ image }) => (
  <div
    style={{ backgroundColor: 'color-mix(in srgb, var(--foreground) 8%, transparent)' }}
    className="relative w-full overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)] [aspect-ratio:1/1.415] rounded-lg"
  >
    {image && typeof image === 'object' ? (
      <Media resource={image} imgClassName="block h-full w-full object-cover" fill />
    ) : (
      <span
        style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center -rotate-[15deg] text-5xl font-black tracking-[-0.03em] text-foreground opacity-30"
      >
        Flyer
      </span>
    )}
  </div>
)
