import React from 'react'

import type { HomeSectionBlock as HomeSectionBlockProps } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import RichText from '@/components/RichText'

const themeClasses: Record<string, string> = {
  light: 'bg-background text-foreground',
  dark: 'bg-foreground text-background',
  muted: 'bg-muted text-muted-foreground',
}

export const HomeSectionBlock: React.FC<HomeSectionBlockProps> = ({
  layout,
  theme,
  eyebrow,
  richText,
  links,
  media,
}) => {
  const isCentered = layout === 'centered'
  const imageLeft = layout === 'textRight'
  const themeClass = themeClasses[theme ?? 'light'] ?? themeClasses.light

  const textContent = (
    <div className={`flex flex-col gap-4 ${isCentered ? 'items-center text-center' : ''}`}>
      {eyebrow && (
        <p className="text-sm font-semibold uppercase tracking-widest opacity-60">{eyebrow}</p>
      )}
      {richText && (
        <RichText className="max-w-[36rem]" data={richText} enableGutter={false} />
      )}
      {Array.isArray(links) && links.length > 0 && (
        <ul className={`mt-2 flex flex-wrap gap-4 ${isCentered ? 'justify-center' : ''}`}>
          {links.map(({ link }, i) => (
            <li key={i}>
              <CMSLink {...link} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )

  const imageContent =
    !isCentered && media && typeof media === 'object' ? (
      <div className="w-full overflow-hidden rounded-lg">
        <Media imgClassName="w-full h-full object-cover" resource={media} />
      </div>
    ) : null

  return (
    <section className={themeClass} data-theme={theme === 'dark' ? 'dark' : undefined}>
      <div className="container py-16 md:py-24">
        {isCentered ? (
          textContent
        ) : (
          <div
            className={`flex flex-col items-center gap-12 md:flex-row ${imageLeft ? 'md:flex-row-reverse' : ''}`}
          >
            <div className="flex-1">{textContent}</div>
            {imageContent && <div className="flex-1">{imageContent}</div>}
          </div>
        )}
      </div>
    </section>
  )
}
