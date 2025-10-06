'use client'

import { useEffect } from 'react'
import { Toaster } from 'sonner'
import { useTheme } from 'next-themes'
import { motion, AnimatePresence } from 'framer-motion'
import { useNotifications } from '@/hooks/use-notifications'
import { CheckCircle, XCircle, AlertTriangle, Info, Wifi, WifiOff } from 'lucide-react'

// Real-time notification list component
function NotificationList() {
  const { notifications, removeNotification } = useNotifications()

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.slice(0, 3).map((notification) => {
          const Icon = {
            success: CheckCircle,
            error: XCircle,
            warning: AlertTriangle,
            info: Info,
          }[notification.type]

          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                duration: 0.3,
              }}
              className={`
                pointer-events-auto w-full max-w-sm cursor-pointer rounded-lg 
                border border-gray-200 bg-white p-4 shadow-lg
                transition-shadow hover:shadow-xl dark:border-gray-700 dark:bg-gray-800
                ${notification.type === 'success' ? 'border-l-4 border-l-green-500' : ''}
                ${notification.type === 'error' ? 'border-l-4 border-l-red-500' : ''}
                ${notification.type === 'warning' ? 'border-l-4 border-l-yellow-500' : ''}
                ${notification.type === 'info' ? 'border-l-4 border-l-blue-500' : ''}
              `}
              onClick={() => removeNotification(notification.id)}
            >
              <div className="flex items-start space-x-3 rtl:space-x-reverse">
                <Icon
                  className={`
                  mt-0.5 h-5 w-5 flex-shrink-0
                  ${notification.type === 'success' ? 'text-green-500' : ''}
                  ${notification.type === 'error' ? 'text-red-500' : ''}
                  ${notification.type === 'warning' ? 'text-yellow-500' : ''}
                  ${notification.type === 'info' ? 'text-blue-500' : ''}
                `}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {notification.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {notification.message}
                  </p>
                  {notification.remaining_sessions !== undefined && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      الحصص المتبقية: {notification.remaining_sessions} | Remaining:{' '}
                      {notification.remaining_sessions}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

// Connection status indicator
function ConnectionStatus() {
  const { connectionStatus, isConnected } = useNotifications()

  if (connectionStatus === 'connected') return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed left-4 top-4 z-50"
    >
      <div
        className={`
        flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium
        ${connectionStatus === 'connecting' ? 'bg-yellow-100 text-yellow-800' : ''}
        ${connectionStatus === 'error' ? 'bg-red-100 text-red-800' : ''}
        ${connectionStatus === 'disconnected' ? 'bg-gray-100 text-gray-800' : ''}
      `}
      >
        {connectionStatus === 'connecting' && (
          <>
            <Wifi className="h-4 w-4 animate-pulse" />
            <span>Connecting...</span>
          </>
        )}
        {connectionStatus === 'error' && (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Connection Error</span>
          </>
        )}
        {connectionStatus === 'disconnected' && (
          <>
            <WifiOff className="h-4 w-4" />
            <span>Disconnected</span>
          </>
        )}
      </div>
    </motion.div>
  )
}

export function NotificationProvider() {
  const { theme } = useTheme()
  const { connect, disconnect } = useNotifications()

  // Initialize real-time connection
  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return (
    <>
      {/* Sonner Toaster for fallback/additional toasts */}
      <Toaster
        theme={theme as 'light' | 'dark' | 'system'}
        position="top-right"
        expand={true}
        richColors={true}
        closeButton={true}
        toastOptions={{
          duration: 4000,
          className:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-950 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg backdrop-blur-sm',
          descriptionClassName: 'group-[.toast]:text-gray-600',
        }}
      />

      {/* Real-time notification list */}
      <NotificationList />

      {/* Connection status indicator */}
      <ConnectionStatus />
    </>
  )
}
