'use client'
import React from 'react'
import { useRowLabel } from '@payloadcms/ui'

export const SponsorRowLabel: React.FC = () => {
  const { data, rowNumber } = useRowLabel<{ name?: string }>()
  return <span>{data?.name || `Sponsor ${(rowNumber ?? 0) + 1}`}</span>
}
