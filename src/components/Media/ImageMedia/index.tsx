'use client'

import type { StaticImageData } from 'next/image'

import { cn } from '@/utilities/ui'
import NextImage from 'next/image'
import React from 'react'

import type { Props as MediaProps } from '../types'

import { cssVariables } from '@/cssVariables'
import { getMediaUrl } from '@/utilities/getMediaUrl'

const { breakpoints } = cssVariables

/**
 * ImageMedia
 *
 * This component passes a **relative** `src` (e.g. `/media/...`) to Next.js Image.
 * The `getMediaUrl` utility constructs the full URL by prepending the base URL from env vars
 * (NEXT_PUBLIC_SERVER_URL). Next.js then optimizes this using `remotePatterns` configured
 * in next.config.js — no custom `loader` needed.
 *
 * Flow:
 *   1. Resource URL from Payload: `/media/image-123.jpg`
 *   2. getMediaUrl() adds base URL: `https://yourdomain.com/media/image-123.jpg`
 *   3. Next.js Image optimizes via remotePatterns: `/_next/image?url=...&w=1200&q=75`
 *
 * If your storage/plugin returns **external CDN URLs** (e.g. `https://cdn.example.com/...`),
 * choose ONE of the following:
 *   A) Allow the remote host in next.config.js:
 *      images: { remotePatterns: [{ protocol: 'https', hostname: 'cdn.example.com' }] }
 *   B) Provide a **custom loader** for CDN-specific transforms:
 *      const imageLoader: ImageLoader = ({ src, width, quality }) =>
 *        `https://cdn.example.com${src}?w=${width}&q=${quality ?? 75}`
 *      <Image loader={imageLoader} src="/media/hero.jpg" width={1200} height={600} alt="" />
 *   C) Skip optimization:
 *      <Image unoptimized src="https://cdn.example.com/hero.jpg" width={1200} height={600} alt="" />
 *
 * TL;DR: Template uses relative URLs + getMediaUrl() to construct full URLs, then relies on
 * remotePatterns for optimization. Only add `loader` if using external CDNs with custom transforms.
 */

export const ImageMedia: React.FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    fill,
    pictureClassName,
    imgClassName,
    priority,
    resource,
    size: sizeFromProps,
    src: srcFromProps,
    loading: loadingFromProps,
    onLoad,
  } = props

  let width: number | undefined
  let height: number | undefined
  let alt = altFromProps
  let src: StaticImageData | string = srcFromProps || ''
  let blurDataURL: string | undefined

  if (!src && resource && typeof resource === 'object') {
    const { alt: altFromResource, height: fullHeight, url, width: fullWidth } = resource

    width = fullWidth!
    height = fullHeight!
    // Resolve alt with this priority:
    //   1. `altFromProps` if the parent passed it (even an empty string is intentional —
    //      e.g. CampSponsors wants the sponsor's name to be the alt regardless of how
    //      the underlying media was tagged).
    //   2. If the media is marked `isDecorative`, force alt="" — WCAG-sanctioned signal
    //      that assistive tech may skip the image entirely. Any stored alt is ignored
    //      because the editor explicitly opted into "this image has no meaning".
    //   3. Otherwise fall back to the resource's own alt, or "" as a last resort.
    if (altFromProps === undefined) {
      alt = resource.isDecorative === true ? '' : altFromResource || ''
    }
    blurDataURL = resource.blurDataUrl || undefined

    const cacheTag = resource.updatedAt

    src = getMediaUrl(url, cacheTag)
  }

  const srcString = src.toString()
  const isLocalUrl = srcString.startsWith('http://localhost') || srcString.startsWith('http://127.')

  const loading = loadingFromProps || (!priority ? 'lazy' : undefined)

  // NOTE: this is used by the browser to determine which image to download at different screen sizes.
  // The browser picks the FIRST matching media query, so entries must be sorted ascending by viewport
  // width. Default assumption: image takes ~100% of the viewport (override via `size` prop when the
  // actual layout width is known, e.g. a 33vw card grid).
  const sizes =
    sizeFromProps ||
    [
      ...Object.values(breakpoints)
        .sort((a, b) => a - b)
        .map((value) => `(max-width: ${value}px) ${value}px`),
      `${breakpoints['3xl']}px`,
    ].join(', ')

  return (
    <picture
      className={cn(pictureClassName)}
      style={fill ? { position: 'absolute', inset: 0 } : undefined}
    >
      <NextImage
        alt={alt ?? ''}
        className={cn(imgClassName)}
        fill={fill}
        height={!fill ? height : undefined}
        placeholder={blurDataURL ? 'blur' : 'empty'}
        blurDataURL={blurDataURL}
        priority={priority}
        quality={75}
        loading={loading}
        onLoad={onLoad}
        sizes={sizes}
        src={src}
        unoptimized={isLocalUrl}
        width={!fill ? width : undefined}
      />
    </picture>
  )
}
