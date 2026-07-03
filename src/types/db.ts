export type Role = 'member' | 'volunteer' | 'event_head' | 'officer' | 'admin'

export interface Profile {
  id: string
  email: string
  display_name: string | null
  created_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role: Role
  event_id: string | null
  created_at: string
}

export type RedirectType = 'none' | 'link' | 'article'
export type NewsStatus = 'draft' | 'published'

export interface NewsPost {
  id: string
  title: string
  summary: string | null
  image_url: string | null
  status: NewsStatus
  redirect_type: RedirectType
  redirect_url: string | null
  article_title: string | null
  article_content: string | null
  article_author_name: string | null
  article_author_email: string | null
  article_author_title: string | null
  article_image_url: string | null
  posted_by: string
  created_at: string
}
