import clsx from 'clsx'
import React from 'react'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
  theme?: 'light' | 'dark'
}

export const Logo = (props: Props) => {
  const { loading: loadingFromProps, priority: priorityFromProps, className, theme } = props

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
      {theme === 'dark' ? (
        <img
          {...sharedProps}
          alt="Hüttenbau Logo"
          src="/images/logo_dark.svg"
          className={clsx('max-w-[14rem] w-full h-[34px]', className)}
        />
      ) : theme === 'light' ? (
        <img
          {...sharedProps}
          alt="Hüttenbau Logo"
          src="/images/logo_light.svg"
          className={clsx('max-w-[14rem] w-full h-[34px]', className)}
        />
      ) : (
        <>
          <img
            {...sharedProps}
            alt="Hüttenbau Logo"
            src="/images/logo_dark.svg"
            className={clsx(
              "max-w-[14rem] w-full h-[34px] [[data-theme='dark']_&]:hidden",
              className,
            )}
          />
          <img
            {...sharedProps}
            alt="Hüttenbau Logo"
            src="/images/logo_light.svg"
            className={clsx(
              "max-w-[14rem] w-full h-[34px] hidden [[data-theme='dark']_&]:block",
              className,
            )}
          />
        </>
      )}
    </>
  )
}
