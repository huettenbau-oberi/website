import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className } = props

  const loading = loadingFromProps || 'lazy'
  const priority = priorityFromProps || 'low'

  const sharedProps = {
    width: 193,
    height: 34,
    loading,
    fetchPriority: priority,
    decoding: 'async' as const,
  }

  return (
    /* eslint-disable @next/next/no-img-element */
    <>
      <img
        {...sharedProps}
        alt="Hüttenbau Logo"
        src="/images/logo_dark.svg"
        className={clsx("max-w-[14rem] w-full h-[34px] [[data-theme='dark']_&]:hidden", className)}
      />
      <img
        {...sharedProps}
        alt=""
        src="/images/logo_light.svg"
        className={clsx("max-w-[14rem] w-full h-[34px] hidden [[data-theme='dark']_&]:block", className)}
      />
    </>
  )
}
