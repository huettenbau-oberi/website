import { PayloadRequest, CollectionSlug } from 'payload'

const collectionPrefixMap: Partial<Record<CollectionSlug, string>> = {
  posts: '/posts',
  pages: '',
}

type Props = {
  collection: keyof typeof collectionPrefixMap
  slug: string
  req: PayloadRequest
  urlPrefix?: string
}

export const generatePreviewPath = ({ collection, slug, req, urlPrefix }: Props) => {
  // Allow empty strings, e.g. for the homepage
  if (slug === undefined || slug === null) {
    return null
  }

  const locale = req.locale ?? 'de'

  // Encode to support slugs with special characters
  const encodedSlug = encodeURIComponent(slug)

  const prefix = urlPrefix ? `/${urlPrefix}` : collectionPrefixMap[collection]

  const encodedParams = new URLSearchParams({
    slug: encodedSlug,
    collection,
    path: `/${locale}${prefix}/${encodedSlug}`,
    previewSecret: process.env.PREVIEW_SECRET || '',
  })

  const url = `/${locale}/next/preview?${encodedParams.toString()}`

  return url
}
