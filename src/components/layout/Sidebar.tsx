import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Megaphone,
  CalendarDays,
  GraduationCap,
  Briefcase,
  Users,
  UserCircle,
  Settings,
  ChevronLeft,
} from "lucide-react";
import NavButton from "@/components/ui/NavButton";
import Logo from "@/components/ui/Logo";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard size={16} /> },
  { label: "Announcements", to: "/announcements", icon: <Megaphone size={16} /> },
  { label: "Events", to: "/events", icon: <CalendarDays size={16} /> },
  { label: "Scholarships", to: "/scholarships", icon: <GraduationCap size={16} /> },
  { label: "Internships", to: "/internships", icon: <Briefcase size={16} /> },
  { label: "Officers", to: "/officers", icon: <Users size={16} /> },
  { label: "Profile", to: "/profile", icon: <UserCircle size={16} /> },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  collapsed,
  mobileOpen,
  onMobileClose,
  onToggleCollapse,
}: SidebarProps) {
  const location = useLocation();

  useEffect(() => {
    onMobileClose();
  }, [location.pathname, onMobileClose]);

  return (
    <>
      <div
        className={`fixed 
          inset-0 bg-black/60 z-30 lg:hidden transition-opacity duration-200 ${
            mobileOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        onClick={onMobileClose}
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 bg-ink flex flex-col overflow-hidden ",
          "transition-[width,transform] duration-300 ease-in-out ",
          "lg:static lg:inset-auto lg:z-auto lg:shrink-0 ",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          collapsed ? "w-64 lg:w-16" : "w-64 lg:w-56",
        ].join(" ")}
      >
        <div
          className={`shrink-0 flex items-center justify-center py-6 overflow-hidden `}
        >
          <div>
            <Logo className="h-10" />
          </div>
        </div>

        <nav
          className={`flex flex-col gap-1 flex-1 overflow-y-auto overflow-x-hidden py-2 px-3`}
        >
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.label}
              to={item.to}
              icon={item.icon}
              collapsed={collapsed && !mobileOpen}
            >
              {item.label}
            </NavButton>
          ))}
        </nav>

        <div className="shrink-0 px-3 py-2 border-t border-white/5">
          <NavButton
            to="/settings"
            icon={<Settings size={16} />}
            collapsed={collapsed && !mobileOpen}
          >
            Settings
          </NavButton>
        </div>

        <div className="hidden lg:flex shrink-0 items-center justify-center p-3 border-t border-white/5">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-xl text-paper/40 hover:text-paper hover:bg-white/8 transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <span
              className={`block transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}
            >
              <ChevronLeft size={16} />
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
