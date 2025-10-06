'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { notifications, handleWebhookResponse } from '@/lib/notifications'
import { useNotifications } from '@/hooks/use-notifications'
import { Wifi, WifiOff, Volume2, VolumeX, Trash2 } from 'lucide-react'

export function NotificationDemo() {
  const {
    notifications: notificationList,
    connectionStatus,
    isConnected,
    clearAll,
    connect,
    disconnect,
  } = useNotifications()

  const [soundEnabled, setSoundEnabled] = useState(true)

  // Test individual notifications
  const testNotifications = () => {
    notifications.success('✅ تم خصم الحصة بنجاح / Session deducted successfully', {
      remaining_sessions: 3,
      sound: soundEnabled,
    })

    setTimeout(() => {
      notifications.error('❌ فشل في خصم الحصة / Failed to deduct session', {
        title: 'خطأ في النظام / System Error',
        sound: soundEnabled,
      })
    }, 1000)

    setTimeout(() => {
      notifications.warning('⚠️ الحصص المتبقية قليلة / Low remaining sessions', {
        remaining_sessions: 1,
        sound: soundEnabled,
      })
    }, 2000)

    setTimeout(() => {
      notifications.info('ℹ️ تم تحديث بيانات الطالب / Student data updated', {
        title: 'تحديث البيانات / Data Update',
        sound: soundEnabled,
      })
    }, 3000)
  }

  // Test webhook integration
  const testWebhook = async () => {
    const testData = {
      status: 'success',
      message: '✅ تم خصم الحصة بنجاح 📚 متبقي 2 حصة',
      remaining_sessions: 2,
      title: 'خصم حصة / Session Deduction',
    }

    try {
      await handleWebhookResponse('/api/webhook/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData),
      })
    } catch (error) {
      console.error('Webhook test failed:', error)
    }
  }

  // Test real-time notification (simulates n8n sending data)
  const testRealTime = async () => {
    try {
      const response = await fetch('/api/webhook/n8n', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'success',
          message: '🎯 إشعار مباشر من n8n / Real-time notification from n8n',
          remaining_sessions: Math.floor(Math.random() * 10) + 1,
          title: 'إشعار مباشر / Real-time Alert',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send test notification')
      }
    } catch (error) {
      notifications.error('فشل في إرسال الإشعار المباشر / Failed to send real-time notification')
    }
  }

  return (
    <div className="space-y-6">
      {/* Connection Status & Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🔔 Notification System Demo</span>
            <div className="flex items-center space-x-2">
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? (
                  <>
                    <Wifi className="mr-1 h-3 w-3" />
                    Connected
                  </>
                ) : (
                  <>
                    <WifiOff className="mr-1 h-3 w-3" />
                    {connectionStatus}
                  </>
                )}
              </Badge>
              <Button variant="outline" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            <Button onClick={testNotifications} size="sm">
              Test All Types
            </Button>
            <Button onClick={testWebhook} variant="outline" size="sm">
              Test Webhook
            </Button>
            <Button onClick={testRealTime} variant="secondary" size="sm">
              Test Real-time
            </Button>
            <Button
              onClick={clearAll}
              variant="destructive"
              size="sm"
              disabled={notificationList.length === 0}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Clear All
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button onClick={connect} variant="outline" size="sm" disabled={isConnected}>
              Connect
            </Button>
            <Button onClick={disconnect} variant="outline" size="sm" disabled={!isConnected}>
              Disconnect
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Notification History ({notificationList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {notificationList.length === 0 ? (
            <p className="py-4 text-center text-gray-500">
              No notifications yet. Try the demo buttons above!
            </p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {notificationList.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    rounded-lg border p-3 text-sm
                    ${notification.type === 'success' ? 'border-green-200 bg-green-50' : ''}
                    ${notification.type === 'error' ? 'border-red-200 bg-red-50' : ''}
                    ${notification.type === 'warning' ? 'border-yellow-200 bg-yellow-50' : ''}
                    ${notification.type === 'info' ? 'border-blue-200 bg-blue-50' : ''}
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="mt-1 text-gray-600">{notification.message}</p>
                      {notification.remaining_sessions !== undefined && (
                        <p className="mt-1 text-xs text-gray-500">
                          Sessions: {notification.remaining_sessions}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">
                      {notification.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Integration Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 n8n Integration Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="mb-2 font-medium">Webhook URL:</p>
            <code className="block rounded border bg-white p-2 text-sm">
              {typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}
              /api/webhook/n8n
            </code>
          </div>

          <div className="rounded-lg bg-gray-50 p-3">
            <p className="mb-2 font-medium">Expected JSON payload:</p>
            <pre className="overflow-x-auto rounded border bg-white p-2 text-xs">
              {`{
  "status": "success",
  "message": "✅ تم خصم الحصة بنجاح",
  "remaining_sessions": 3,
  "title": "خصم حصة"
}`}
            </pre>
          </div>

          <div className="text-sm text-gray-600">
            <p>• Real-time notifications work via EventSource (Server-Sent Events)</p>
            <p>• Supports Arabic/English dual language</p>
            <p>• Includes sound feedback and retry logic</p>
            <p>• Global state management with Zustand</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
