'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'

export const Search: React.FC = () => {
  const [value, setValue] = useState('')
  const router = useRouter()
  const locale = useLocale()
  const debouncedValue = useDebounce(value)

  // Locale-aware search path: German default has no prefix, English gets /en/
  const searchPath = locale === 'en' ? '/en/search' : '/suche'

  useEffect(() => {
    router.push(`${searchPath}${debouncedValue ? `?q=${encodeURIComponent(debouncedValue)}` : ''}`)
  }, [debouncedValue, router, searchPath])

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <Input
          id="search"
          onChange={(event) => {
            setValue(event.target.value)
          }}
          placeholder="Search"
          className="rounded-none h-12 text-base"
        />
        <button type="submit" className="sr-only">
          submit
        </button>
      </form>
    </div>
  )
}
