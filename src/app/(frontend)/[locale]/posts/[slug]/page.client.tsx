'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import React, { useEffect } from 'react'

const PageClient: React.FC = () => {
  const { setForceSolid } = useHeaderTheme()

  useEffect(() => {
    setForceSolid(true)
  }, [setForceSolid])
  return <React.Fragment />
}

export default PageClient
