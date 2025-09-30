'use client'

import type React from 'react'

import { usePathname } from 'next/navigation'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()

  const noSidebarRoutes = [
    '/',
    '/auth/login',
    '/auth/sign-up',
    '/auth/sign-up-success',
    '/auth/error',
  ]

  const shouldShowSidebar = !noSidebarRoutes.includes(pathname)

  if (shouldShowSidebar) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </SidebarProvider>
    )
  }

  return <>{children}</>
}
