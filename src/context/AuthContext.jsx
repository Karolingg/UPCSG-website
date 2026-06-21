import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { isAllowedEmail } from '../lib/emailValidation'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchProfileAndRoles(userId) {
    const [{ data: profileData }, { data: rolesData }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('user_roles').select('*').eq('user_id', userId),
    ])
    setProfile(profileData)
    setRoles(rolesData ?? [])
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfileAndRoles(session.user.id).finally(() => setLoading(false))
      } else {
        setProfile(null)
        setRoles([])
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // eventId is optional — pass it to check a scoped role (event head, volunteer)
  function hasRole(role, eventId = null) {
    return roles.some(r => {
      if (r.role !== role) return false
      if (eventId !== null) return r.event_id === eventId
      return true
    })
  }

  function isAdmin() { return hasRole('admin') }
  function isOfficer() { return hasRole('officer') }

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signUp(email, password, displayName) {
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

export function useAuth() {
  return useContext(AuthContext)
}
