'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import type { CampHeroBlock as CampHeroBlockProps } from '@/payload-types'
import './index.scss'

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

  const showDays = timeLeft !== null && timeLeft.days > 0

  const units = timeLeft
    ? showDays
      ? [
          { value: timeLeft.days, label: 'Tage' },
          { value: timeLeft.hours, label: 'Stunden' },
          { value: timeLeft.minutes, label: 'Minuten' },
        ]
      : [
          { value: timeLeft.hours, label: 'Stunden' },
          { value: timeLeft.minutes, label: 'Minuten' },
          { value: timeLeft.seconds, label: 'Sekunden' },
        ]
    : null

  const flyerUrl =
    flyerFile && typeof flyerFile === 'object' ? flyerFile.url ?? undefined : undefined
  const hasFlyerImage = flyerImage && typeof flyerImage === 'object'

  return (
    <section className="camp-hero">
      <div className="container camp-hero__inner">
        {/* Left column */}
        <div className="camp-hero__content">
          <h1 className="camp-hero__title">{title}</h1>
          {subtitle && <p className="camp-hero__subtitle">{subtitle}</p>}

          {countdownDate && units && (
            <div className="camp-hero__countdown-wrap">
              {countdownLabel && (
                <p className="camp-hero__countdown-label">{countdownLabel}</p>
              )}
              <div className="camp-hero__countdown">
                {units.map(({ value, label }, i) => (
                  <React.Fragment key={label}>
                    <div className="camp-hero__unit">
                      <span className="camp-hero__number">{value}</span>
                      <span className="camp-hero__unit-label">{label}</span>
                    </div>
                    {i < units.length - 1 && (
                      <span className="camp-hero__sep" aria-hidden="true" />
                    )}
                  </React.Fragment>
                ))}
              </div>
              {countdownSuffix && (
                <p className="camp-hero__countdown-suffix">{countdownSuffix}</p>
              )}
            </div>
          )}

          {registrationText && (
            <p className="camp-hero__registration">{registrationText}</p>
          )}

          {Array.isArray(links) && links.length > 0 && (
            <ul className="camp-hero__buttons">
              {links.map(({ link }, i) => (
                <li key={i}>
                  <CMSLink {...link} />
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Right column — flyer */}
        {(hasFlyerImage || flyerUrl) && (
          <div className="camp-hero__flyer-col">
            {flyerUrl ? (
              <Link
                href={flyerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="camp-hero__flyer-link"
                aria-label="Flyer öffnen"
              >
                <FlyerCard image={hasFlyerImage ? flyerImage : null} />
              </Link>
            ) : (
              <div className="camp-hero__flyer-link">
                <FlyerCard image={hasFlyerImage ? flyerImage : null} />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

const FlyerCard: React.FC<{ image: CampHeroBlockProps['flyerImage'] | null }> = ({ image }) => (
  <div className="camp-hero__flyer">
    {image && typeof image === 'object' ? (
      <Media
        resource={image}
        imgClassName="camp-hero__flyer-img"
        fill
      />
    ) : (
      <span className="camp-hero__flyer-placeholder">Flyer</span>
    )}
  </div>
)
