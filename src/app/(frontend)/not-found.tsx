import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function NotFound() {
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
        Die Hütte staht nöd da.
      </h1>
      <p className="text-muted-foreground mb-8 max-w-lg">
        D&apos;Siite wo du gsuecht häsch, isch entweder no nöd baut oder scho abbroche worde.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild variant="default">
          <Link href="/">Zur Startseite</Link>
        </Button>
      </div>
    </section>
  )
}
