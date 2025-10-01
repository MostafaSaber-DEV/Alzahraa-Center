import { createClient } from '@/lib/supabase/client'
import type { Group, GroupWithTeacher } from '@/types/database'

const supabase = createClient()

/**
 * Fetch all groups with teacher information
 */
export async function getGroups(): Promise<GroupWithTeacher[]> {
  const { data, error } = await supabase
    .from('groups')
    .select(
      `
      *,
      teacher:profiles!teacher_id (
        id,
        full_name,
        email
      )
    `
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching groups:', error)
    throw new Error('Failed to fetch groups')
  }

  return data || []
}

/**
 * Fetch a single group by ID with teacher information
 */
export async function getGroupById(id: string): Promise<GroupWithTeacher | null> {
  const { data, error } = await supabase
    .from('groups')
    .select(
      `
      *,
      teacher:profiles!teacher_id (
        id,
        full_name,
        email
      )
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching group:', error)
    throw new Error('Failed to fetch group')
  }

  return data
}

/**
 * Create a new group
 */
export async function createGroup(
  groupData: Omit<Group, 'id' | 'created_at' | 'updated_at'>
): Promise<Group> {
  const { data, error } = await supabase.from('groups').insert(groupData).select().single()

  if (error) {
    console.error('Error creating group:', error)
    throw new Error('Failed to create group')
  }

  return data
}

/**
 * Update an existing group
 */
export async function updateGroup(
  id: string,
  groupData: Partial<Omit<Group, 'id' | 'created_at' | 'updated_at'>>
): Promise<Group> {
  const { data, error } = await supabase
    .from('groups')
    .update(groupData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating group:', error)
    throw new Error('Failed to update group')
  }

  return data
}

/**
 * Delete a group
 */
export async function deleteGroup(id: string): Promise<void> {
  const { error } = await supabase.from('groups').delete().eq('id', id)

  if (error) {
    console.error('Error deleting group:', error)
    throw new Error('Failed to delete group')
  }
}

/**
 * Get all teachers (profiles) for dropdown selection
 */
export async function getTeachers() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email')
    .order('full_name', { ascending: true })

  if (error) {
    console.error('Error fetching teachers:', error)
    throw new Error('Failed to fetch teachers')
  }

  return data || []
}
