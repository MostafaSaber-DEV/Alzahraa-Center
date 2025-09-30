export interface Student {
  id: string
  name_student: string
  phone_number: string
  academic_year: string | null
  paid_amount: number
  remaining_amount: number
  current_sessions: number
  deducted_sessions: number
  created_at: string
}

export interface Subscription {
  id: string
  student_id: string
  total_sessions: number
  remaining_sessions: number
  start_date: string
  end_date: string | null
  status: 'active' | 'inactive' | 'expired'
  created_at: string
}

export interface StudentWithSubscription extends Student {
  subscription: Subscription | null
}

export interface ContactStudent {
  id: string
  name_student: string
  phone_number: string
  paid_amount: number
  subscriptions: { remaining_sessions: number }[] | null
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}
