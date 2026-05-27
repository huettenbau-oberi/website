'use client'

import { cn } from '@/utilities/ui'
import React, { useEffect, useRef, useState } from 'react'

import type { Props as MediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'

export const VideoMedia: React.FC<MediaProps> = (props) => {
  const { fill, onClick, resource, videoClassName, onVideoMeta } = props
  const [isLoaded, setIsLoaded] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const { current: video } = videoRef
    if (video) {
      video.addEventListener('suspend', () => {
        // setShowFallback(true);
        // console.warn('Video was suspended, rendering fallback image.')
      })
    }
  }, [])

  if (resource && typeof resource === 'object') {
    const { filename, width, height } = resource

    if (fill) {
      return (
        <video
          autoPlay
          className={cn(videoClassName)}
          controls={false}
          loop
          muted
          onClick={onClick}
          onLoadedMetadata={(e) => {
            const v = e.currentTarget
            onVideoMeta?.(v.videoWidth, v.videoHeight)
          }}
          playsInline
          ref={videoRef}
        >
          <source src={getMediaUrl(`/media/${filename}`)} />
        </video>
      )
    }

    // Inline (non-fill) videos: wrap in a correctly-sized container so the page
    // reserves space while the video is downloading, preventing users from
    // scrolling past before the content appears.
    const aspectRatio = width && height ? `${width} / ${height}` : '16 / 9'

    return (
      <div className="relative w-full overflow-hidden" style={{ aspectRatio }}>
        {!isLoaded && (
          <div className="absolute inset-0 animate-pulse bg-foreground/10" />
        )}
        <video
          autoPlay
          className={cn('absolute inset-0 h-full w-full object-cover', videoClassName)}
          controls={false}
          loop
          muted
          onClick={onClick}
          onCanPlay={() => setIsLoaded(true)}
          onLoadedMetadata={(e) => {
            const v = e.currentTarget
            onVideoMeta?.(v.videoWidth, v.videoHeight)
          }}
          playsInline
          ref={videoRef}
        >
          <source src={getMediaUrl(`/media/${filename}`)} />
        </video>
      </div>
    )
  }

  return null
}
