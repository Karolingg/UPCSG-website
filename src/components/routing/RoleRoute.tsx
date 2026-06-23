import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'
import type { Role } from '@/types/db'

interface RoleRouteProps {
  children: ReactNode
  roles: Role[]
}

export default function RoleRoute({ children, roles }: RoleRouteProps) {
  const { hasRole, loading } = useAuth()

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-ink text-paper/50">Loading…</div>
  if (!roles.some(role => hasRole(role))) return <Navigate to="/dashboard" replace />
  return children
}
