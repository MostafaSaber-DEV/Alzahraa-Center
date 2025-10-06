import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Forward to Railway webhook
    const response = await fetch(
      'https://primary-production-6fc94.up.railway.app/webhook-test/scan-qr',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    const data = await response.json()

    // Also trigger internal notification
    await fetch('/api/webhook/n8n', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'success',
        message: data.message || '✅ تم مسح QR بنجاح',
        remaining_sessions: data.remaining_sessions,
      }),
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error('Scan API error:', error)
    return NextResponse.json({ error: 'Failed to process scan' }, { status: 500 })
  }
}
