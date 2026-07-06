import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, ImageOff, ArrowRight, Link2, FileText, RefreshCw, Settings2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth-context'
import PageLayout from '@/components/layout/PageLayout'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import ImageCarousel from '@/components/ui/ImageCarousel'
import { formatDate, titleSummaryFilter, resolveThumbnails } from './utils'
import type { NewsPost, RedirectType } from '@/types/db'

const PAGE_SIZE = 9

function TypeBadge({ type }: { type: RedirectType }) {
  if (type === 'link')
    return (
      <Badge tone="info">
        <Link2 size={11} /> Link
      </Badge>
    )
  if (type === 'article')
    return (
      <Badge tone="gold">
        <FileText size={11} /> Article
      </Badge>
    )
  return null
}

export default function AnnouncementsPage() {
  const { isAdmin, isOfficer } = useAuth()
  const [posts, setPosts] = useState<NewsPost[]>([])
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [retryTick, setRetryTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    async function fetchPosts() {
      if (page === 1) setLoading(true)
      else setLoadingMore(true)
      setError('')

      let q = supabase
        .from('news')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .range(0, page * PAGE_SIZE) // one extra row to detect "load more"
      const s = query.trim()
      if (s) q = q.or(titleSummaryFilter(s))

      const { data, error } = await q
      if (cancelled) return

      if (error) {
        setError(error.message)
        setPosts([])
        setHasMore(false)
      } else {
        const rows = data as NewsPost[]
        setHasMore(rows.length > page * PAGE_SIZE)
        setPosts(rows.slice(0, page * PAGE_SIZE))
      }
      setLoading(false)
      setLoadingMore(false)
    }
    const timer = setTimeout(fetchPosts, query ? 300 : 0)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, page, retryTick])

  const searching = query.trim().length > 0
  const featured = !searching && posts.length > 0 ? posts[0] : null
  const list = featured ? posts.slice(1) : posts
  const canManage = isAdmin() || isOfficer()

  // Thumbnail per post: cover, or first gallery image when there's no cover
  const [thumbs, setThumbs] = useState<Record<string, string>>({})
  useEffect(() => {
    let cancelled = false
    resolveThumbnails(posts).then(m => {
      if (!cancelled) setThumbs(m)
    })
    return () => {
      cancelled = true
    }
  }, [posts])

  // Cover + gallery images for the featured post's carousel
  const [featuredImages, setFeaturedImages] = useState<string[]>([])
  useEffect(() => {
    let cancelled = false
    async function loadImages(post: NewsPost | null) {
      if (!post) {
        if (!cancelled) setFeaturedImages([])
        return
      }
      const { data } = await supabase
        .from('news_images')
        .select('image_url')
        .eq('news_id', post.id)
        .order('sort_order', { ascending: true })
      if (cancelled) return
      const galleryUrls = (data ?? []).map(d => (d as { image_url: string }).image_url)
      setFeaturedImages([post.image_url, ...galleryUrls].filter((u): u is string => Boolean(u)))
    }
    loadImages(featured)
    return () => {
      cancelled = true
    }
  }, [featured?.id, featured?.image_url]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <PageLayout>
      <div className="flex flex-wrap items-start justify-between gap-4 pr-16">
        <div>
          <h1 className="text-4xl font-extrabold text-paper tracking-tight">Announcements</h1>
          <p className="mt-1.5 text-sm text-paper/50">
            Guild news, opportunities, and updates from the org.
          </p>
        </div>
        {canManage && (
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/admin/announcements">
              <Button variant="secondary" className="flex items-center gap-2">
                <Settings2 size={16} /> Manage
              </Button>
            </Link>
            <Link to="/admin/announcements/new">
              <Button className="flex items-center gap-2">
                <Plus size={16} /> Add New
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6 relative max-w-xl">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paper/40" />
        <input
          type="text"
          value={query}
          onChange={e => {
            setQuery(e.target.value)
            setPage(1)
          }}
          placeholder="Search title or summary…"
          className="w-full bg-ink-soft border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-paper text-sm placeholder-paper/30 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors"
        />
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => setRetryTick(t => t + 1)} />
      ) : (
        <>
          {featured && <FeaturedAnnouncement post={featured} images={featuredImages} />}

          <div className="mt-14">
            <h2 className="text-xl font-bold text-paper tracking-tight">
              {searching ? 'Search Results' : featured ? 'More Announcements' : 'All Announcements'}
            </h2>
          </div>

          {list.length === 0 ? (
            <EmptyState searching={searching} hasFeatured={Boolean(featured)} canManage={canManage} />
          ) : (
            <>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {list.map(post => (
                  <AnnouncementCard key={post.id} post={post} thumb={thumbs[post.id]} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-8 flex justify-center">
                  <Button
                    variant="secondary"
                    onClick={() => setPage(p => p + 1)}
                    disabled={loadingMore}
                    className="px-8"
                  >
                    {loadingMore ? 'Loading…' : 'Load More'}
                  </Button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </PageLayout>
  )
}

function FeaturedAnnouncement({ post, images }: { post: NewsPost; images: string[] }) {
  return (
    <section className="mt-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="h-1.5 w-1.5 rounded-full bg-gold" />
        <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
          Latest Announcement
        </p>
      </div>
      <div className="group max-w-4xl mx-auto bg-surface rounded-2xl border border-white/10 overflow-hidden hover:border-gold/40 hover:shadow-xl hover:shadow-black/25 transition-all duration-200">
        <div className="relative">
          {images.length > 0 ? (
            <ImageCarousel images={images} />
          ) : (
            <div className="w-full h-56 bg-ink-soft flex items-center justify-center text-paper/20">
              <ImageOff size={40} />
            </div>
          )}
          {post.redirect_type !== 'none' && (
            <div className="absolute top-4 left-4 z-10">
              <TypeBadge type={post.redirect_type} />
            </div>
          )}
        </div>
        <Link to={`/announcements/${post.id}`} className="block p-8 sm:p-10 text-center">
          <p className="font-display text-[11px] font-bold tracking-[0.2em] text-gold uppercase">
            Announcement
          </p>
          <h3 className="mt-3 text-2xl sm:text-3xl font-extrabold text-paper leading-tight tracking-tight max-w-2xl mx-auto break-words">
            {post.title}
          </h3>
          {post.summary && (
            <p className="mt-4 text-paper/70 leading-relaxed whitespace-pre-wrap max-w-2xl mx-auto line-clamp-4 break-words">
              {post.summary}
            </p>
          )}
          <p className="mt-6 text-sm text-paper/40">{formatDate(post.created_at)}</p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-gold font-semibold text-sm group-hover:gap-2.5 transition-all">
            Read announcement <ArrowRight size={15} />
          </span>
        </Link>
      </div>
    </section>
  )
}

function AnnouncementCard({ post, thumb }: { post: NewsPost; thumb?: string }) {
  return (
    <Link
      to={`/announcements/${post.id}`}
      className="group bg-surface rounded-2xl border border-white/10 overflow-hidden hover:border-gold/40 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/25 transition-all duration-200 flex flex-col"
    >
      <div className="relative">
        {thumb ? (
          <img src={thumb} alt="" className="h-40 w-full object-cover bg-ink-soft" />
        ) : (
          <div className="h-40 w-full bg-ink-soft flex items-center justify-center text-paper/20">
            <ImageOff size={28} />
          </div>
        )}
        {post.redirect_type !== 'none' && (
          <div className="absolute top-3 left-3">
            <TypeBadge type={post.redirect_type} />
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <p className="font-display text-[11px] font-semibold uppercase tracking-wider text-paper/40">
          {formatDate(post.created_at)}
        </p>
        <h2 className="text-paper font-bold leading-snug tracking-tight group-hover:text-gold-soft transition-colors break-words">
          {post.title}
        </h2>
        {post.summary && (
          <p className="text-sm text-paper/60 leading-relaxed line-clamp-2 break-words">{post.summary}</p>
        )}
        <span className="mt-auto pt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold/80 group-hover:gap-2 group-hover:text-gold transition-all">
          Read more <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  )
}

function EmptyState({
  searching,
  hasFeatured,
  canManage,
}: {
  searching: boolean
  hasFeatured: boolean
  canManage: boolean
}) {
  return (
    <div className="mt-6 max-w-lg">
      <Card>
        <div className="flex items-center gap-3 text-paper/50">
          <Search size={18} className="shrink-0" />
          <p className="text-sm">
            {searching
              ? 'No announcements match your search.'
              : hasFeatured
                ? 'No other announcements yet.'
                : 'No announcements yet. Check back soon.'}
          </p>
        </div>
        {canManage && !searching && !hasFeatured && (
          <Link to="/admin/announcements/new" className="mt-4 inline-block">
            <Button className="flex items-center gap-2">
              <Plus size={15} /> Create the first announcement
            </Button>
          </Link>
        )}
      </Card>
    </div>
  )
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mt-10 max-w-lg">
      <Card>
        <p className="text-sm font-semibold text-red-400">Failed to load announcements.</p>
        <p className="mt-1 text-xs text-paper/40 break-words">{message}</p>
        <Button variant="secondary" onClick={onRetry} className="mt-4 flex items-center gap-2 text-sm">
          <RefreshCw size={14} /> Try again
        </Button>
      </Card>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="mt-8 animate-pulse">
      <div className="h-4 w-40 rounded bg-white/5 mb-4" />
      <div className="h-80 max-w-4xl mx-auto rounded-2xl bg-white/5" />
      <div className="mt-14 h-6 w-48 rounded bg-white/5" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-64 rounded-2xl bg-white/5" />
        ))}
      </div>
    </div>
  )
}
