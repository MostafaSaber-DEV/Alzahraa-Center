import type React from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ConditionalLayout } from '@/components/conditional-layout'
import { Toaster } from '@/components/ui/toaster'
import { NotificationProvider } from '@/components/notification-provider'
import { ErrorBoundary } from '@/components/error-boundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LCMS - Learning Center Management System',
  description: 'Modern educational management platform for learning centers',
  keywords: 'education, management, students, CRM, learning center',
  authors: [{ name: 'LCMS Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <ConditionalLayout>{children}</ConditionalLayout>
          <Toaster />
          <NotificationProvider />
        </ErrorBoundary>
      </body>
    </html>
  )
}
