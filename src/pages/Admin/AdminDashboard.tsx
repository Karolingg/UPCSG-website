import { Link } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'
import DashboardLayout from '@/components/layout/DashboardLayout'

export default function AdminDashboard() {
  const { profile } = useAuth()

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-paper">Admin Dashboard</h1>
      <p className="text-paper/60 mt-1">
        Welcome, {profile?.display_name ?? 'admin'}.
      </p>

      <div className="mt-8 bg-surface rounded-xl p-6 border border-white/5 max-w-xl">
        <p className="text-paper/70">
          Admin management tools (events, news, scholarships, role assignment) will be
          built here in the upcoming phases.
        </p>
        <Link to="/dashboard" className="inline-block mt-4 text-gold hover:text-gold-soft text-sm font-semibold">
          ← Back to member view
        </Link>
      </div>
    </DashboardLayout>
  )
}
