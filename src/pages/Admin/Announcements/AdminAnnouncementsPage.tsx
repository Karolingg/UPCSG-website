import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ImageOff,
  Link2,
  FileText,
  Eye,
  EyeOff,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import PageLayout from '@/components/layout/PageLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { formatDate } from '@/pages/Announcements/AnnouncementsPage'
import type { NewsPost, NewsStatus } from '@/types/db'

type StatusFilter = 'all' | NewsStatus

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Drafts' },
]

function storagePathFromUrl(url: string | null): string | null {
  if (!url) return null
  const marker = '/announcement-images/'
  const idx = url.indexOf(marker)
  return idx === -1 ? null : decodeURIComponent(url.slice(idx + marker.length))
}

export default function AdminAnnouncementsPage() {
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryTick, setRetryTick] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchPosts() {
      setLoading(true)
      setError('')
      let q = supabase
        .from('news')
        .select('*')
        .order('created_at', { ascending: false })
      if (filter !== 'all') q = q.eq('status', filter)
      const s = query.trim()
      if (s) q = q.or(`title.ilike.%${s}%,summary.ilike.%${s}%`)

      const { data, error } = await q
      if (cancelled) return
      if (error) {
        setError(error.message)
        setPosts([])
      } else {
        setPosts(data as NewsPost[])
      }
      setLoading(false)
    }
    const timer = setTimeout(fetchPosts, query ? 300 : 0)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, filter, retryTick])

  async function handleToggleStatus(post: NewsPost) {
    const next: NewsStatus = post.status === 'published' ? 'draft' : 'published'
    setBusyId(post.id)
    const { error } = await supabase.from('news').update({ status: next }).eq('id', post.id)
    setBusyId(null)
    if (error) {
      window.alert(`Failed to update status: ${error.message}`)
      return
    }
    setPosts(ps =>
      filter === 'all'
        ? ps.map(p => (p.id === post.id ? { ...p, status: next } : p))
        : ps.filter(p => p.id !== post.id),
    )
  }

  async function handleDelete(post: NewsPost) {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return
    setBusyId(post.id)

    const { data: galleryImgs } = await supabase
      .from('news_images')
      .select('image_url')
      .eq('news_id', post.id)
    const galleryUrls = (galleryImgs ?? []).map(g => (g as { image_url: string }).image_url)

    const paths = [post.image_url, post.article_image_url, ...galleryUrls]
      .map(storagePathFromUrl)
      .filter((p): p is string => p !== null)
    if (paths.length > 0) {
      await supabase.storage.from('announcement-images').remove(paths)
    }

    const { error } = await supabase.from('news').delete().eq('id', post.id)
    setBusyId(null)
    if (error) {
      window.alert(`Failed to delete: ${error.message}`)
    } else {
      setPosts(ps => ps.filter(p => p.id !== post.id))
    }
  }

  return (
    <PageLayout>
      <Link
        to="/announcements"
        className="inline-flex items-center gap-2 text-sm font-medium text-paper/60 hover:text-gold transition-colors"
      >
        <ArrowLeft size={16} /> Back to Announcements
      </Link>

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4 pr-16">
        <div>
          <h1 className="text-4xl font-extrabold text-paper tracking-tight">
            Manage Announcements
          </h1>
          <p className="mt-1.5 text-sm text-paper/50">
            Create, edit, and publish announcements for the guild.
          </p>
        </div>
        <Link to="/admin/announcements/new">
          <Button className="flex items-center gap-2 shrink-0">
            <Plus size={16} /> Add New
          </Button>
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paper/40" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search title or summary…"
            className="w-full bg-ink-soft border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-paper text-sm placeholder-paper/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
          />
        </div>

        <div className="inline-flex rounded-xl border border-white/10 bg-ink-soft p-1 gap-1">
          {FILTERS.map(f => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer ${
                filter === f.value
                  ? 'bg-gold text-ink'
                  : 'text-paper/50 hover:text-paper hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-8 flex flex-col gap-4 max-w-3xl animate-pulse">
          {[0, 1, 2].map(i => (
            <div key={i} className="h-24 rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-8 max-w-lg">
          <Card>
            <p className="text-sm font-semibold text-red-400">Failed to load announcements.</p>
            <p className="mt-1 text-xs text-paper/40 break-words">{error}</p>
            <Button
              variant="secondary"
              onClick={() => setRetryTick(t => t + 1)}
              className="mt-4 flex items-center gap-2 text-sm"
            >
              <RefreshCw size={14} /> Try again
            </Button>
          </Card>
        </div>
      ) : posts.length === 0 ? (
        <div className="mt-8 max-w-lg">
          <Card>
            <p className="text-sm text-paper/50">
              {query
                ? 'No announcements match your search.'
                : filter === 'draft'
                  ? 'No drafts.'
                  : filter === 'published'
                    ? 'No published announcements.'
                    : 'No announcements yet. Create the first one.'}
            </p>
          </Card>
        </div>
      ) : (
        <>
          <p className="mt-8 font-display text-[11px] font-semibold uppercase tracking-wider text-paper/40">
            {posts.length} {posts.length === 1 ? 'announcement' : 'announcements'}
          </p>
          <div className="mt-3 flex flex-col gap-3 max-w-3xl">
            {posts.map(post => (
              <div
                key={post.id}
                className="group bg-surface rounded-2xl border border-white/10 p-4 flex items-center gap-4 hover:border-white/20 transition-colors"
              >
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    alt=""
                    className="h-16 w-24 shrink-0 object-contain bg-ink-soft rounded-lg"
                  />
                ) : (
                  <div className="h-16 w-24 shrink-0 bg-ink-soft rounded-lg flex items-center justify-center text-paper/20">
                    <ImageOff size={20} />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      to={`/announcements/${post.id}`}
                      className="text-paper font-bold tracking-tight truncate hover:text-gold-soft transition-colors"
                    >
                      {post.title}
                    </Link>
                    {post.status === 'draft' ? (
                      <Badge tone="neutral">Draft</Badge>
                    ) : (
                      <Badge tone="success">Published</Badge>
                    )}
                    {post.redirect_type === 'link' && (
                      <Badge tone="info">
                        <Link2 size={11} /> Link
                      </Badge>
                    )}
                    {post.redirect_type === 'article' && (
                      <Badge tone="gold">
                        <FileText size={11} /> Article
                      </Badge>
                    )}
                  </div>
                  <p className="font-display text-[11px] font-semibold uppercase tracking-wider text-paper/40 mt-1.5">
                    {formatDate(post.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleToggleStatus(post)}
                    disabled={busyId === post.id}
                    className="p-2.5 rounded-lg text-paper/50 hover:text-gold hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
                    aria-label={post.status === 'published' ? 'Unpublish' : 'Publish'}
                    title={post.status === 'published' ? 'Unpublish (move to drafts)' : 'Publish now'}
                  >
                    {post.status === 'published' ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <Link
                    to={`/admin/announcements/${post.id}/edit`}
                    className="p-2.5 rounded-lg text-paper/50 hover:text-gold hover:bg-white/5 transition-colors"
                    aria-label="Edit"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(post)}
                    disabled={busyId === post.id}
                    className="p-2.5 rounded-lg text-paper/50 hover:text-red-400 hover:bg-white/5 transition-colors disabled:opacity-50 cursor-pointer"
                    aria-label="Delete"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </PageLayout>
  )
}
