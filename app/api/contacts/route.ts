import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiRateLimit } from '@/lib/rate-limiter'
import type { ContactStudent, ApiResponse } from '@/types/database'

export async function GET(request: Request): Promise<NextResponse<ApiResponse<ContactStudent[]>>> {
  // Apply rate limiting
  const rateLimitResponse = apiRateLimit(request as any)
  if (rateLimitResponse) {
    return rateLimitResponse as NextResponse<ApiResponse<ContactStudent[]>>
  }

  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
        },
        { status: 401 }
      )
    }

    // Fetch contact information with subscription data
    const { data: contactsData, error } = await supabase
      .from('students')
      .select(
        `
        id,
        name_student,
        phone_number,
        paid_amount,
        subscriptions (
          remaining_sessions
        )
      `
      )
      .order('name_student', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch contacts',
        },
        { status: 500 }
      )
    }

    const contacts: ContactStudent[] = contactsData || []

    return NextResponse.json({
      success: true,
      data: contacts,
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
