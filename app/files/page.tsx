'use client'

import { useState, useEffect } from 'react'
import { Topbar } from '@/components/topbar'
import { StudentsDataTable } from '@/components/students-data-table'
import { Button } from '@/components/ui/button'
import { RefreshCw, Plus, Download } from 'lucide-react'
import type { StudentWithSubscription, ApiResponse } from '@/types/database'

export default function FilesPage() {
  const [students, setStudents] = useState<StudentWithSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/students')
      const data: ApiResponse<StudentWithSubscription[]> = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch students')
      }

      if (data.success && data.data) {
        setStudents(data.data)
      } else {
        throw new Error(data.error || 'Invalid response format')
      }
    } catch (err) {
      console.error('Error fetching students:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const handleRefresh = () => {
    fetchStudents()
  }

  const handleExport = () => {
    // Create CSV data
    const csvData = students.map((student) => ({
      'Student Name': student.name_student,
      'Phone Number': student.phone_number,
      'Academic Year': student.academic_year || '',
      'Paid Amount': student.paid_amount,
      'Remaining Amount': student.remaining_amount,
      'Current Sessions': student.current_sessions,
      'Deducted Sessions': student.deducted_sessions,
      'Subscription Status': student.subscription?.status || 'No Subscription',
      'Total Sessions': student.subscription?.total_sessions || '',
      'Remaining Sessions': student.subscription?.remaining_sessions || '',
      'Start Date': student.subscription?.start_date || '',
      'End Date': student.subscription?.end_date || '',
    }))

    // Convert to CSV string
    const headers = Object.keys(csvData[0] || {})
    const csvContent = [
      headers.join(','),
      ...csvData.map((row) =>
        headers.map((header) => `"${row[header as keyof typeof row]}"`).join(',')
      ),
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `students-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar />

      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Student Files</h2>
            <p className="text-muted-foreground">
              Comprehensive view of all students and their subscription details
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={loading || students.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>

            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </div>
        </div>

        <StudentsDataTable students={students} loading={loading} error={error} />
      </div>
    </div>
  )
}
