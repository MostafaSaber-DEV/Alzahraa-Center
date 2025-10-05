'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QrCode, Users, Calendar, MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface GroupCardProps {
  group: {
    id: string
    name: string
    description?: string
    teacher_name?: string
    student_count?: number
    created_at?: string
    status?: 'active' | 'inactive'
  }
  onEdit?: (group: any) => void
  onDelete?: (groupId: string) => void
}

export function GroupCard({ group, onEdit, onDelete }: GroupCardProps) {
  const router = useRouter()

  // Navigate to scan page with group name as URL parameter
  const handleScanNow = () => {
    const encodedGroupName = encodeURIComponent(group.name)
    router.push(`/scan?group=${encodedGroupName}`)
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{group.name}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={group.status === 'active' ? 'default' : 'secondary'}>
            {group.status || 'active'}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(group)}>Edit Group</DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem onClick={() => onDelete(group.id)} className="text-red-600">
                  Delete Group
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {group.description && <p className="text-sm text-gray-600">{group.description}</p>}

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {group.teacher_name && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{group.teacher_name}</span>
              </div>
            )}
            {group.student_count !== undefined && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{group.student_count} students</span>
              </div>
            )}
          </div>
          {group.created_at && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(group.created_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Scan Now Button - Primary Action */}
        <div className="border-t pt-2">
          <Button onClick={handleScanNow} className="w-full gap-2" size="sm">
            <QrCode className="h-4 w-4" />
            Scan Now
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
