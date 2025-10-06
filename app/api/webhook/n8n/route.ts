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

    // Handle n8n response text format
    let message = body.message || body.responseBody || 'تم تنفيذ العملية / Operation completed'
    let remaining_sessions = body.remaining_sessions

    // Extract remaining sessions from Arabic text if not provided directly
    if (!remaining_sessions && typeof message === 'string') {
      const match = message.match(/متبقي (\d+) حصة/)
      if (match) {
        remaining_sessions = parseInt(match[1])
      }
    }

    // Extract notification data from n8n payload
    const notificationData = {
      type: 'success',
      title: 'نجح / Success',
      message: message,
      remaining_sessions: remaining_sessions,
      duration: 5000,
      sound: true,
    }

    // Broadcast to all connected clients in real-time
    broadcastNotification(notificationData)

    // Response matching your n8n workflow
    const response = {
      status: 'success',
      message: message,
      remaining_sessions: remaining_sessions,
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
