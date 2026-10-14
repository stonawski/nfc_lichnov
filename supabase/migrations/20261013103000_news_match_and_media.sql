-- Associate a news article with an optional past or upcoming match.
alter table public.news
  add column if not exists match_id uuid references public.matches(id) on delete set null;

create index if not exists news_match_id_idx on public.news (match_id);

-- Additional article media appear after the story body, independently from cover_image.
create table if not exists public.news_media (
  id uuid primary key default gen_random_uuid(),
  news_id uuid not null references public.news(id) on delete cascade,
  media_type text not null check (media_type in ('image', 'video')),
  media_url text not null check (media_url ~ '^https://'),
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists news_media_article_order_idx
  on public.news_media (news_id, sort_order, created_at);

alter table public.news_media enable row level security;

drop policy if exists "news media public or editor read" on public.news_media;
create policy "news media public or editor read"
on public.news_media for select to anon, authenticated
using (
  exists (
    select 1 from public.news article
    where article.id = news_id and article.published = true
  )
  or (auth.role() = 'authenticated' and public.can_edit_content())
);

drop policy if exists "news media editor insert" on public.news_media;
create policy "news media editor insert"
on public.news_media for insert to authenticated
with check (public.can_edit_content());

drop policy if exists "news media editor update" on public.news_media;
create policy "news media editor update"
on public.news_media for update to authenticated
using (public.can_edit_content())
with check (public.can_edit_content());

drop policy if exists "news media editor delete" on public.news_media;
create policy "news media editor delete"
on public.news_media for delete to authenticated
using (public.can_edit_content());

grant select on public.news_media to anon, authenticated;
grant insert, update, delete on public.news_media to authenticated;
