'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { Topbar } from '@/components/topbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Phone,
  Users,
  Calendar,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { createClient } from '@/lib/supabase/client'

type Student = {
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

type Subscription = {
  id: string
  student_id: string
  total_sessions: number
  remaining_sessions: number
  start_date: string
  end_date: string | null
  status: 'active' | 'inactive' | 'expired'
  created_at: string
}

type StudentWithSubscriptions = Student & {
  subscriptions: Subscription[]
}

interface StudentsPageClientProps {
  initialStudents?: Student[]
}

export function StudentsPageClient({ initialStudents = [] }: StudentsPageClientProps) {
  const [students, setStudents] = useState<StudentWithSubscriptions[]>(
    initialStudents as StudentWithSubscriptions[]
  )
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    console.log('[v0] StudentsPageClient mounted, starting fetch...')
    fetchStudents()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStudents = async () => {
    try {
      console.log('[v0] fetchStudents called, setting loading to true')
      setLoading(true)

      console.log('[v0] Calling Supabase to fetch students...')
      const { data, error } = await supabase
        .from('students')
        .select(
          `
          *,
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

      console.log('[v0] Supabase response received')
      console.log('[v0] Error:', error)
      console.log('[v0] Data:', data)
      console.log('[v0] Data length:', data?.length || 0)

      if (error) {
        console.error('[v0] Supabase error details:', error)
        throw error
      }

      console.log('[v0] Setting students state with data:', data)
      setStudents(data || [])
      console.log('[v0] Students state updated')
    } catch (error) {
      console.error('[v0] Error in fetchStudents catch block:', error)
      toast({
        title: 'Error',
        description: 'Failed to load students. Please try again.',
        variant: 'destructive',
      })
    } finally {
      console.log('[v0] Setting loading to false')
      setLoading(false)
    }
  }

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name_student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.academic_year?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  const getActiveSubscription = (student: StudentWithSubscriptions): Subscription | null => {
    return (
      student.subscriptions?.find((sub) => sub.status === 'active') ||
      student.subscriptions?.[0] ||
      null
    )
  }

  const handleAddStudent = async (studentData: Partial<Student>) => {
    try {
      setIsSubmitting(true)

      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name_student: studentData.name_student,
          phone_number: studentData.phone_number,
          academic_year: studentData.academic_year,
          paid_amount: studentData.paid_amount || 0,
          remaining_amount: studentData.remaining_amount || 0,
          current_sessions: studentData.current_sessions || 0,
          deducted_sessions: studentData.deducted_sessions || 0,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Request failed with status ${response.status}`)
      }

      toast({
        title: 'Success',
        description: 'Student added successfully!',
      })

      setIsDialogOpen(false)

      // Refresh the student list
      await fetchStudents()
    } catch (error) {
      console.error('[v0] Error adding student:', error)
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to add student. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  console.log('[v0] Rendering component - loading:', loading, 'students count:', students.length)

  if (loading) {
    console.log('[v0] Showing loading state')
    return (
      <div className="flex min-h-screen flex-col">
        <Topbar />
        <div className="flex flex-1 items-center justify-center p-6">
          <div className="space-y-4 text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            <p className="text-muted-foreground">Loading students...</p>
          </div>
        </div>
      </div>
    )
  }

  console.log('[v0] Showing main content, filtered students:', filteredStudents.length)

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">Manage student records and academic information</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Student
              </Button>
            </DialogTrigger>
            <StudentDialog
              onSave={handleAddStudent}
              onCancel={() => setIsDialogOpen(false)}
              isSubmitting={isSubmitting}
            />
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredStudents.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center space-y-4 py-16">
            <div className="rounded-full bg-muted p-6">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2 text-center">
              <h3 className="text-xl font-semibold">No students found</h3>
              <p className="max-w-sm text-muted-foreground">
                {searchTerm
                  ? 'Try adjusting your search terms'
                  : 'Get started by adding your first student'}
              </p>
            </div>
            {!searchTerm && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Student
              </Button>
            )}
          </div>
        )}

        {filteredStudents.length > 0 && (
          <Tabs defaultValue="grid" className="space-y-4">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredStudents.map((student) => {
                  const activeSubscription = getActiveSubscription(student)

                  return (
                    <Card key={student.id} className="transition-shadow hover:shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                                {student.name_student
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <CardTitle className="text-lg">{student.name_student}</CardTitle>
                              <CardDescription>
                                {student.academic_year || 'No grade'}
                              </CardDescription>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Student
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Student
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Joined</span>
                          <span>{new Date(student.created_at).toLocaleDateString()}</span>
                        </div>

                        {activeSubscription && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Subscription</span>
                            <Badge
                              variant={
                                activeSubscription.status === 'active'
                                  ? 'default'
                                  : activeSubscription.status === 'expired'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              {activeSubscription.status}
                            </Badge>
                          </div>
                        )}

                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-muted-foreground">Paid</span>
                            </div>
                            <span className="font-semibold text-green-600">
                              ${student.paid_amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-orange-600" />
                              <span className="text-muted-foreground">Remaining</span>
                            </div>
                            <span className="font-semibold text-orange-600">
                              ${student.remaining_amount.toFixed(2)}
                            </span>
                          </div>

                          <div className="space-y-2 border-t pt-2">
                            {activeSubscription ? (
                              <>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Total Sessions</span>
                                  <Badge variant="secondary">
                                    {activeSubscription.total_sessions}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Remaining Sessions</span>
                                  <Badge variant="outline">
                                    {activeSubscription.remaining_sessions}
                                  </Badge>
                                </div>
                                {activeSubscription.end_date && (
                                  <div className="flex items-center gap-2 border-t pt-2 text-sm">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">Ends:</span>
                                    <span>
                                      {new Date(activeSubscription.end_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Current Sessions</span>
                                  <Badge variant="secondary">{student.current_sessions}</Badge>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Deducted Sessions</span>
                                  <Badge variant="outline">{student.deducted_sessions}</Badge>
                                </div>
                              </>
                            )}
                          </div>

                          <div className="flex items-center gap-2 border-t pt-2 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{student.phone_number}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredStudents.map((student) => {
                      const activeSubscription = getActiveSubscription(student)

                      return (
                        <div key={student.id} className="p-4 transition-colors hover:bg-muted/50">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-1 items-center gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                                  {student.name_student
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{student.name_student}</h3>
                                  {activeSubscription && (
                                    <Badge
                                      variant={
                                        activeSubscription.status === 'active'
                                          ? 'default'
                                          : activeSubscription.status === 'expired'
                                            ? 'destructive'
                                            : 'secondary'
                                      }
                                      className="text-xs"
                                    >
                                      {activeSubscription.status}
                                    </Badge>
                                  )}
                                </div>
                                <p className="truncate text-sm text-muted-foreground">
                                  {student.academic_year || 'No grade'} • {student.phone_number}
                                </p>
                              </div>
                              <div className="hidden items-center gap-6 text-sm md:flex">
                                <div className="text-center">
                                  <div className="text-xs text-muted-foreground">Paid</div>
                                  <div className="font-semibold text-green-600">
                                    ${student.paid_amount.toFixed(2)}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-muted-foreground">Remaining</div>
                                  <div className="font-semibold text-orange-600">
                                    ${student.remaining_amount.toFixed(2)}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-muted-foreground">Sessions</div>
                                  <div className="font-semibold">
                                    {activeSubscription
                                      ? `${activeSubscription.remaining_sessions}/${activeSubscription.total_sessions}`
                                      : `${student.current_sessions}/${student.deducted_sessions}`}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Student
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete Student
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}

function StudentDialog({
  onSave,
  onCancel,
  isSubmitting,
}: {
  onSave: (data: Partial<Student>) => void
  onCancel: () => void
  isSubmitting: boolean
}) {
  const [formData, setFormData] = useState({
    name_student: '',
    phone_number: '',
    academic_year: '',
    paid_amount: 0,
    remaining_amount: 0,
    current_sessions: 0,
    deducted_sessions: 0,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Add New Student</DialogTitle>
        <DialogDescription>Create a new student record with their information.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name_student">Student Name *</Label>
          <Input
            id="name_student"
            value={formData.name_student}
            onChange={(e) => setFormData({ ...formData, name_student: e.target.value })}
            placeholder="Enter student name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone Number *</Label>
          <Input
            id="phone_number"
            value={formData.phone_number}
            onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            placeholder="+1 (555) 123-4567"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="academic_year">Academic Year</Label>
          <Input
            id="academic_year"
            value={formData.academic_year}
            onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
            placeholder="e.g., Grade 1, Year 2, etc."
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="paid_amount">Paid Amount</Label>
            <Input
              id="paid_amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.paid_amount}
              onChange={(e) =>
                setFormData({ ...formData, paid_amount: Number.parseFloat(e.target.value) || 0 })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="remaining_amount">Remaining Amount</Label>
            <Input
              id="remaining_amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.remaining_amount}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  remaining_amount: Number.parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="current_sessions">Current Sessions</Label>
            <Input
              id="current_sessions"
              type="number"
              min="0"
              value={formData.current_sessions}
              onChange={(e) =>
                setFormData({ ...formData, current_sessions: Number.parseInt(e.target.value) || 0 })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deducted_sessions">Deducted Sessions</Label>
            <Input
              id="deducted_sessions"
              type="number"
              min="0"
              value={formData.deducted_sessions}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  deducted_sessions: Number.parseInt(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Student'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
