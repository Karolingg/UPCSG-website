import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// roles: array of role strings — passes if the user has ANY of them
export default function RoleRoute({ children, roles }) {
  const { hasRole, loading } = useAuth()

  if (loading) return <div className="flex items-center justify-center min-h-screen bg-ink text-paper/50">Loading…</div>
  if (!roles.some(role => hasRole(role))) return <Navigate to="/dashboard" replace />
  return children
}
