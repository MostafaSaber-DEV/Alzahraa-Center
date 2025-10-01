import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { apiRateLimit } from '@/lib/rate-limiter'
import type { GroupWithTeacher, ApiResponse } from '@/types/database'

const updateGroupSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  subject: z.string().min(1, 'Subject is required').optional(),
  level: z.string().min(1, 'Level is required').optional(),
  max_students: z.number().min(1, 'Max students must be at least 1').optional(),
  session_price: z.number().min(0.01, 'Session price must be greater than 0').optional(),
  schedule_days: z.array(z.string()).min(1, 'At least one schedule day is required').optional(),
  schedule_time: z.string().min(1, 'Schedule time is required').optional(),
  duration_minutes: z.number().min(1, 'Duration must be at least 1 minute').optional(),
  teacher_id: z.string().uuid('Invalid teacher ID').optional(),
})

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
    const validatedData = updateGroupSchema.parse(body)

    const { data: group, error: dbError } = await supabase
      .from('groups')
      .update(validatedData)
      .eq('id', params.id)
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update group',
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

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
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

    const { error: dbError } = await supabase.from('groups').delete().eq('id', params.id)

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete group',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
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
