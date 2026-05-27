'use client'

import { cn } from '@/utilities/ui'
import React, { useEffect, useRef } from 'react'

import type { Props as MediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'
import { VideoPlayer } from '../VideoPlayer'

export const VideoMedia: React.FC<MediaProps> = (props) => {
  const { fill, onClick, resource, videoClassName, onVideoMeta } = props

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
    const { filename } = resource

    // Fill videos are used as silent background loops (e.g. hero backgrounds).
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

    // Inline content videos use the custom branded player.
    return <VideoPlayer {...props} />
  }

  return null
}
