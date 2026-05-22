import React from 'react'
import RichText from '@/components/RichText'
import type { PostSectionBlock as PostSectionBlockProps } from '@/payload-types'

export const PostSectionBlock: React.FC<PostSectionBlockProps> = ({
  eyebrow,
  title,
  subtitle,
  content,
}) => {
  return (
    <section className="container py-10 md:py-14">
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:gap-12 lg:gap-16">
        <div className="flex shrink-0 flex-col gap-1 md:w-32 lg:w-40">
          {eyebrow && (
            <span className="font-sans text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-foreground/50">
              {eyebrow}
            </span>
          )}
          <span
            className="font-serif leading-none text-foreground"
            style={{ fontSize: 'clamp(3rem, 8vw, 6rem)', fontWeight: 900 }}
          >
            {title}
          </span>
          {subtitle && (
            <span className="mt-1 font-mono text-sm text-foreground/60">
              {subtitle}
            </span>
          )}
          <span className="mt-2 inline-block h-px w-8 bg-primary" aria-hidden />
        </div>

        <div className="min-w-0 flex-1">
          {content && <RichText data={content} enableGutter={false} />}
        </div>
      </div>
    </section>
  )
}
