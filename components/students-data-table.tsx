'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Users, Phone, Calendar, DollarSign, BookOpen, AlertCircle } from 'lucide-react'
import type { StudentWithSubscription, ApiResponse } from '@/types/database'

interface StudentsDataTableProps {
  students: StudentWithSubscription[]
  loading: boolean
  error: string | null
}

export function StudentsDataTable({ students, loading, error }: StudentsDataTableProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Students & Subscriptions
          </CardTitle>
          <CardDescription>Loading student data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-8 w-[100px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load students: {error}</AlertDescription>
      </Alert>
    )
  }

  if (students.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Students & Subscriptions
          </CardTitle>
          <CardDescription>No students found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">No students yet</h3>
            <p className="text-muted-foreground">
              Start by adding your first student to the system.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getSubscriptionStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge variant="secondary">No Subscription</Badge>

    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Students & Subscriptions
        </CardTitle>
        <CardDescription>Manage student records and their subscription details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Info</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{student.name_student}</div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-1 h-3 w-3" />
                        {student.phone_number}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center text-sm">
                      <BookOpen className="mr-1 h-3 w-3" />
                      {student.academic_year || 'Not specified'}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-green-600">
                        <DollarSign className="mr-1 h-3 w-3" />
                        Paid: ${student.paid_amount.toFixed(2)}
                      </div>
                      <div className="flex items-center text-sm text-orange-600">
                        <DollarSign className="mr-1 h-3 w-3" />
                        Remaining: ${student.remaining_amount.toFixed(2)}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      {student.subscription ? (
                        <>
                          <div className="text-sm">
                            {student.subscription.remaining_sessions}/
                            {student.subscription.total_sessions} sessions
                          </div>
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                              className="h-2 rounded-full bg-blue-600"
                              style={{
                                width: `${(student.subscription.remaining_sessions / student.subscription.total_sessions) * 100}%`,
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="space-y-1">
                          <div className="text-sm">Current: {student.current_sessions}</div>
                          <div className="text-sm">Deducted: {student.deducted_sessions}</div>
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {student.subscription ? (
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(student.subscription.start_date).toLocaleDateString()}
                        </div>
                        {student.subscription.end_date && (
                          <div className="text-xs text-muted-foreground">
                            Ends: {new Date(student.subscription.end_date).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No subscription</span>
                    )}
                  </TableCell>

                  <TableCell>{getSubscriptionStatusBadge(student.subscription?.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
