'use client'

import {
  EyeOffIcon,
  FileTextIcon,
  ImageIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  NewspaperIcon,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getClientSideURL } from '@/utilities/getURL'
import { cn } from '@/utilities/ui'

type User = {
  id: string
  name?: string | null
  email?: string
}

export const UserDropdown: React.FC<{ isPreview: boolean }> = ({ isPreview }) => {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const router = useRouter()

  useEffect(() => {
    fetch(`${getClientSideURL()}/api/users/me`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null))
  }, [])

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : (user?.email?.slice(0, 2).toUpperCase() ?? '')

  const handleExitPreview = () => {
    fetch('/next/exit-preview').then(() => {
      router.push('/')
      router.refresh()
    })
  }

  const handleLogout = () => {
    fetch(`${getClientSideURL()}/api/users/logout`, {
      credentials: 'include',
      method: 'POST',
    }).then(() => {
      setUser(null)
      router.refresh()
    })
  }

  if (user === null) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Open user menu"
          className={cn(
            // h-9 w-9 (36×36) matches the theme-toggle and keeps the navbar row at a
            // consistent height whether the dropdown is rendered or not. The inner
            // avatar (h-7 w-7 = 28×28) stays the visible target; the surrounding 4 px
            // padding keeps the 24×24 WCAG AA minimum click area without dominating
            // the header.
            'flex h-9 w-9 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
            user === undefined && 'invisible pointer-events-none',
          )}
        >
          <Avatar className="h-7 w-7">
            <AvatarImage src="" alt={user?.email ?? ''} />
            <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      {user && (
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="font-normal">
            Logged in as:{' '}
            <span className="font-medium text-foreground">{user.name ?? user.email}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => router.push('/admin')}>
              <LayoutDashboardIcon />
              Dashboard
            </DropdownMenuItem>
          </DropdownMenuGroup>
          {isPreview && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleExitPreview}
                className="text-destructive focus:text-destructive"
              >
                <EyeOffIcon />
                Exit Preview
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onSelect={() => router.push('/admin/collections/pages')}>
              <FileTextIcon />
              Pages
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push('/admin/collections/posts')}>
              <NewspaperIcon />
              Posts
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push('/admin/collections/media')}>
              <ImageIcon />
              Media
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleLogout}>
            <LogOutIcon />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  )
}
