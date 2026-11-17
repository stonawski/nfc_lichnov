-- Lightweight, RLS-aware album previews for the public gallery index.
-- Read-only; no production rows are modified and existing RLS stays in force.
-- Deploy through Supabase SQL Editor before enabling the fast summary path.
-- No index DDL is included here: inspect row counts and EXPLAIN in staging
-- before adding an index on an actively written production table.

create or replace function public.public_gallery_summaries()
returns table (
  gallery_id uuid,
  photo_count bigint,
  preview_urls text[]
)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    g.id as gallery_id,
    (
      select count(*)
      from public.gallery_images gi
      where gi.gallery_id = g.id
    ) as photo_count,
    array(
      select gi.image_url
      from public.gallery_images gi
      where gi.gallery_id = g.id
      order by gi.sort_order asc, gi.created_at asc, gi.id asc
      limit 4
    ) as preview_urls
  from public.galleries g
  where g.published = true;
$$;

-- Functions are executable by PUBLIC by default: explicitly limit grants.
revoke all on function public.public_gallery_summaries() from public;
grant execute on function public.public_gallery_summaries() to anon, authenticated;
