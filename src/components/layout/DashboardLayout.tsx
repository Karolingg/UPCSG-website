import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/auth-context'
import TopBar from '@/components/layout/TopBar'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-ink text-paper">
      <TopBar
        displayName={profile?.display_name}
        onSignOut={handleSignOut}
        onMenuToggle={() => setSidebarOpen(o => !o)}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar open={sidebarOpen} onClose={closeSidebar} />
        <main className="flex-1 overflow-y-auto p-5 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
