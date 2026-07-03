import { Link } from "react-router-dom";
import Logo from "@/components/ui/Logo";
import Avatar from "@/components/ui/Avatar";
import Dropdown from "@/components/ui/Dropdown";

interface TopBarProps {
  displayName?: string | null;
  onSignOut: () => void;
  onMenuToggle: () => void;
}

export default function TopBar({
  displayName,
  onSignOut,
  onMenuToggle,
}: TopBarProps) {
  return (
    <header className="bg-ink-soft shrink-0 flex items-center justify-between px-4 lg:px-6 h-14 lg:h-20 border-b border-white/8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="p-2 -ml-1 rounded-md text-paper/60 hover:text-paper hover:bg-white/10 transition-colors"
          aria-label="Toggle navigation"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="currentColor"
            aria-hidden="true"
          >
            <rect y="2" width="18" height="2" rx="1" />
            <rect y="8" width="18" height="2" rx="1" />
            <rect y="14" width="18" height="2" rx="1" />
          </svg>
        </button>
        <Logo className="h-8 lg:h-14" />
      </div>

      <div className="flex items-center gap-4 lg:gap-6 text-sm font-semibold tracking-wide">
        <Dropdown
          align="right"
          trigger={
            <button
              className="rounded-full ring-2 ring-transparent hover:ring-gold/40 transition-all duration-150"
              aria-label="User menu"
            >
              <Avatar name={displayName} />
            </button>
          }
        >
          {/* User info header */}
          <div className="px-4 py-3 border-b border-white/8">
            <p className="text-sm font-semibold text-paper truncate">
              {displayName ?? "Member"}
            </p>
            <p className="text-xs text-paper/40 mt-0.5">UPCSG Hub</p>
          </div>

          {/* Navigation items */}
          <div className="py-1">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-paper/70 hover:text-paper hover:bg-white/5 transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <circle cx="7.5" cy="5" r="2.5" />
                <path d="M2 13c0-3 2.5-5 5.5-5s5.5 2 5.5 5" strokeLinecap="round" />
              </svg>
              Profile &amp; Settings
            </Link>
          </div>

          {/* Destructive actions */}
          <div className="border-t border-white/8 py-1">
            <button
              onClick={onSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-white/5 transition-colors text-left"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M5 7.5h7m0 0-2.5-2.5M12 7.5 9.5 10" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 4V3a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-1" strokeLinecap="round" />
              </svg>
              Sign out
            </button>
          </div>
        </Dropdown>
      </div>
    </header>
  );
}
