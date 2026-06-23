import { createContext, useContext } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Profile, Role, UserRole } from '@/types/db'

export interface AuthContextValue {
  user: User | null
  profile: Profile | null
  roles: UserRole[]
  loading: boolean
  hasRole: (role: Role, eventId?: string | null) => boolean
  isAdmin: () => boolean
  isOfficer: () => boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
