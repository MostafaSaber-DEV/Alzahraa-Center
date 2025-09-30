'use client'

import type React from 'react'

import { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Group = {
  id: string
  groupName: string
  doctor: string
  grade?: string
  stage: 'Active' | 'Planning' | 'In Progress' | 'Completed' | 'Cancelled' | 'On Hold'
  coursePrice: number
  studentsCount: number
  secretary: string
  secretaryAvatar: string
  startDate: string
  description: string
  createdAt: string
}

const initialGroups: Group[] = [
  {
    id: 'GROUP-001',
    groupName: 'Mathematics Advanced Group',
    doctor: 'Dr. Jane Doe',
    stage: 'In Progress',
    coursePrice: 45000,
    studentsCount: 75,
    secretary: 'Sarah Wilson',
    secretaryAvatar:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    startDate: '2024-02-15',
    description: 'Advanced mathematics study group for high school students',
    createdAt: '2023-12-01',
  },
  {
    id: 'GROUP-002',
    groupName: 'Science Research Group',
    doctor: 'Dr. Mike Roberts',
    stage: 'Planning',
    coursePrice: 12500,
    studentsCount: 60,
    secretary: 'Michael Chen',
    secretaryAvatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    startDate: '2024-01-30',
    description: 'Scientific research methodology and practice',
    createdAt: '2023-12-15',
  },
  {
    id: 'GROUP-003',
    groupName: 'Programming Club',
    doctor: 'Dr. Sarah Johnson',
    stage: 'Active',
    coursePrice: 78000,
    studentsCount: 40,
    secretary: 'Emily Rodriguez',
    secretaryAvatar:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    startDate: '2024-03-01',
    description: 'Computer programming and software development club',
    createdAt: '2023-11-20',
  },
  {
    id: 'GROUP-004',
    groupName: 'Language Learning Group',
    doctor: 'Dr. Alex Lee',
    stage: 'Completed',
    coursePrice: 25000,
    studentsCount: 100,
    secretary: 'David Park',
    secretaryAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    startDate: '2024-01-15',
    description: 'English language learning and practice sessions',
    createdAt: '2023-10-15',
  },
]

const getStageColor = (stage: Group['stage']) => {
  const colors = {
    Planning: 'bg-gray-100 text-gray-800',
    Active: 'bg-blue-100 text-blue-800',
    'In Progress': 'bg-yellow-100 text-yellow-800',
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
    'On Hold': 'bg-orange-100 text-orange-800',
  }
  return colors[stage]
}

const doctors = [
  'Dr. Jane Doe',
  'Dr. Mike Roberts',
  'Dr. Sarah Johnson',
  'Dr. Alex Lee',
  'Dr. Robert Brown',
  'Dr. Maria Garcia',
]

const secretaries = [
  'Sarah Wilson',
  'Michael Chen',
  'Emily Rodriguez',
  'David Park',
  'Lisa Wang',
  'James Smith',
]

const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4']

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>(initialGroups)
  const [searchTerm, setSearchTerm] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)

  const filteredGroups = groups.filter((group) => {
    const matchesSearch =
      group.groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.doctor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStage = stageFilter === 'all' || group.stage === stageFilter
    return matchesSearch && matchesStage
  })

  const handleAddGroup = (groupData: Partial<Group>) => {
    const newGroup: Group = {
      id: `GROUP-${String(groups.length + 1).padStart(3, '0')}`,
      groupName: groupData.groupName || '',
      doctor: groupData.doctor || '',
      stage: groupData.stage || 'Planning',
      coursePrice: groupData.coursePrice || 0,
      studentsCount: groupData.studentsCount || 0,
      secretary: groupData.secretary || '',
      secretaryAvatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      startDate: groupData.startDate || '',
      description: groupData.description || '',
      createdAt: new Date().toISOString().split('T')[0],
    }
    setGroups([...groups, newGroup])
    setIsDialogOpen(false)
  }

  const handleEditGroup = (groupData: Partial<Group>) => {
    if (editingGroup) {
      setGroups(
        groups.map((group) => (group.id === editingGroup.id ? { ...group, ...groupData } : group))
      )
      setEditingGroup(null)
      setIsDialogOpen(false)
    }
  }

  const handleDeleteGroup = (groupId: string) => {
    setGroups(groups.filter((group) => group.id !== groupId))
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Topbar />

      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Study Groups</h1>
            <p className="text-muted-foreground">Manage academic groups and study sessions</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingGroup(null)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Group
              </Button>
            </DialogTrigger>
            <GroupDialog
              group={editingGroup}
              onSave={editingGroup ? handleEditGroup : handleAddGroup}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingGroup(null)
              }}
            />
          </Dialog>
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
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="Planning">Planning</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
                        <CardTitle className="text-lg">{group.groupName}</CardTitle>
                        <CardDescription>{group.doctor}</CardDescription>
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
                            onClick={() => handleDeleteGroup(group.id)}
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
                      <Badge className={getStageColor(group.stage)}>{group.stage}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {group.studentsCount} students
                      </span>
                    </div>
                    <div className="text-2xl font-bold">${group.coursePrice.toLocaleString()}</div>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={group.secretaryAvatar || '/placeholder.svg'}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xs">
                          {group.secretary
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-muted-foreground">{group.secretary}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Start date: {new Date(group.startDate).toLocaleDateString()}
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
                            <h3 className="font-medium">{group.groupName}</h3>
                            <p className="text-sm text-muted-foreground">{group.doctor}</p>
                          </div>
                          <Badge className={getStageColor(group.stage)}>{group.stage}</Badge>
                          <div className="text-lg font-semibold">
                            ${group.coursePrice.toLocaleString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={group.secretaryAvatar || '/placeholder.svg'}
                                className="object-cover"
                              />
                              <AvatarFallback className="text-xs">
                                {group.secretary
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{group.secretary}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(group.startDate).toLocaleDateString()}
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
                              onClick={() => handleDeleteGroup(group.id)}
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
      </div>
    </div>
  )
}

function GroupDialog({
  group,
  onSave,
  onCancel,
}: {
  group: Group | null
  onSave: (data: Partial<Group>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    groupName: group?.groupName || '',
    doctor: group?.doctor || '',
    grade: group?.grade || '',
    stage: group?.stage || 'Planning',
    coursePrice: group?.coursePrice || 0,
    studentsCount: group?.studentsCount || 0,
    secretary: group?.secretary || '',
    startDate: group?.startDate || '',
    description: group?.description || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{group ? 'Edit Group' : 'Add New Group'}</DialogTitle>
        <DialogDescription>
          {group ? 'Update the group information below.' : 'Create a new study group.'}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="groupName">Group Name</Label>
          <Input
            id="groupName"
            value={formData.groupName}
            onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="doctor">Doctor</Label>
            <Select
              value={formData.doctor}
              onValueChange={(value) => setFormData({ ...formData, doctor: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor} value={doctor}>
                    {doctor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="secretary">Secretary</Label>
            <Select
              value={formData.secretary}
              onValueChange={(value) => setFormData({ ...formData, secretary: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select secretary" />
              </SelectTrigger>
              <SelectContent>
                {secretaries.map((secretary) => (
                  <SelectItem key={secretary} value={secretary}>
                    {secretary}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
                {grades.map((grade) => (
                  <SelectItem key={grade} value={grade}>
                    {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="stage">Group Status</Label>
            <Select
              value={formData.stage}
              onValueChange={(value) =>
                setFormData({ ...formData, stage: value as Group['stage'] })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="coursePrice">Course Price ($)</Label>
            <Input
              id="coursePrice"
              type="number"
              min="0"
              value={formData.coursePrice}
              onChange={(e) => setFormData({ ...formData, coursePrice: Number(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentsCount">Students Count</Label>
            <Input
              id="studentsCount"
              type="number"
              min="0"
              value={formData.studentsCount}
              onChange={(e) => setFormData({ ...formData, studentsCount: Number(e.target.value) })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
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
