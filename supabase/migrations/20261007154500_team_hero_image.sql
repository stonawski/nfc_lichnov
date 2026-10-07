-- Team presentation image used by public team hero sections.
-- Safe to apply before or after the frontend deploy: the frontend falls back when the column is absent.

alter table public.teams
  add column if not exists hero_image_url text;

create or replace function public.set_team_hero_image(
  p_team_id uuid,
  p_hero_image_url text
)
returns text
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_value text;
begin
  if public.can_edit_content() is distinct from true then
    raise exception 'Not allowed';
  end if;

  update public.teams
  set hero_image_url = nullif(trim(p_hero_image_url), '')
  where id = p_team_id
  returning hero_image_url into v_value;

  if not found then
    raise exception 'Team not found';
  end if;

  return v_value;
end;
$$;

revoke all on function public.set_team_hero_image(uuid, text) from public;
grant execute on function public.set_team_hero_image(uuid, text) to authenticated;
