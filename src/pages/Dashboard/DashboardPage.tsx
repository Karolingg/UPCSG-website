import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/auth-context";
import PageLayout from "@/components/layout/PageLayout";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import { formatDate, resolveThumbnails } from "@/pages/Announcements/utils";
import type { NewsPost } from "@/types/db";

export default function DashboardPage() {
  const { roles, isAdmin, isOfficer } = useAuth();
  const [latest, setLatest] = useState<NewsPost | null>(null);
  const [thumb, setThumb] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLatest() {
      const { data } = await supabase
        .from("news")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        const post = data as NewsPost;
        setLatest(post);
        const map = await resolveThumbnails([post]);
        setThumb(map[post.id] ?? null);
      }
    }
    fetchLatest();
  }, []);

  return (
    <PageLayout>
      <h1 className="text-3xl font-bold text-paper">Dashboard</h1>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <p className="text-paper/60 text-sm">Your roles</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {roles.length === 0 ? (
              <span className="text-paper/40 text-sm">No roles assigned</span>
            ) : (
              roles.map((r) => <Pill key={r.id}>{r.role}</Pill>)
            )}
          </div>
        </Card>

        <Card to="/profile" hover>
          <p className="text-paper font-semibold">Profile &amp; settings</p>
          <p className="text-paper/60 text-sm mt-1">
            Edit your display name and details.
          </p>
        </Card>

        {(isAdmin() || isOfficer()) && (
          <Card to="/admin" hover>
            <p className="text-paper font-semibold">Admin panel</p>
            <p className="text-paper/60 text-sm mt-1">
              Manage events, news, and roles.
            </p>
          </Card>
        )}
      </div>

      {latest && (
        <div className="mt-10 max-w-3xl">
          <h2 className="text-lg font-bold text-paper tracking-wide">
            Latest Announcement
          </h2>
          <Link
            to={`/announcements/${latest.id}`}
            className="mt-4 flex flex-col sm:flex-row bg-surface rounded-xl border border-white/10 overflow-hidden hover:border-gold/50 transition-colors"
          >
            {thumb ? (
              <img
                src={thumb}
                alt=""
                className="sm:w-64 h-44 shrink-0 object-cover bg-ink-soft"
              />
            ) : (
              <div className="sm:w-64 h-44 sm:h-auto shrink-0 bg-ink-soft flex items-center justify-center text-paper/20">
                <ImageOff size={28} />
              </div>
            )}
            <div className="p-5 flex flex-col justify-center gap-2">
              <p className="text-xs font-bold tracking-widest text-gold uppercase">
                Announcement
              </p>
              <p className="text-paper font-semibold leading-snug">
                {latest.title}
              </p>
              {latest.summary && (
                <p className="text-sm text-paper/60 line-clamp-2">
                  {latest.summary}
                </p>
              )}
              <p className="text-xs text-paper/40 mt-1">
                {formatDate(latest.created_at)}
              </p>
            </div>
          </Link>
        </div>
      )}
    </PageLayout>
  );
}
