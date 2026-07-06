-- profiles: one row per auth user
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  display_name text,
  created_at   timestamptz default now() not null
);

-- user_roles: a user can hold multiple roles (optionally scoped to an event)
create table public.user_roles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text not null check (role in ('member', 'volunteer', 'event_head', 'officer', 'admin')),
  event_id   uuid,  -- null = global role; non-null = scoped to that event
  created_at timestamptz default now() not null
);

-- Row Level Security

alter table public.profiles   enable row level security;
alter table public.user_roles enable row level security;

-- profiles: users can read and update their own row
create policy "users_select_own_profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "users_update_own_profile"
  on public.profiles for update
  using (auth.uid() = id);

-- user_roles: users can read their own rows
-- writes happen through the Supabase dashboard (service role) until Phase 2
create policy "users_select_own_roles"
  on public.user_roles for select
  using (user_id = auth.uid());

-- Trigger: auto-create profile + default member role on signup

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  );

  insert into public.user_roles (user_id, role)
  values (new.id, 'member');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- news: announcements posted by officers/admins
-- redirect_type controls the detail view: 'none' = summary only,
-- 'link' = external URL, 'article' = embedded article fields below
create table public.news (
  id                   uuid primary key default gen_random_uuid(),
  title                text not null,
  summary              text,
  image_url            text,
  status               text not null default 'published'
                         check (status in ('draft', 'published')),
  redirect_type        text not null default 'none'
                         check (redirect_type in ('none', 'link', 'article')),
  redirect_url         text,
  article_title        text,
  article_content      text,
  article_author_name  text,
  article_author_email text,
  article_author_title text,
  article_image_url    text,
  posted_by            uuid not null references public.profiles(id) on delete cascade,
  created_at           timestamptz default now() not null
);

alter table public.news enable row level security;

create policy "members_read_published"
  on public.news for select
  using (auth.uid() is not null and status = 'published');

create policy "officers_read_all"
  on public.news for select
  using (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('officer', 'admin')
  ));

create policy "officers_insert"
  on public.news for insert
  with check (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('officer', 'admin')
  ));

create policy "officers_update"
  on public.news for update
  using (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('officer', 'admin')
  ));

create policy "officers_delete"
  on public.news for delete
  using (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('officer', 'admin')
  ));

-- Storage: requires a public bucket named 'announcement-images'
-- (dashboard → Storage → New bucket). Public URLs bypass RLS for display, but
-- the storage API still needs policies for insert/delete — and a SELECT policy
-- so remove() can locate objects (without it, deletes silently no-op).

create policy "read_announcement_images"
  on storage.objects for select to authenticated
  using (bucket_id = 'announcement-images');

create policy "officers_upload_announcement_images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'announcement-images'
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role in ('officer', 'admin')
    )
  );

create policy "officers_delete_announcement_images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'announcement-images'
    and exists (
      select 1 from public.user_roles
      where user_id = auth.uid() and role in ('officer', 'admin')
    )
  );

-- news_images: extra gallery images for an announcement (0..n per post).
-- The single cover lives on news.image_url; these are additional photos.
create table if not exists public.news_images (
  id         uuid primary key default gen_random_uuid(),
  news_id    uuid not null references public.news(id) on delete cascade,
  image_url  text not null,
  sort_order int not null default 0,
  created_at timestamptz default now() not null
);

create index if not exists news_images_news_id_idx on public.news_images (news_id);

alter table public.news_images enable row level security;

-- Members can read gallery images of published posts; officers/admins read all
create policy "read_news_images"
  on public.news_images for select
  using (
    exists (
      select 1 from public.news n
      where n.id = news_id
        and (
          n.status = 'published'
          or exists (
            select 1 from public.user_roles
            where user_id = auth.uid() and role in ('officer', 'admin')
          )
        )
    )
  );

create policy "officers_insert_news_images"
  on public.news_images for insert to authenticated
  with check (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('officer', 'admin')
  ));

create policy "officers_update_news_images"
  on public.news_images for update to authenticated
  using (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('officer', 'admin')
  ));

create policy "officers_delete_news_images"
  on public.news_images for delete to authenticated
  using (exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('officer', 'admin')
  ));
