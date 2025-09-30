import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import crypto from 'crypto'
import { apiRateLimit } from '@/lib/rate-limiter'
import type { StudentWithSubscription, ApiResponse } from '@/types/database'

const studentSchema = z.object({
  name_student: z.string().min(1, 'Name is required'),
  phone_number: z.string().min(1, 'Phone number is required'),
  academic_year: z.string().optional(),
  paid_amount: z.number().min(0).default(0),
  remaining_amount: z.number().min(0).default(0),
  current_sessions: z.number().min(0).default(0),
  deducted_sessions: z.number().min(0).default(0),
})

function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.WEBHOOK_SECRET
  if (!secret) return false

  const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex')

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
}

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<StudentWithSubscription[]>>> {
  // Apply rate limiting
  const rateLimitResponse = apiRateLimit(request as any)
  if (rateLimitResponse) {
    return rateLimitResponse as NextResponse<ApiResponse<StudentWithSubscription[]>>
  }

  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch students with their subscriptions using a join
    const { data: studentsData, error } = await supabase
      .from('students')
      .select(
        `
        id,
        name_student,
        phone_number,
        academic_year,
        paid_amount,
        remaining_amount,
        current_sessions,
        deducted_sessions,
        created_at,
        subscriptions (
          id,
          student_id,
          total_sessions,
          remaining_sessions,
          start_date,
          end_date,
          status,
          created_at
        )
      `
      )
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch students',
        },
        { status: 500 }
      )
    }

    // Transform the data to match our interface
    const students: StudentWithSubscription[] =
      studentsData?.map((student) => ({
        id: student.id,
        name_student: student.name_student,
        phone_number: student.phone_number,
        academic_year: student.academic_year,
        paid_amount: student.paid_amount,
        remaining_amount: student.remaining_amount,
        current_sessions: student.current_sessions,
        deducted_sessions: student.deducted_sessions,
        created_at: student.created_at,
        subscription: student.subscriptions?.[0] || null,
      })) || []

    return NextResponse.json({
      success: true,
      data: students,
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
  // Apply rate limiting
  const rateLimitResponse = apiRateLimit(request as any)
  if (rateLimitResponse) {
    return rateLimitResponse
  }

  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = studentSchema.parse(body)

    // Insert student
    const { data: student, error: dbError } = await supabase
      .from('students')
      .insert(validatedData)
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to add student',
        },
        { status: 500 }
      )
    }

    // Secure webhook notification
    if (process.env.N8N_WEBHOOK_URL && process.env.WEBHOOK_SECRET) {
      try {
        const payload = JSON.stringify({ ...validatedData, student_id: student.id })
        const signature = crypto
          .createHmac('sha256', process.env.WEBHOOK_SECRET)
          .update(payload)
          .digest('hex')

        await fetch(process.env.N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
          },
          body: payload,
        })
      } catch (webhookError) {
        console.error('Webhook error:', webhookError)
      }
    }

    return NextResponse.json({ success: true, data: student })
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
