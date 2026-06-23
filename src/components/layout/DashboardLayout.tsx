import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'
import Logo from '@/components/ui/Logo'

interface NavItem {
  label: string
  to?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Announcements' },
  { label: 'Events' },
  { label: 'Scholarships' },
  { label: 'Internships' },
  { label: 'Officers' },
  { label: 'Settings', to: '/profile' },
]

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col bg-ink text-paper">
      <header className="nebula-bg flex items-center justify-between px-6 h-20 border-b border-white/10">
        <Logo height={64} />
        <div className="flex items-center gap-6 text-sm font-semibold tracking-wide">
          <span className="text-paper/40 cursor-default">NEWS</span>
          <span className="text-paper/40 cursor-default">BADGES</span>
          <div className="flex items-center gap-3 pl-4">
            <span className="text-paper/70 hidden sm:inline">{profile?.display_name}</span>
            <button
              onClick={handleSignOut}
              className="bg-gold text-ink font-bold px-4 py-1.5 rounded-md hover:bg-gold-soft transition-colors"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-60 shrink-0 bg-ink-soft border-r border-white/5 py-6">
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(item =>
              item.to ? (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `mx-3 px-4 py-3 rounded-md font-bold tracking-wide transition-colors ${
                      isActive
                        ? 'bg-gold text-ink'
                        : 'text-paper hover:bg-white/5'
                    }`
                  }
                >
                  {item.label.toUpperCase()}
                </NavLink>
              ) : (
                <span
                  key={item.label}
                  title="Coming in a later phase"
                  className="mx-3 px-4 py-3 rounded-md font-bold tracking-wide text-paper/35 cursor-default select-none"
                >
                  {item.label.toUpperCase()}
                </span>
              ),
            )}
          </nav>
        </aside>

        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
