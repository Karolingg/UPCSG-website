import Logo from "@/components/ui/Logo";
import Button from "@/components/ui/Button";

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
    <header className="nebula-bg shrink-0 flex items-center justify-between px-4 lg:px-6 h-14 lg:h-20 border-b border-white/10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-1 rounded-md text-paper/60 hover:text-paper hover:bg-white/10 transition-colors"
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

      <div className="flex items-center gap-3 lg:gap-6 text-sm font-semibold tracking-wide">
        <div className="hidden lg:flex items-center gap-6">
          <span className="text-paper/40 cursor-default">NEWS</span>
          <span className="text-paper/40 cursor-default">BADGES</span>
        </div>
        <div className="flex items-center gap-2 lg:gap-3 lg:pl-4 border-l border-white/10 pl-3">
          <span className="text-paper/60 hidden sm:inline text-sm truncate max-w-32">
            {displayName}
          </span>
          <Button
            onClick={onSignOut}
            className="px-3 py-1.5 text-xs rounded-md"
          >
            LOGOUT
          </Button>
        </div>
      </div>
    </header>
  );
}
