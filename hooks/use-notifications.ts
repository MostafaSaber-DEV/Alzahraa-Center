import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  remaining_sessions?: number
  timestamp: Date
  duration?: number
  sound?: boolean
}

interface NotificationStore {
  notifications: Notification[]
  isConnected: boolean
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'

  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearAll: () => void
  setConnectionStatus: (status: NotificationStore['connectionStatus']) => void

  // Real-time connection
  connect: () => void
  disconnect: () => void
}

export const useNotifications = create<NotificationStore>()(
  subscribeWithSelector((set, get) => ({
    notifications: [],
    isConnected: false,
    connectionStatus: 'disconnected',

    addNotification: (notification) => {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const newNotification: Notification = {
        ...notification,
        id,
        timestamp: new Date(),
        duration: notification.duration || 5000,
        sound: notification.sound !== false, // Default to true
      }

      set((state) => ({
        notifications: [newNotification, ...state.notifications.slice(0, 4)], // Keep max 5
      }))

      // Auto-remove after duration
      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          get().removeNotification(id)
        }, newNotification.duration)
      }
    },

    removeNotification: (id) => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }))
    },

    clearAll: () => {
      set({ notifications: [] })
    },

    setConnectionStatus: (status) => {
      set({
        connectionStatus: status,
        isConnected: status === 'connected',
      })
    },

    connect: () => {
      const { setConnectionStatus, addNotification } = get()

      if (typeof window === 'undefined') return

      setConnectionStatus('connecting')

      try {
        // EventSource for real-time notifications (more reliable than WebSocket for this use case)
        const eventSource = new EventSource('/api/notifications/stream')

        eventSource.onopen = () => {
          setConnectionStatus('connected')
        }

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            addNotification(data)
          } catch (error) {
            console.error('Failed to parse notification:', error)
          }
        }

        eventSource.onerror = () => {
          setConnectionStatus('error')
          eventSource.close()

          // Retry connection after 5 seconds
          setTimeout(() => {
            get().connect()
          }, 5000)
        }

        // Store reference for cleanup
        ;(window as any).__notificationEventSource = eventSource
      } catch (error) {
        console.error('Failed to connect to notification stream:', error)
        setConnectionStatus('error')
      }
    },

    disconnect: () => {
      if (typeof window !== 'undefined' && (window as any).__notificationEventSource) {
        ;(window as any).__notificationEventSource.close()
        delete (window as any).__notificationEventSource
      }
      set({ connectionStatus: 'disconnected', isConnected: false })
    },
  }))
)
