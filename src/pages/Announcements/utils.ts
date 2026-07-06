import { supabase } from '@/lib/supabase'
import type { NewsPost } from '@/types/db'

/**
 * Resolve a thumbnail for each post: its own cover (`image_url`) if present,
 * otherwise its first gallery image by `sort_order`. Returns a map of
 * post id → thumbnail URL (posts with no image at all are omitted).
 * Uses one batched query for every post missing a cover — no N+1.
 */
export async function resolveThumbnails(
  posts: Pick<NewsPost, 'id' | 'image_url'>[],
): Promise<Record<string, string>> {
  const map: Record<string, string> = {}
  const missing: string[] = []
  for (const p of posts) {
    if (p.image_url) map[p.id] = p.image_url
    else missing.push(p.id)
  }
  if (missing.length > 0) {
    const { data } = await supabase
      .from('news_images')
      .select('news_id, image_url, sort_order')
      .in('news_id', missing)
      .order('sort_order', { ascending: true })
    for (const row of (data ?? []) as { news_id: string; image_url: string }[]) {
      if (!map[row.news_id]) map[row.news_id] = row.image_url // first by sort_order
    }
  }
  return map
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Build a PostgREST OR filter matching `term` against title/summary.
 * The value is wrapped in double quotes so PostgREST treats reserved
 * characters (`, ( )`) as literal text instead of filter syntax, and any
 * quotes/backslashes in the term are escaped. Prevents a search like "a,b"
 * from producing a malformed filter that errors the whole query.
 */
export function titleSummaryFilter(term: string): string {
  const escaped = term.replace(/[\\"]/g, m => `\\${m}`)
  return `title.ilike."%${escaped}%",summary.ilike."%${escaped}%"`
}
