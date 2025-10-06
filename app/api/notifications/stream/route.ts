import { NextRequest } from 'next/server'

// Prevent static generation for this API route
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// EventSource endpoint for real-time notifications
export async function GET(request: NextRequest) {
  // Create a readable stream for Server-Sent Events
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const encoder = new TextEncoder()

      const sendEvent = (data: any) => {
        const message = `data: ${JSON.stringify(data)}\n\n`
        controller.enqueue(encoder.encode(message))
      }

      // Send connection established event
      sendEvent({
        type: 'info',
        title: 'متصل / Connected',
        message: 'تم تأسيس الاتصال المباشر / Real-time connection established',
        duration: 3000,
      })

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'))
        } catch (error) {
          clearInterval(heartbeat)
        }
      }, 30000) // Every 30 seconds

      // Store cleanup function
      ;(request as any).cleanup = () => {
        clearInterval(heartbeat)
        try {
          controller.close()
        } catch (error) {
          // Connection already closed
        }
      }
    },

    cancel() {
      // Cleanup when client disconnects
      if ((request as any).cleanup) {
        ;(request as any).cleanup()
      }
    },
  })

  // Return SSE response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
}
