-- Allow manually managed staff members alongside FACR-synced staff.
-- Manual staff intentionally have facr_person_id = null.

alter table public.staff
  alter column facr_person_id drop not null;

alter table public.staff enable row level security;

drop policy if exists "staff public read" on public.staff;
create policy "staff public read"
on public.staff
for select
using (true);

drop policy if exists "staff editor insert" on public.staff;
create policy "staff editor insert"
on public.staff
for insert
to authenticated
with check (public.can_edit_content());

drop policy if exists "staff editor update" on public.staff;
create policy "staff editor update"
on public.staff
for update
to authenticated
using (public.can_edit_content())
with check (public.can_edit_content());

drop policy if exists "staff editor delete" on public.staff;
create policy "staff editor delete"
on public.staff
for delete
to authenticated
using (public.can_edit_content());

grant select on public.staff to anon, authenticated;
grant insert, update, delete on public.staff to authenticated;
