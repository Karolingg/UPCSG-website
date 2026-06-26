import { useCallback, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import NavButton from '@/components/ui/NavButton'

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

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation()

  const close = useCallback(onClose, [onClose])
  useEffect(() => {
    close()
  }, [location.pathname, close])

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 z-20 lg:hidden transition-opacity duration-200 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar panel — fixed overlay on mobile, static in flow on desktop */}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-30 w-64 bg-ink-soft border-r border-white/5 transition-transform duration-200 overflow-y-auto
          lg:static lg:top-auto lg:bottom-auto lg:w-60 lg:shrink-0 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="flex flex-col gap-0.5 px-3 py-5">
          {NAV_ITEMS.map(item => (
            <NavButton key={item.label} to={item.to}>
              {item.label.toUpperCase()}
            </NavButton>
          ))}
        </nav>
      </aside>
    </>
  )
}
