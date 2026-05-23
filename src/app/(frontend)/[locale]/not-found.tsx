import Link from 'next/link'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'

export default function NotFound() {
  const t = useTranslations()

  return (
    <section className="container py-20 md:py-12">
      <p
        className="leading-none font-black text-foreground mb-12"
        style={{ fontFamily: 'var(--font-playfair), serif', fontSize: 'clamp(7rem, 22vw, 16rem)' }}
      >
        404
      </p>
      <h1
        className="text-3xl md:text-5xl font-black text-foreground mb-4"
        style={{ fontFamily: 'var(--font-playfair), serif' }}
      >
        {t('not-found-title')}
      </h1>
      <p className="text-muted-foreground mb-8 max-w-lg">{t('not-found-description')}</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="default">
          <Link href="/">{t('not-found-home')}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/gallery">{t('not-found-gallery')}</Link>
        </Button>
      </div>
    </section>
  )
}
