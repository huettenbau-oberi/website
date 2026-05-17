import type { Metadata } from 'next'
import { getServerSideURL } from './getURL'

const defaultOpenGraph: Metadata['openGraph'] = {
  type: 'website',
  description: 'Hüttenbau Oberi – das jährliche Ferienlager, bei dem Kinder gemeinsam Hütten bauen. Abenteuer, Teamarbeit und unvergessliche Erlebnisse in der Natur!',
  images: [
    {
      url: `${getServerSideURL()}/website-template-OG.webp`,
    },
  ],
  siteName: 'Hüttenbau Oberi',
  title: 'Hüttenbau Oberi',
}

export const mergeOpenGraph = (og?: Metadata['openGraph']): Metadata['openGraph'] => {
  return {
    ...defaultOpenGraph,
    ...og,
    images: og?.images ? og.images : defaultOpenGraph.images,
  }
}
