'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'

export const Error = ({ name }: { name: string }) => {
  const {
    formState: { errors },
  } = useFormContext()
  return (
    <div role="alert" id={`${name}-error`} className="mt-2 text-red-500 text-sm">
      {(errors[name]?.message as string) || 'This field is required'}
    </div>
  )
}
