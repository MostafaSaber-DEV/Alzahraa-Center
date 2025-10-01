import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { apiRateLimit } from '@/lib/rate-limiter'
import type { GroupWithTeacher, ApiResponse } from '@/types/database'

const groupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  level: z.string().min(1, 'Level is required'),
  max_students: z.number().min(1, 'Max students must be at least 1').default(20),
  session_price: z.number().min(0.01, 'Session price must be greater than 0'),
  schedule_days: z.array(z.string()).min(1, 'At least one schedule day is required'),
  schedule_time: z.string().min(1, 'Schedule time is required'),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute').default(60),
  teacher_id: z.string().uuid('Invalid teacher ID'),
})

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<GroupWithTeacher[]>>> {
  const rateLimitResponse = apiRateLimit(request as any)
  if (rateLimitResponse) {
    return rateLimitResponse as NextResponse<ApiResponse<GroupWithTeacher[]>>
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

    const { data: groupsData, error } = await supabase
      .from('groups')
      .select(
        `
        *,
        teacher:profiles!teacher_id (
          id,
          full_name,
          email
        )
      `
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch groups',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: groupsData || [],
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

export async function POST(request: Request) {
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

    const body = await request.json()
    const validatedData = groupSchema.parse(body)

    const { data: group, error: dbError } = await supabase
      .from('groups')
      .insert({
        ...validatedData,
        created_by: user.id,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create group',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data: group })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: error.errors,
        },
        { status: 400 }
      )
    }
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
