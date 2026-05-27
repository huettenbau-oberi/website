'use client'

import { Maximize2, Minimize2, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import type { Props as MediaProps } from '../types'

import { getMediaUrl } from '@/utilities/getMediaUrl'
import { cn } from '@/utilities/ui'

function formatTime(s: number) {
  if (!s || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${String(sec).padStart(2, '0')}`
}

export const VideoPlayer: React.FC<MediaProps> = ({ resource, videoClassName, onVideoMeta }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [controlsVisible, setControlsVisible] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  // Actual decoded dimensions — set after loadedmetadata, handles rotation metadata.
  const [actualDims, setActualDims] = useState<{ w: number; h: number } | null>(null)

  const scheduleHide = useCallback(() => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(() => setControlsVisible(false), 3000)
  }, [])

  const revealControls = useCallback(
    (isPlaying: boolean) => {
      setControlsVisible(true)
      if (hideTimer.current) clearTimeout(hideTimer.current)
      if (isPlaying) scheduleHide()
    },
    [scheduleHide],
  )

  useEffect(() => () => { if (hideTimer.current) clearTimeout(hideTimer.current) }, [])

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.paused ? video.play() : video.pause()
  }, [])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }, [])

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }, [])

  const seek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const video = videoRef.current
      if (!video || !duration) return
      const rect = e.currentTarget.getBoundingClientRect()
      video.currentTime = ((e.clientX - rect.left) / rect.width) * duration
    },
    [duration],
  )

  if (!resource || typeof resource !== 'object') return null

  const { filename, width, height } = resource

  // Use actual decoded dimensions once available; fall back to stored Payload dims.
  const aw = actualDims?.w ?? width ?? 16
  const ah = actualDims?.h ?? height ?? 9

  // Constrain to 90 % of the viewport height while keeping the correct aspect
  // ratio. width = min(100 % of parent, the width that corresponds to 90 vh).
  const containerStyle: React.CSSProperties = {
    aspectRatio: `${aw} / ${ah}`,
    maxHeight: '90vh',
    width: `min(100%, calc(90vh * ${aw} / ${ah}))`,
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className="group relative mx-auto cursor-default overflow-hidden bg-black"
      style={containerStyle}
      onMouseMove={() => revealControls(playing)}
      onMouseEnter={() => revealControls(playing)}
      onMouseLeave={() => { if (playing) setControlsVisible(false) }}
    >
      {!isLoaded && <div className="absolute inset-0 animate-pulse bg-foreground/10" />}

      <video
        ref={videoRef}
        className={cn('absolute inset-0 h-full w-full cursor-pointer object-contain', videoClassName)}
        playsInline
        muted={muted}
        onClick={togglePlay}
        onPlay={() => { setPlaying(true); scheduleHide() }}
        onPause={() => { setPlaying(false); setControlsVisible(true); if (hideTimer.current) clearTimeout(hideTimer.current) }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onCanPlay={() => setIsLoaded(true)}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget
          setDuration(v.duration)
          setActualDims({ w: v.videoWidth, h: v.videoHeight })
          onVideoMeta?.(v.videoWidth, v.videoHeight)
        }}
      >
        <source src={getMediaUrl(`/media/${filename}`)} />
      </video>

      {/* Controls overlay */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 flex flex-col justify-between transition-opacity duration-200',
          controlsVisible ? 'opacity-100' : 'opacity-0',
        )}
      >
        {/* Centre play/pause button */}
        <div className="flex flex-1 items-center justify-center">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? 'Pause' : 'Abspielen'}
            className={cn(
              'pointer-events-auto rounded-full p-4 text-white transition-all duration-200',
              'bg-black/40 hover:bg-primary/80',
              playing ? 'scale-90 opacity-0 group-hover:opacity-100' : 'scale-100 opacity-100',
            )}
          >
            {playing ? <Pause className="size-7" /> : <Play className="size-7 translate-x-0.5" />}
          </button>
        </div>

        {/* Bottom bar */}
        <div className="pointer-events-auto bg-gradient-to-t from-black/75 to-transparent pb-3 pt-10 px-4">
          {/* Progress bar — tall hit area, track thickens on hover */}
          <div
            className="group/bar relative flex w-full cursor-pointer items-center py-2"
            onClick={seek}
          >
            <div className="relative h-1 w-full bg-white/25 transition-all duration-150 group-hover/bar:h-2.5">
              <div
                className="absolute inset-y-0 left-0 bg-primary"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-md opacity-0 transition-opacity duration-150 group-hover/bar:opacity-100"
                style={{ left: `${progress}%` }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              aria-label={playing ? 'Pause' : 'Abspielen'}
              className="text-white/75 transition-colors hover:text-white"
            >
              {playing
                ? <Pause className="size-4" />
                : <Play className="size-4 translate-x-0.5" />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Ton einschalten' : 'Stumm schalten'}
              className="text-white/75 transition-colors hover:text-white"
            >
              {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
            </button>

            <span className="flex-1 font-sans text-[0.62rem] tabular-nums text-white/60">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Vollbild beenden' : 'Vollbild'}
              className="text-white/75 transition-colors hover:text-white"
            >
              {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
