'use client'

import { useState, useEffect } from 'react'
import { Topbar } from '@/components/topbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Book,
  Phone,
  Calendar,
  Users,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ContactStudent, ApiResponse } from '@/types/database'
import type React from 'react'

type Student = {
  id: string
  name: string
  grade: string
  phone: string
  paidAmount: string
  classesCount: number
  status: 'Active' | 'Inactive' | 'Lead' | 'Customer'
  avatar: string
  lastPayment: string
  createdAt: string
  notes: string
}

const getStatusColor = (status: Student['status']) => {
  const colors = {
    Active: 'bg-blue-100 text-blue-800',
    Inactive: 'bg-gray-100 text-gray-800',
    Lead: 'bg-yellow-100 text-yellow-800',
    Customer: 'bg-green-100 text-green-800',
  }
  return colors[status]
}

export default function ContactsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/contacts')
      const data: ApiResponse<ContactStudent[]> = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch contacts')
      }

      if (data.success && data.data) {
        const mappedStudents = data.data.map((contact) => ({
          id: contact.id,
          name: contact.name_student,
          grade: 'Not specified',
          phone: contact.phone_number,
          paidAmount: `$${contact.paid_amount.toFixed(2)}`,
          classesCount: contact.subscriptions?.[0]?.remaining_sessions || 0,
          status: 'Lead' as const,
          avatar: '',
          lastPayment: new Date().toISOString().split('T')[0],
          createdAt: new Date().toISOString().split('T')[0],
          notes: '',
        }))
        setStudents(mappedStudents)
      } else {
        throw new Error(data.error || 'Invalid response format')
      }
    } catch (err) {
      console.error('Error fetching contacts:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.phone.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleRefresh = () => {
    fetchStudents()
  }

  const handleAddStudent = async (studentData: Partial<Student>) => {
    try {
      const response = await fetch('https://tatabatata.app.n8n.cloud/webhook-test/new-student', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name_student: studentData.name,
          phone_number: studentData.phone,
          academic_year: studentData.grade,
          paid_amount: parseFloat(studentData.paidAmount?.replace('$', '') || '0'),
          remaining_amount: 0,
          current_sessions: studentData.classesCount || 0,
          deducted_sessions: 0,
        }),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setEditingStudent(null)
        fetchStudents() // Refresh the list
      } else {
        console.error('Failed to add student')
      }
    } catch (error) {
      console.error('Error adding student:', error)
    }
  }

  const handleEditStudent = (studentData: Partial<Student>) => {
    // This would integrate with a PUT API
    console.log('Edit student:', studentData)
  }

  const handleDeleteStudent = (studentId: string) => {
    // This would integrate with a DELETE API
    console.log('Delete student:', studentId)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Topbar />
        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Students</h1>
              <p className="text-muted-foreground">Loading Students...</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[120px]" />
                      <Skeleton className="h-3 w-[80px]" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-[80px]" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Topbar />
        <div className="flex-1 space-y-6 p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Failed to load contacts: {error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Students</h1>
            <p className="text-muted-foreground">Student contact directory</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingStudent(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Student
                </Button>
              </DialogTrigger>
              <StudentDialog
                student={editingStudent}
                onSave={editingStudent ? handleEditStudent : handleAddStudent}
                onCancel={() => {
                  setIsDialogOpen(false)
                  setEditingStudent(null)
                }}
              />
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Lead">Lead</SelectItem>
              <SelectItem value="Customer">Customer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              {searchTerm || statusFilter !== 'all' ? 'No contacts found' : 'No Students yet'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search terms or filters'
                : 'Start by adding your first student to the system.'}
            </p>
          </div>
        ) : (
          <Tabs defaultValue="grid" className="space-y-4">
            <TabsList>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
            </TabsList>

            <TabsContent value="grid" className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredStudents.map((student) => (
                  <Card key={student.id} className="transition-shadow hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={student.avatar || '/placeholder.svg'}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                              {student.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <CardTitle className="text-lg">{student.name}</CardTitle>
                            <CardDescription>{student.grade}</CardDescription>
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
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingStudent(student)
                                setIsDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Student
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteStudent(student.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge className={getStatusColor(student.status)}>{student.status}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(student.lastPayment).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Book className="h-4 w-4 text-muted-foreground" />
                          <span>{student.classesCount} Classes</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">{student.paidAmount} Paid</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{student.phone}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {filteredStudents.map((student) => (
                      <div key={student.id} className="p-4 transition-colors hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-1 items-center gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarImage
                                src={student.avatar || '/placeholder.svg'}
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                                {student.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h3 className="font-medium">{student.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {student.grade} • {student.classesCount} Classes
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span>{student.paidAmount} Paid</span>
                              <span>{student.phone}</span>
                            </div>
                            <Badge className={getStatusColor(student.status)}>
                              {student.status}
                            </Badge>
                            <div className="text-sm text-muted-foreground">
                              {new Date(student.lastPayment).toLocaleDateString()}
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
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingStudent(student)
                                  setIsDialogOpen(true)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Student
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteStudent(student.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Student
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
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
  student,
  onSave,
  onCancel,
}: {
  student: Student | null
  onSave: (data: Partial<Student>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: student?.name || '',
    grade: student?.grade || '',
    phone: student?.phone || '',
    paidAmount: student?.paidAmount || '',
    classesCount: student?.classesCount || 0,
    status: student?.status || 'Lead',
    notes: student?.notes || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{student ? 'Edit Student' : 'Add New Student'}</DialogTitle>
        <DialogDescription>
          {student ? 'Update the student information below.' : 'Create a new student record.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Student Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="grade">Grade</Label>
          <Select
            value={formData.grade}
            onValueChange={(value) => setFormData({ ...formData, grade: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Grade 1">Grade 1</SelectItem>
              <SelectItem value="Grade 2">Grade 2</SelectItem>
              <SelectItem value="Grade 3">Grade 3</SelectItem>
              <SelectItem value="Grade 4">Grade 4</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="paidAmount">Paid Amount</Label>
            <Input
              id="paidAmount"
              value={formData.paidAmount}
              onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="classesCount">Classes Count</Label>
            <Input
              id="classesCount"
              type="number"
              value={formData.classesCount}
              onChange={(e) => setFormData({ ...formData, classesCount: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select
            value={formData.status}
            onValueChange={(value) =>
              setFormData({ ...formData, status: value as Student['status'] })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Lead">Lead</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Customer">Customer</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{student ? 'Update Student' : 'Create Student'}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
