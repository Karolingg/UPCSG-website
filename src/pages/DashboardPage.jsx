import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import DashboardLayout from '../components/DashboardLayout'

export default function DashboardPage() {
  const { profile, roles, isAdmin, isOfficer } = useAuth()

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold text-paper">Dashboard</h1>
      <p className="text-paper/60 mt-1">
        Welcome back, {profile?.display_name ?? 'member'}.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface rounded-xl p-6 border border-white/5">
          <p className="text-paper/60 text-sm">Your roles</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {roles.length === 0 ? (
              <span className="text-paper/40 text-sm">No roles assigned</span>
            ) : (
              roles.map(r => (
                <span
                  key={r.id}
                  className="bg-gold/15 text-gold text-xs font-semibold px-2.5 py-1 rounded-full"
                >
                  {r.role}
                </span>
              ))
            )}
          </div>
        </div>

        <Link
          to="/profile"
          className="bg-surface rounded-xl p-6 border border-white/5 hover:border-gold/40 transition-colors"
        >
          <p className="text-paper font-semibold">Profile &amp; settings</p>
          <p className="text-paper/60 text-sm mt-1">Edit your display name and details.</p>
        </Link>

        {(isAdmin() || isOfficer()) && (
          <Link
            to="/admin"
            className="bg-surface rounded-xl p-6 border border-white/5 hover:border-gold/40 transition-colors"
          >
            <p className="text-paper font-semibold">Admin panel</p>
            <p className="text-paper/60 text-sm mt-1">Manage events, news, and roles.</p>
          </Link>
        )}
      </div>

      <p className="text-paper/40 text-sm mt-10">
        More sections (Events, Announcements, Scholarships…) arrive in upcoming phases.
      </p>
    </DashboardLayout>
  )
}
