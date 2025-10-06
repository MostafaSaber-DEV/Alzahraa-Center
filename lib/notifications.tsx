import { toast } from 'sonner'
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'
import {
  useNotifications,
  type Notification,
  type NotificationType,
} from '@/hooks/use-notifications'

export interface NotificationData {
  status: 'success' | 'error' | 'warning' | 'info'
  message: string
  remaining_sessions?: number
  title?: string
  duration?: number
  sound?: boolean
}

// Sound utilities
const playNotificationSound = (type: NotificationType) => {
  if (typeof window === 'undefined') return

  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    const createBeep = (frequency: number, duration: number, volume: number = 0.1) => {
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime)
      oscillator.type = 'sine'

      gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + duration)
    }

    // Different sounds for different notification types
    switch (type) {
      case 'success':
        createBeep(800, 0.15)
        setTimeout(() => createBeep(1000, 0.15), 100)
        break
      case 'error':
        createBeep(300, 0.3)
        break
      case 'warning':
        createBeep(600, 0.2)
        break
      case 'info':
        createBeep(500, 0.15)
        break
    }
  } catch (error) {
    console.warn('Could not play notification sound:', error)
  }
}

// Retry logic for webhook responses
const retryFetch = async (
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<Response> => {
  let lastError: Error

  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url, options)

      // If response is ok or client error (4xx), don't retry
      if (response.ok || (response.status >= 400 && response.status < 500)) {
        return response
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    } catch (error) {
      lastError = error as Error

      // Don't retry on last attempt
      if (i === maxRetries) break

      // Exponential backoff
      const waitTime = delay * Math.pow(2, i)
      console.warn(`Request failed, retrying in ${waitTime}ms... (${i + 1}/${maxRetries})`)
      await new Promise((resolve) => setTimeout(resolve, waitTime))
    }
  }

  throw lastError!
}

export const showNotification = (data: NotificationData) => {
  const { addNotification } = useNotifications.getState()

  const { status, message, remaining_sessions, title, duration = 5000, sound = true } = data

  const getIcon = () => {
    switch (status) {
      case 'success':
        return CheckCircle
      case 'error':
        return XCircle
      case 'warning':
        return AlertTriangle
      case 'info':
        return Info
      default:
        return CheckCircle
    }
  }

  const getTitle = () => {
    if (title) return title
    switch (status) {
      case 'success':
        return 'نجح / Success'
      case 'error':
        return 'خطأ / Error'
      case 'warning':
        return 'تحذير / Warning'
      case 'info':
        return 'معلومات / Info'
      default:
        return 'إشعار / Notification'
    }
  }

  const Icon = getIcon()

  // Add to global state
  addNotification({
    type: status,
    title: getTitle(),
    message,
    remaining_sessions,
    duration,
    sound,
  })

  // Play sound if enabled
  if (sound) {
    playNotificationSound(status)
  }

  // Show toast with enhanced styling
  toast[status](message, {
    duration,
    icon: <Icon className="h-4 w-4" />,
    description:
      remaining_sessions !== undefined
        ? `الحصص المتبقية: ${remaining_sessions} | Remaining: ${remaining_sessions}`
        : undefined,
    className: `
      ${status === 'success' ? 'border-green-200 bg-green-50 text-green-900' : ''}
      ${status === 'error' ? 'border-red-200 bg-red-50 text-red-900' : ''}
      ${status === 'warning' ? 'border-yellow-200 bg-yellow-50 text-yellow-900' : ''}
      ${status === 'info' ? 'border-blue-200 bg-blue-50 text-blue-900' : ''}
      backdrop-blur-sm shadow-lg border
    `,
  })
}

// Enhanced webhook response handler with retry logic
export const handleWebhookResponse = async (
  url: string,
  options: RequestInit,
  showToast: boolean = true
) => {
  try {
    const response = await retryFetch(url, options)
    const data = await response.json()

    if (response.ok) {
      if (showToast) {
        showNotification({
          status: 'success',
          message: data.message || 'تمت العملية بنجاح / Operation completed successfully',
          remaining_sessions: data.remaining_sessions,
        })
      }
      return { success: true, data }
    } else {
      if (showToast) {
        showNotification({
          status: 'error',
          message: data.message || 'فشلت العملية / Operation failed',
        })
      }
      return { success: false, error: data }
    }
  } catch (error) {
    if (showToast) {
      showNotification({
        status: 'error',
        message: 'فشل في الاتصال / Connection failed',
      })
    }
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Quick notification functions
export const notifications = {
  success: (message: string, options?: Partial<NotificationData>) =>
    showNotification({ status: 'success', message, ...options }),

  error: (message: string, options?: Partial<NotificationData>) =>
    showNotification({ status: 'error', message, ...options }),

  warning: (message: string, options?: Partial<NotificationData>) =>
    showNotification({ status: 'warning', message, ...options }),

  info: (message: string, options?: Partial<NotificationData>) =>
    showNotification({ status: 'info', message, ...options }),
}
