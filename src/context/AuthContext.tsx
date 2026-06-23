import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { isAllowedEmail } from '@/utils/emailValidation'
import type { Profile, Role, UserRole } from '@/types/db'
import { AuthContext } from '@/context/auth-context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Session['user'] | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [roles, setRoles] = useState<UserRole[]>([])
  const [loading, setLoading] = useState(true)

  async function fetchProfileAndRoles(userId: string) {
    const [{ data: profileData }, { data: rolesData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single<Profile>(),
      supabase.from('user_roles').select('*').eq('user_id', userId).returns<UserRole[]>(),
    ])
    setProfile(profileData)
    setRoles(rolesData ?? [])
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session: Session | null) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          fetchProfileAndRoles(session.user.id).finally(() => setLoading(false))
        } else {
          setProfile(null)
          setRoles([])
          setLoading(false)
        }
      },
    )

    return () => subscription.unsubscribe()
  }, [])

  function hasRole(role: Role, eventId: string | null = null): boolean {
    return roles.some(r => {
      if (r.role !== role) return false
      if (eventId !== null) return r.event_id === eventId
      return true
    })
  }

  function isAdmin() { return hasRole('admin') }
  function isOfficer() { return hasRole('officer') }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email: string, password: string, displayName: string) {
    if (!isAllowedEmail(email)) {
      throw new Error('Sign up requires a @up.edu.ph email address.')
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, roles, loading, hasRole, isAdmin, isOfficer, signIn, signUp, signOut }}
    >
      {children}
    </AuthContext.Provider>
  )
}
