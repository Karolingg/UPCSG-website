import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImagePlus,
  Images,
  X,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/auth-context'
import PageLayout from '@/components/layout/PageLayout'
import Button from '@/components/ui/Button'
import { formatDate } from '@/pages/Announcements/utils'
import type { NewsImage, NewsPost, NewsStatus, RedirectType } from '@/types/db'

/** A gallery slot: either an image already in the DB, or a newly picked file. */
interface GalleryItem {
  key: string
  existingId?: string
  url: string // public URL (existing) or object URL (new)
  file?: File
}

const inputClass =
  'w-full bg-ink border border-white/10 rounded-xl px-4 py-3 text-paper text-sm placeholder-paper/25 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-colors'

const labelClass =
  'block text-xs font-bold uppercase tracking-widest text-paper/50 mb-2'

interface FormState {
  title: string
  summary: string
  status: NewsStatus
  redirect_type: RedirectType
  redirect_url: string
  article_title: string
  article_content: string
  article_author_name: string
  article_author_email: string
  article_author_title: string
}

const EMPTY_FORM: FormState = {
  title: '',
  summary: '',
  status: 'published',
  redirect_type: 'none',
  redirect_url: '',
  article_title: '',
  article_content: '',
  article_author_name: '',
  article_author_email: '',
  article_author_title: '',
}

function storagePathFromUrl(url: string | null): string | null {
  if (!url) return null
  const marker = '/announcement-images/'
  const idx = url.indexOf(marker)
  return idx === -1 ? null : decodeURIComponent(url.slice(idx + marker.length))
}

const MAX_IMAGE_MB = 5

function validateImageFile(file: File): string | null {
  if (!file.type.startsWith('image/')) return 'The selected file must be an image.'
  if (file.size > MAX_IMAGE_MB * 1024 * 1024)
    return `Image is too large — must be under ${MAX_IMAGE_MB}MB.`
  return null
}

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/** Object URL for a picked file, revoked automatically on change/unmount. */
function useObjectUrl(file: File | null): string | null {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url)
    }
  }, [url])
  return url
}

async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'png'
  const path = `announcements/${crypto.randomUUID()}.${ext}`
  const { error } = await supabase.storage
    .from('announcement-images')
    .upload(path, file)
  if (error) throw new Error(`Image upload failed: ${error.message}`)
  const { data } = supabase.storage.from('announcement-images').getPublicUrl(path)
  return data.publicUrl
}

export default function AnnouncementForm() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Existing image URLs (edit mode) and newly picked files
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [articleImageUrl, setArticleImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [articleImageFile, setArticleImageFile] = useState<File | null>(null)

  // The cover/article URLs as first loaded from the DB (edit mode). Compared
  // against the saved row so files the post no longer references — whether
  // replaced, cleared, or dropped by switching away from the article type —
  // get removed from storage instead of leaking.
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null)
  const [originalArticleImageUrl, setOriginalArticleImageUrl] = useState<string | null>(null)

  const imagePreview = useObjectUrl(imageFile) ?? imageUrl
  const articleImagePreview = useObjectUrl(articleImageFile) ?? articleImageUrl

  // Gallery (multiple images) — ordered list of existing + newly picked
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [originalGallery, setOriginalGallery] = useState<NewsImage[]>([])

  // Revoke any object URLs we created for gallery previews on unmount
  const galleryRef = useRef<GalleryItem[]>([])
  useEffect(() => {
    galleryRef.current = gallery
  }, [gallery])
  useEffect(
    () => () => {
      galleryRef.current.forEach(i => {
        if (i.file) URL.revokeObjectURL(i.url)
      })
    },
    [],
  )

  // Warn before losing unsaved edits on refresh/close
  const dirtyRef = useRef(false)
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (dirtyRef.current) e.preventDefault()
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [])

  useEffect(() => {
    if (!isEdit) return
    async function fetchPost() {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', id)
        .single()
      if (error || !data) {
        setError('Announcement not found.')
      } else {
        const p = data as NewsPost
        setForm({
          title: p.title,
          summary: p.summary ?? '',
          status: p.status,
          redirect_type: p.redirect_type,
          redirect_url: p.redirect_url ?? '',
          article_title: p.article_title ?? '',
          article_content: p.article_content ?? '',
          article_author_name: p.article_author_name ?? '',
          article_author_email: p.article_author_email ?? '',
          article_author_title: p.article_author_title ?? '',
        })
        setImageUrl(p.image_url)
        setArticleImageUrl(p.article_image_url)
        setOriginalImageUrl(p.image_url)
        setOriginalArticleImageUrl(p.article_image_url)

        const { data: imgs } = await supabase
          .from('news_images')
          .select('*')
          .eq('news_id', id)
          .order('sort_order', { ascending: true })
        const rows = (imgs ?? []) as NewsImage[]
        setOriginalGallery(rows)
        setGallery(rows.map(r => ({ key: r.id, existingId: r.id, url: r.image_url })))
      }
      setLoading(false)
    }
    fetchPost()
  }, [id, isEdit])

  function addGalleryFiles(files: FileList) {
    const additions: GalleryItem[] = []
    for (const file of Array.from(files)) {
      const problem = validateImageFile(file)
      if (problem) {
        setError(problem)
        continue
      }
      additions.push({ key: crypto.randomUUID(), url: URL.createObjectURL(file), file })
    }
    if (additions.length > 0) {
      dirtyRef.current = true
      setError('')
      setGallery(g => [...g, ...additions])
    }
  }

  function removeGalleryItem(key: string) {
    dirtyRef.current = true
    setGallery(g => {
      const item = g.find(i => i.key === key)
      if (item?.file) URL.revokeObjectURL(item.url)
      return g.filter(i => i.key !== key)
    })
  }

  function moveGalleryItem(index: number, dir: -1 | 1) {
    setGallery(g => {
      const j = index + dir
      if (j < 0 || j >= g.length) return g
      const next = [...g]
      ;[next[index], next[j]] = [next[j], next[index]]
      return next
    })
    dirtyRef.current = true
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    dirtyRef.current = true
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handlePickImage(f: File) {
    const problem = validateImageFile(f)
    if (problem) {
      setError(problem)
      return
    }
    dirtyRef.current = true
    setError('')
    setImageFile(f)
  }

  function handlePickArticleImage(f: File) {
    const problem = validateImageFile(f)
    if (problem) {
      setError(problem)
      return
    }
    dirtyRef.current = true
    setError('')
    setArticleImageFile(f)
  }

  function handleNext() {
    if (!form.title.trim()) {
      setError('Announcement title is required.')
      return
    }
    if (form.redirect_type === 'link') {
      if (!form.redirect_url.trim()) {
        setError('Redirect URL is required when redirect is set to LINK.')
        return
      }
      if (!isValidUrl(form.redirect_url.trim())) {
        setError('Redirect URL must be a valid link starting with http:// or https://.')
        return
      }
    }
    if (form.redirect_type === 'article') {
      const email = form.article_author_email.trim()
      if (email && !/^\S+@\S+\.\S+$/.test(email)) {
        setError('Author email does not look like a valid email address.')
        return
      }
    }
    setError('')
    setStep(2)
    window.scrollTo(0, 0)
  }

  async function syncGallery(newsId: string) {
    // Remove existing images the user deleted (rows + storage files)
    const keptIds = new Set(gallery.filter(i => i.existingId).map(i => i.existingId!))
    const removed = originalGallery.filter(im => !keptIds.has(im.id))
    if (removed.length > 0) {
      await supabase
        .from('news_images')
        .delete()
        .in(
          'id',
          removed.map(r => r.id),
        )
      const paths = removed
        .map(r => storagePathFromUrl(r.image_url))
        .filter((p): p is string => p !== null)
      if (paths.length > 0) await supabase.storage.from('announcement-images').remove(paths)
    }

    // Upload new files (insert) and persist the current order for all items
    for (let index = 0; index < gallery.length; index++) {
      const item = gallery[index]
      if (item.file) {
        const url = await uploadImage(item.file)
        const { error } = await supabase
          .from('news_images')
          .insert({ news_id: newsId, image_url: url, sort_order: index })
        if (error) throw new Error(error.message)
      } else if (item.existingId) {
        await supabase
          .from('news_images')
          .update({ sort_order: index })
          .eq('id', item.existingId)
      }
    }
  }

  async function handlePublish() {
    if (!user) return
    setSaving(true)
    setError('')
    try {
      let finalImageUrl = imageUrl
      let finalArticleImageUrl = articleImageUrl

      // Upload new files first. Old files are removed only after the DB write
      // succeeds (see below), so a failed save never leaves the row pointing
      // at an already-deleted object.
      if (imageFile) {
        finalImageUrl = await uploadImage(imageFile)
      }
      if (articleImageFile && form.redirect_type === 'article') {
        finalArticleImageUrl = await uploadImage(articleImageFile)
      }

      const isArticle = form.redirect_type === 'article'
      const payload = {
        title: form.title.trim(),
        summary: form.summary.trim() || null,
        image_url: finalImageUrl,
        status: form.status,
        redirect_type: form.redirect_type,
        redirect_url: form.redirect_type === 'link' ? form.redirect_url.trim() : null,
        article_title: isArticle ? form.article_title.trim() || null : null,
        article_content: isArticle ? form.article_content.trim() || null : null,
        article_author_name: isArticle ? form.article_author_name.trim() || null : null,
        article_author_email: isArticle ? form.article_author_email.trim() || null : null,
        article_author_title: isArticle ? form.article_author_title.trim() || null : null,
        article_image_url: isArticle ? finalArticleImageUrl : null,
      }

      // NOTE: publishing is a multi-step, non-transactional write (news upsert,
      // then syncGallery does row deletes / uploads / inserts, then stale-file
      // cleanup). A failure partway can leave orphaned news_images rows or
      // storage objects. Acceptable for an admin tool at this scale; revisit
      // with an RPC/transaction if it grows.
      let newsId = id
      if (isEdit) {
        const { error } = await supabase.from('news').update(payload).eq('id', id)
        if (error) throw new Error(error.message)
      } else {
        const { data, error } = await supabase
          .from('news')
          .insert({ ...payload, posted_by: user.id })
          .select('id')
          .single()
        if (error) throw new Error(error.message)
        newsId = (data as { id: string }).id
      }

      await syncGallery(newsId!)

      // Save succeeded — remove any originally-referenced cover/article files
      // the saved row no longer points at (replaced, cleared, or dropped by
      // switching away from the article type).
      const savedArticleImageUrl = payload.article_image_url
      const stalePaths = [
        originalImageUrl && originalImageUrl !== finalImageUrl ? originalImageUrl : null,
        originalArticleImageUrl && originalArticleImageUrl !== savedArticleImageUrl
          ? originalArticleImageUrl
          : null,
      ]
        .map(storagePathFromUrl)
        .filter((p): p is string => p !== null)
      if (stalePaths.length > 0) {
        await supabase.storage.from('announcement-images').remove(stalePaths)
      }

      dirtyRef.current = false
      navigate('/admin/announcements')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <p className="text-sm text-paper/40">Loading…</p>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-3xl">
        <Link
          to="/admin/announcements"
          className="inline-flex items-center gap-2 text-sm text-paper/60 hover:text-gold transition-colors"
        >
          <ArrowLeft size={16} /> Back to Announcements
        </Link>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-display text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
              {isEdit ? 'Edit' : 'CMS · New Post'}
            </p>
            <h1 className="mt-1.5 text-4xl font-extrabold text-paper tracking-tight">
              {isEdit ? 'Edit Announcement' : 'Create Announcement'}
            </h1>
          </div>

          <Stepper step={step} />
        </div>

        {step === 1 ? (
          <div className="mt-8 bg-surface rounded-2xl border border-white/10 p-6 sm:p-10">
            <div className="flex items-center justify-between gap-4 pb-6 mb-8 border-b border-white/10">
              <div>
                <h2 className="text-lg font-bold text-paper">Content Details</h2>
                <p className="text-sm text-paper/50 mt-0.5">
                  Fill in the announcement information below.
                </p>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select
                  value={form.status}
                  onChange={e => set('status', e.target.value as NewsStatus)}
                  className="bg-ink border border-white/10 rounded-xl px-4 py-2.5 text-sm font-semibold text-paper focus:outline-none focus:border-gold cursor-pointer"
                >
                  <option value="published">Publish</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="space-y-7">
              <div>
                <label className={labelClass}>Announcement Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => set('title', e.target.value)}
                  placeholder="Input your title here."
                  className={`${inputClass} text-base font-semibold`}
                />
              </div>

              <div>
                <label className={labelClass}>Announcement Summary</label>
                <textarea
                  value={form.summary}
                  onChange={e => set('summary', e.target.value)}
                  rows={5}
                  placeholder="Input your summary here."
                  className={`${inputClass} leading-relaxed`}
                />
              </div>

              <ImagePicker
                label="Announcement Image"
                preview={imagePreview}
                onPick={handlePickImage}
                onClear={() => {
                  setImageFile(null)
                  setImageUrl(null)
                }}
              />

              <GalleryPicker
                items={gallery}
                onAdd={addGalleryFiles}
                onRemove={removeGalleryItem}
                onMove={moveGalleryItem}
              />
            </div>

            <div className="mt-10 pt-8 border-t border-white/10">
              <label className={labelClass}>Redirect Setting</label>
              <p className="text-sm text-paper/50 -mt-1 mb-4">
                Where should this announcement lead when opened?
              </p>
              <div className="inline-flex rounded-xl overflow-hidden border border-white/10 bg-ink p-1 gap-1">
                {(['none', 'link', 'article'] as RedirectType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set('redirect_type', t)}
                    className={`px-6 py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-colors cursor-pointer ${
                      form.redirect_type === t
                        ? 'bg-gold text-ink'
                        : 'text-paper/50 hover:text-paper hover:bg-white/5'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {form.redirect_type === 'link' && (
                <div className="mt-7">
                  <label className={labelClass}>Redirect URL</label>
                  <input
                    type="url"
                    value={form.redirect_url}
                    onChange={e => set('redirect_url', e.target.value)}
                    placeholder="https://facebook.com/upcsg/posts/…"
                    className={inputClass}
                  />
                </div>
              )}

              {form.redirect_type === 'article' && (
                <div className="mt-8 space-y-7">
                  <div>
                    <h3 className="text-base font-bold text-paper">Embedded Article</h3>
                    <p className="text-sm text-paper/50 mt-0.5">
                      The full article shown on the announcement page.
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>Article Title</label>
                    <input
                      type="text"
                      value={form.article_title}
                      onChange={e => set('article_title', e.target.value)}
                      placeholder="Input your title here."
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Article Content</label>
                    <textarea
                      value={form.article_content}
                      onChange={e => set('article_content', e.target.value)}
                      rows={9}
                      placeholder="Input your content here."
                      className={`${inputClass} leading-relaxed`}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Article Author</label>
                    <input
                      type="text"
                      value={form.article_author_name}
                      onChange={e => set('article_author_name', e.target.value)}
                      placeholder="Writer's Name"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid gap-7 sm:grid-cols-2">
                    <div>
                      <label className={labelClass}>Author School Email</label>
                      <input
                        type="email"
                        value={form.article_author_email}
                        onChange={e => set('article_author_email', e.target.value)}
                        placeholder="upmail@up.edu.ph"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Author Title</label>
                      <input
                        type="text"
                        value={form.article_author_title}
                        onChange={e => set('article_author_title', e.target.value)}
                        placeholder="YRLVL - A"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <ImagePicker
                    label="Article Image"
                    preview={articleImagePreview}
                    onPick={handlePickArticleImage}
                    onClear={() => {
                      setArticleImageFile(null)
                      setArticleImageUrl(null)
                    }}
                  />
                </div>
              )}
            </div>

            {error && <p className="mt-6 text-sm text-red-400">{error}</p>}

            <div className="mt-10 pt-6 border-t border-white/10 flex justify-end">
              <Button onClick={handleNext} className="flex items-center gap-2 px-7 py-2.5">
                Next <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              <p className="text-xs font-bold uppercase tracking-widest text-paper/50">
                Preview — this is how members will see it
              </p>
            </div>

            <Preview
              form={form}
              imagePreview={imagePreview}
              articleImagePreview={articleImagePreview}
              galleryPreviews={gallery.map(g => g.url)}
            />

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <div className="flex items-center justify-between mt-8">
              <Button variant="secondary" onClick={() => setStep(1)} disabled={saving} className="px-7 py-2.5">
                Back
              </Button>
              <Button onClick={handlePublish} disabled={saving} className="px-7 py-2.5">
                {saving ? 'Saving…' : form.status === 'draft' ? 'Save Draft' : 'Publish'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  )
}

function Stepper({ step }: { step: 1 | 2 }) {
  return (
    <div className="flex items-center gap-4">
      <StepDot n={1} active={step === 1} done={step > 1} label="Add Content" sub="Add in your content details." />
      <span className="h-px w-8 bg-white/15" />
      <StepDot n={2} active={step === 2} done={false} label="Finalize Content" sub="Review before publishing." />
    </div>
  )
}

function StepDot({
  n,
  active,
  done,
  label,
  sub,
}: {
  n: number
  active: boolean
  done: boolean
  label: string
  sub: string
}) {
  return (
    <div className={`flex items-center gap-3 transition-opacity ${active || done ? '' : 'opacity-40'}`}>
      <span
        className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${
          active
            ? 'bg-gold text-ink'
            : done
              ? 'bg-gold/20 text-gold border border-gold/40'
              : 'bg-ink-soft text-paper/60 border border-white/10'
        }`}
      >
        {n}
      </span>
      <div className="hidden sm:block">
        <p className="text-sm font-bold text-paper leading-tight">{label}</p>
        <p className="text-xs text-paper/50 leading-tight mt-0.5">{sub}</p>
      </div>
    </div>
  )
}

function ImagePicker({
  label,
  preview,
  onPick,
  onClear,
}: {
  label: string
  preview: string | null
  onPick: (f: File) => void
  onClear: () => void
}) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      {preview ? (
        <div className="relative inline-block mb-3">
          <img
            src={preview}
            alt=""
            className="max-h-56 w-auto rounded-xl border border-white/10 bg-ink"
          />
          <button
            type="button"
            onClick={onClear}
            className="absolute -top-2 -right-2 bg-ink border border-white/20 rounded-full p-1.5 text-paper/70 hover:text-red-400 transition-colors cursor-pointer"
            aria-label="Remove image"
          >
            <X size={12} />
          </button>
        </div>
      ) : null}
      <div>
        <label className="inline-flex items-center gap-2.5 bg-gold text-ink font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer hover:bg-gold-soft transition-colors">
          <ImagePlus size={16} />
          {preview ? 'Replace Image' : 'Upload Image'}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const f = e.target.files?.[0]
              if (f) onPick(f)
              e.target.value = ''
            }}
          />
        </label>
      </div>
    </div>
  )
}

function GalleryPicker({
  items,
  onAdd,
  onRemove,
  onMove,
}: {
  items: GalleryItem[]
  onAdd: (files: FileList) => void
  onRemove: (key: string) => void
  onMove: (index: number, dir: -1 | 1) => void
}) {
  return (
    <div>
      <label className={labelClass}>Gallery Images (optional)</label>
      <p className="text-sm text-paper/50 -mt-1 mb-3">
        Add extra photos shown as a gallery on the announcement page. Reorder with the arrows.
      </p>

      {items.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
          {items.map((item, index) => (
            <div
              key={item.key}
              className="relative group rounded-xl overflow-hidden border border-white/10 bg-ink"
            >
              <img src={item.url} alt="" className="h-28 w-full object-cover" />
              <div className="absolute top-1.5 left-1.5 bg-ink/80 text-paper/70 text-[10px] font-bold rounded px-1.5 py-0.5">
                {index + 1}
              </div>
              <button
                type="button"
                onClick={() => onRemove(item.key)}
                className="absolute top-1.5 right-1.5 bg-ink/80 border border-white/20 rounded-full p-1 text-paper/70 hover:text-red-400 transition-colors cursor-pointer"
                aria-label="Remove image"
              >
                <X size={12} />
              </button>
              <div className="absolute bottom-1.5 right-1.5 flex gap-1">
                <button
                  type="button"
                  onClick={() => onMove(index, -1)}
                  disabled={index === 0}
                  className="bg-ink/80 border border-white/20 rounded p-1 text-paper/70 hover:text-gold transition-colors disabled:opacity-30 cursor-pointer"
                  aria-label="Move left"
                >
                  <ChevronLeft size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => onMove(index, 1)}
                  disabled={index === items.length - 1}
                  className="bg-ink/80 border border-white/20 rounded p-1 text-paper/70 hover:text-gold transition-colors disabled:opacity-30 cursor-pointer"
                  aria-label="Move right"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className="inline-flex items-center gap-2.5 bg-ink border border-white/15 text-paper font-bold text-sm px-5 py-2.5 rounded-xl cursor-pointer hover:border-gold/50 hover:text-gold transition-colors">
        <Images size={16} />
        {items.length > 0 ? 'Add More Images' : 'Add Gallery Images'}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => {
            if (e.target.files && e.target.files.length > 0) onAdd(e.target.files)
            e.target.value = ''
          }}
        />
      </label>
    </div>
  )
}

function Preview({
  form,
  imagePreview,
  articleImagePreview,
  galleryPreviews,
}: {
  form: FormState
  imagePreview: string | null
  articleImagePreview: string | null
  galleryPreviews: string[]
}) {
  return (
    <article className="bg-surface rounded-2xl border border-white/10 p-6 sm:p-10">
      {imagePreview && (
        <img
          src={imagePreview}
          alt=""
          className="w-full h-auto rounded-xl border border-white/10"
        />
      )}
      <p className="mt-6 text-xs font-bold tracking-widest text-gold uppercase">Announcement</p>
      <h2 className="mt-2 text-2xl font-bold text-paper leading-snug">{form.title}</h2>
      <p className="mt-2 text-sm text-paper/40">{formatDate(new Date().toISOString())}</p>
      {form.summary && (
        <p className="mt-5 text-paper/80 leading-relaxed whitespace-pre-wrap">{form.summary}</p>
      )}

      {galleryPreviews.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {galleryPreviews.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="h-28 w-full object-cover rounded-lg border border-white/10"
            />
          ))}
        </div>
      )}

      {form.redirect_type === 'link' && form.redirect_url && (
        <span className="mt-6 inline-flex items-center gap-2 text-gold font-semibold">
          View Source <ExternalLink size={16} />
        </span>
      )}

      {form.redirect_type === 'article' && (
        <div className="mt-8 border-t border-white/10 pt-8">
          {form.article_title && (
            <h3 className="text-xl font-bold text-paper leading-snug">{form.article_title}</h3>
          )}
          {(form.article_author_name || form.article_author_title) && (
            <p className="mt-3 text-sm text-paper/50">
              by <span className="text-paper/80 font-medium">{form.article_author_name}</span>
              {form.article_author_title && ` · ${form.article_author_title}`}
              {form.article_author_email && (
                <span className="block text-xs text-paper/40 mt-1">
                  {form.article_author_email}
                </span>
              )}
            </p>
          )}
          {articleImagePreview && (
            <img
              src={articleImagePreview}
              alt=""
              className="mt-6 w-full h-auto rounded-xl border border-white/10"
            />
          )}
          {form.article_content && (
            <p className="mt-6 text-paper/80 leading-relaxed whitespace-pre-wrap">
              {form.article_content}
            </p>
          )}
        </div>
      )}
    </article>
  )
}
