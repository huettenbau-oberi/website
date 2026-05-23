import React from 'react'

import { NotFoundContent } from '@/components/NotFoundContent'

// fallback for cases where the url could be malformed

export default function NotFound() {
  return (
    <html lang="de">
      <body style={{ margin: 0, fontFamily: 'sans-serif' }}>
        <NotFoundContent
          title="Die Hütte staht nöd da."
          description="D'Siite wo du gsuecht häsch, isch entweder no nöd baut, scho abbroche, oder mer hend si verleit."
          homeLabel="Zur Startseite"
          galleryLabel="Zur Galerie"
        />
      </body>
    </html>
  )
}
