import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Pencil, Link2, FileText, Share2, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth-context'
import PageLayout from '@/components/layout/PageLayout'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import ImageCarousel from '@/components/ui/ImageCarousel'
import { formatDate } from './AnnouncementsPage'
import type { NewsImage, NewsPost } from '@/types/db'

export default function AnnouncementDetail() {
  const { id } = useParams<{ id: string }>()
  const { isAdmin, isOfficer } = useAuth()
  const [post, setPost] = useState<NewsPost | null>(null)
  const [gallery, setGallery] = useState<NewsImage[]>([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copy this link:', window.location.href)
    }
  }

  useEffect(() => {
    async function fetchPost() {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single()
      if (error || !data) {
        setPost(null)
        setLoading(false)
        return
      }
      setPost(data as NewsPost)
      const { data: imgs } = await supabase
        .from('news_images')
        .select('*')
        .eq('news_id', id)
        .order('sort_order', { ascending: true })
      setGallery((imgs ?? []) as NewsImage[])
      setLoading(false)
    }
    fetchPost()
  }, [id])

  const heroImages = post
    ? [post.image_url, ...gallery.map(g => g.image_url)].filter(
        (u): u is string => Boolean(u),
      )
    : []

  return (
    <PageLayout>
      <div className="flex items-center justify-between gap-4 pr-16">
        <Link
          to="/announcements"
          className="inline-flex items-center gap-2 text-sm font-medium text-paper/60 hover:text-gold transition-colors"
        >
          <ArrowLeft size={16} /> Back to Announcements
        </Link>

        {post && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-1.5 text-sm font-semibold text-paper/70 hover:text-paper hover:bg-white/5 transition-colors cursor-pointer"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Share2 size={14} />}
              {copied ? 'Copied!' : 'Share'}
            </button>
            {(isAdmin() || isOfficer()) && (
              <Link
                to={`/admin/announcements/${post.id}/edit`}
                className="inline-flex items-center gap-2 rounded-lg border border-gold/40 px-3.5 py-1.5 text-sm font-semibold text-gold hover:bg-gold/10 transition-colors"
              >
                <Pencil size={14} /> Edit
              </Link>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="mt-8 max-w-3xl animate-pulse">
          <div className="h-72 w-full rounded-2xl bg-white/5" />
          <div className="mt-6 h-4 w-24 rounded bg-white/5" />
          <div className="mt-3 h-8 w-3/4 rounded bg-white/5" />
          <div className="mt-4 h-4 w-full rounded bg-white/5" />
          <div className="mt-2 h-4 w-5/6 rounded bg-white/5" />
        </div>
      ) : !post ? (
        <div className="mt-10 max-w-lg">
          <Card>
            <p className="text-sm text-paper/50">Announcement not found.</p>
            <Link
              to="/announcements"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-gold hover:text-gold-soft"
            >
              <ArrowLeft size={14} /> Return to Announcements
            </Link>
          </Card>
        </div>
      ) : (
        <article className="mt-8 max-w-3xl mx-auto">
          <div className="bg-surface rounded-2xl border border-white/10 overflow-hidden">
            {heroImages.length > 0 ? (
              <ImageCarousel images={heroImages} />
            ) : (
              <div className="h-2 w-full bg-gold/40" />
            )}

            <div className="p-8 sm:p-12 text-center">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <p className="font-display text-[11px] font-bold tracking-[0.2em] text-gold uppercase">
                  Announcement
                </p>
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

              <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold text-paper leading-tight tracking-tight break-words">
                {post.title}
              </h1>
              <p className="mt-3 text-sm text-paper/40">{formatDate(post.created_at)}</p>

              {post.summary && (
                <>
                  <div className="mx-auto mt-6 h-px w-16 bg-white/10" />
                  <p className="mt-6 text-lg text-paper/80 leading-relaxed whitespace-pre-wrap max-w-2xl mx-auto break-words">
                    {post.summary}
                  </p>
                </>
              )}

              {post.redirect_type === 'link' && post.redirect_url && (
                <a
                  href={post.redirect_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex items-center gap-2 bg-gold text-ink font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-gold-soft transition-colors"
                >
                  View Source <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>

          {post.redirect_type === 'article' && (
            <div className="mt-6 bg-surface rounded-2xl border border-white/10 p-8 sm:p-12">
              <div className="text-center">
                <p className="font-display text-[11px] font-bold tracking-[0.2em] text-gold uppercase">
                  Full Article
                </p>
                {post.article_title && (
                  <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-paper leading-tight tracking-tight break-words">
                    {post.article_title}
                  </h2>
                )}

                {(post.article_author_name || post.article_author_title || post.article_author_email) && (
                  <div className="mt-5 inline-flex items-center gap-3 rounded-xl bg-ink-soft/60 border border-white/10 p-4 text-left">
                    <div className="h-11 w-11 shrink-0 rounded-full bg-gold/15 text-gold flex items-center justify-center font-display font-bold text-lg">
                      {(post.article_author_name ?? '?').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      {post.article_author_name && (
                        <p className="text-paper font-semibold text-sm leading-tight">
                          {post.article_author_name}
                        </p>
                      )}
                      <p className="text-xs text-paper/50 leading-tight mt-0.5">
                        {[post.article_author_title, post.article_author_email]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {post.article_image_url && (
                <img
                  src={post.article_image_url}
                  alt=""
                  className="mt-8 w-full h-auto rounded-xl border border-white/10"
                />
              )}

              {post.article_content && (
                <p className="mt-8 text-[15px] text-paper/85 leading-[1.8] whitespace-pre-wrap break-words">
                  {post.article_content}
                </p>
              )}
            </div>
          )}

        </article>
      )}
    </PageLayout>
  )
}
