import { NextRequest, NextResponse } from 'next/server'

// Store active SSE connections for broadcasting
const connections = new Set<ReadableStreamDefaultController>()

export async function POST(request: NextRequest) {
  // Function to broadcast notification to all connected clients
  const broadcastNotification = (notification: any) => {
    const encoder = new TextEncoder()
    const message = `data: ${JSON.stringify(notification)}\n\n`

    connections.forEach((controller) => {
      try {
        controller.enqueue(encoder.encode(message))
      } catch (error) {
        // Remove dead connection
        connections.delete(controller)
      }
    })
  }
  try {
    const body = await request.json()

    // Process n8n webhook data
    console.log('n8n webhook received:', body)

    // Extract notification data from n8n payload
    const notificationData = {
      type:
        body.status === 'success'
          ? 'success'
          : body.status === 'error'
            ? 'error'
            : body.status === 'warning'
              ? 'warning'
              : 'info',
      title: body.title || (body.status === 'success' ? 'نجح / Success' : 'إشعار / Notification'),
      message: body.message || 'تم تنفيذ العملية / Operation completed',
      remaining_sessions: body.remaining_sessions,
      duration: 5000,
      sound: true,
    }

    // Broadcast to all connected clients in real-time
    broadcastNotification(notificationData)

    // Example response matching your n8n workflow
    const response = {
      status: 'success',
      message: body.message || '✅ تم خصم الحصة بنجاح',
      remaining_sessions: body.remaining_sessions || 3,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Webhook error:', error)

    // Broadcast error notification
    broadcastNotification({
      type: 'error',
      title: 'خطأ / Error',
      message: 'فشل في معالجة الطلب / Failed to process request',
      duration: 5000,
      sound: true,
    })

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to process webhook',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
