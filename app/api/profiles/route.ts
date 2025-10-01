import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiRateLimit } from '@/lib/rate-limiter'

export async function GET(request: Request) {
  const rateLimitResponse = apiRateLimit(request as any)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .order('full_name', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch profiles',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: profiles || [],
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    )
  }
}
