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
