export type Role = 'member' | 'volunteer' | 'event_head' | 'officer' | 'admin'

export interface Profile {
  id: string
  email: string
  display_name: string | null
  created_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role: Role
  event_id: string | null
  created_at: string
}
