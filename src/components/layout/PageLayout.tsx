import { useCallback, useState } from "react";
import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, User, LogOut } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import Sidebar from "@/components/layout/Sidebar";
import Avatar from "@/components/ui/Avatar";
import Dropdown from "@/components/ui/Dropdown";

export default function PageLayout({ children }: { children: ReactNode }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem("sidebar-collapsed") === "true"
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleCollapse = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("sidebar-collapsed", String(next));
      return next;
    });
  }, []);

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="h-screen flex overflow-hidden bg-ink text-paper">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={closeMobile}
        onToggleCollapse={toggleCollapse}
      />

      <div className="relative flex-1 bg-ink-soft rounded-4xl overflow-hidden min-w-0 my-4 mr-4">
        <main className="h-full overflow-y-auto pt-16 px-5 pb-5 lg:pt-8 lg:px-8 lg:pb-8">
          {children}
        </main>
      </div>

      <div className="fixed top-8 right-8 z-50">
        <Dropdown
          align="right"
          trigger={
            <button
              className="rounded-full ring-2 ring-transparent hover:ring-gold/40 transition-all duration-150"
              aria-label="User menu"
            >
              <Avatar name={profile?.display_name} />
            </button>
          }
        >
          <div className="px-4 py-3 border-b border-white/8">
            <p className="text-sm font-semibold text-paper truncate">
              {profile?.display_name ?? "Member"}
            </p>
          </div>
          <div className="py-1">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-paper/70 hover:text-paper hover:bg-white/5 transition-colors"
            >
              <User size={15} aria-hidden="true" />
              Profile
            </Link>
          </div>
          <div className="border-t border-white/8 py-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400/70 hover:text-red-400 hover:bg-white/5 transition-colors text-left"
            >
              <LogOut size={15} aria-hidden="true" />
              Sign out
            </button>
          </div>
        </Dropdown>
      </div>

      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-5 left-5 z-50 lg:hidden p-2.5 rounded-xl bg-ink-soft/90 text-paper/60 hover:text-paper hover:bg-white/10 transition-colors backdrop-blur-sm"
        aria-label="Open navigation"
      >
        <Menu size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
