'use client'

import { useState, useEffect } from 'react'
import { Topbar } from '@/components/topbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Clock,
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
import type { GroupWithTeacher, ApiResponse } from '@/types/database'
import type React from 'react'

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
]

const SUBJECTS = ['Mathematics', 'Science', 'English', 'History', 'Physics', 'Chemistry', 'Biology']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4']

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return date.toLocaleDateString()
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupWithTeacher[]>([])
  const [teachers, setTeachers] = useState<
    { id: string; full_name: string | null; email: string }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<GroupWithTeacher | null>(null)
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null)

  const fetchGroups = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/groups')
      const data: ApiResponse<GroupWithTeacher[]> = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch groups')
      }

      if (data.success && data.data) {
        setGroups(data.data)
      } else {
        throw new Error(data.error || 'Invalid response format')
      }
    } catch (err) {
      console.error('Error fetching groups:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/profiles')
      const data = await response.json()
      if (data.success && data.data) {
        setTeachers(data.data)
      }
    } catch (err) {
      console.error('Error fetching teachers:', err)
    }
  }

  useEffect(() => {
    fetchGroups()
    fetchTeachers()
  }, [])

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.teacher?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSubject = subjectFilter === 'all' || group.subject === subjectFilter
    return matchesSearch && matchesSubject
  })

  const handleAddGroup = async (groupData: any) => {
    try {
      const response = await fetch(
        'https://primary-production-6fc94.up.railway.app/webhook-test/create-group',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(groupData),
        }
      )

      if (response.ok) {
        setIsDialogOpen(false)
        fetchGroups()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create group')
      }
    } catch (err) {
      setError('Error creating group')
    }
  }

  const handleEditGroup = async (groupData: any) => {
    if (!editingGroup) return

    try {
      const response = await fetch(`/api/groups/${editingGroup.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData),
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setEditingGroup(null)
        fetchGroups()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update group')
      }
    } catch (err) {
      setError('Error updating group')
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const response = await fetch(`/api/groups/${groupId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setDeleteGroupId(null)
        fetchGroups()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete group')
      }
    } catch (err) {
      setError('Error deleting group')
    }
  }

  const handleRefresh = () => {
    fetchGroups()
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Topbar />
        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
              <p className="text-muted-foreground">Loading groups...</p>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-3">
                  <Skeleton className="h-6 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-[100px]" />
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
            <AlertDescription>Failed to load groups: {error}</AlertDescription>
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
            <h1 className="text-3xl font-bold tracking-tight">Groups</h1>
            <p className="text-muted-foreground">Manage study groups and sessions</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingGroup(null)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Group
                </Button>
              </DialogTrigger>
              <GroupDialog
                group={editingGroup}
                teachers={teachers}
                onSave={editingGroup ? handleEditGroup : handleAddGroup}
                onCancel={() => {
                  setIsDialogOpen(false)
                  setEditingGroup(null)
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
              placeholder="Search groups..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {SUBJECTS.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredGroups.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-2 text-lg font-semibold">
              {searchTerm || subjectFilter !== 'all' ? 'No groups found' : 'No groups yet'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm || subjectFilter !== 'all'
                ? 'Try adjusting your search terms or filters'
                : 'Start by creating your first group.'}
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
                {filteredGroups.map((group) => (
                  <Card key={group.id} className="transition-shadow hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <CardDescription>
                            {group.teacher?.full_name || 'No teacher assigned'}
                          </CardDescription>
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
                                setEditingGroup(group)
                                setIsDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Group
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setDeleteGroupId(group.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Group
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary">{group.subject}</Badge>
                        <Badge variant="outline">{group.level}</Badge>
                      </div>
                      <div className="text-2xl font-bold">${group.session_price.toFixed(2)}</div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Max {group.max_students} students</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {group.schedule_time} ({group.duration_minutes}min)
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {group.schedule_days.join(', ')}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Created {formatRelativeTime(group.created_at)}
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
                    {filteredGroups.map((group) => (
                      <div key={group.id} className="p-4 transition-colors hover:bg-muted/50">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-1 items-center gap-4">
                            <div className="space-y-1">
                              <h3 className="font-medium">{group.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {group.teacher?.full_name || 'No teacher'}
                              </p>
                            </div>
                            <Badge variant="secondary">{group.subject}</Badge>
                            <Badge variant="outline">{group.level}</Badge>
                            <div className="text-lg font-semibold">
                              ${group.session_price.toFixed(2)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {group.schedule_time} • {group.duration_minutes}min
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Max {group.max_students} students
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
                                  setEditingGroup(group)
                                  setIsDialogOpen(true)
                                }}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Group
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => setDeleteGroupId(group.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Group
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

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteGroupId} onOpenChange={() => setDeleteGroupId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the group.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteGroupId && handleDeleteGroup(deleteGroupId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

function GroupDialog({
  group,
  teachers,
  onSave,
  onCancel,
}: {
  group: GroupWithTeacher | null
  teachers: { id: string; full_name: string | null; email: string }[]
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    subject: group?.subject || '',
    level: group?.level || '',
    max_students: group?.max_students || 20,
    session_price: group?.session_price || 0,
    schedule_days: group?.schedule_days || [],
    schedule_time: group?.schedule_time || '',
    duration_minutes: group?.duration_minutes || 60,
    teacher_id: group?.teacher_id || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const handleDayToggle = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      schedule_days: prev.schedule_days.includes(day)
        ? prev.schedule_days.filter((d) => d !== day)
        : [...prev.schedule_days, day],
    }))
  }

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{group ? 'Edit Group' : 'Add New Group'}</DialogTitle>
        <DialogDescription>
          {group ? 'Update the group information below.' : 'Create a new study group.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Group Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={formData.subject}
              onValueChange={(value) => setFormData({ ...formData, subject: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="level">Level</Label>
            <Select
              value={formData.level}
              onValueChange={(value) => setFormData({ ...formData, level: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {LEVELS.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="teacher_id">Teacher</Label>
          <Select
            value={formData.teacher_id}
            onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.full_name || teacher.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="max_students">Max Students</Label>
            <Input
              id="max_students"
              type="number"
              min="1"
              value={formData.max_students}
              onChange={(e) => setFormData({ ...formData, max_students: Number(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="session_price">Session Price ($)</Label>
            <Input
              id="session_price"
              type="number"
              min="0"
              step="0.01"
              value={formData.session_price}
              onChange={(e) => setFormData({ ...formData, session_price: Number(e.target.value) })}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="schedule_time">Schedule Time</Label>
            <Input
              id="schedule_time"
              type="time"
              value={formData.schedule_time}
              onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="duration_minutes">Duration (minutes)</Label>
            <Input
              id="duration_minutes"
              type="number"
              min="1"
              value={formData.duration_minutes}
              onChange={(e) =>
                setFormData({ ...formData, duration_minutes: Number(e.target.value) })
              }
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Schedule Days</Label>
          <div className="grid grid-cols-4 gap-2">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.value} className="flex items-center space-x-2">
                <Checkbox
                  id={day.value}
                  checked={formData.schedule_days.includes(day.value)}
                  onCheckedChange={() => handleDayToggle(day.value)}
                />
                <Label htmlFor={day.value} className="text-sm">
                  {day.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">{group ? 'Update Group' : 'Create Group'}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
