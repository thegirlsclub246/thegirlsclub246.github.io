-- Shop Bajan "Design it for me" requests. Run once in Supabase: SQL Editor > New query > paste > Run.
-- Sellers ask Shop Bajan to design a product page, description or digital template.
-- Each seller sees only their own requests. Admins (the admins table) see and update all of them.
create table if not exists public.design_requests (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null default auth.uid(),
  kind text not null check (kind in ('page','description','template','other')),
  product_name text check (char_length(product_name) <= 120),
  notes text not null check (char_length(notes) between 3 and 2000),
  link text check (char_length(link) <= 500),
  photos text[] not null default '{}',
  status text not null default 'new' check (status in ('new','doing','done')),
  created_at timestamptz not null default now()
);
create index if not exists design_requests_vendor_idx on public.design_requests (vendor_id, created_at desc);
alter table public.design_requests enable row level security;

drop policy if exists "sellers send their own requests" on public.design_requests;
create policy "sellers send their own requests" on public.design_requests
  for insert to authenticated with check (vendor_id = auth.uid() and status = 'new');

drop policy if exists "sellers see their own requests" on public.design_requests;
create policy "sellers see their own requests" on public.design_requests
  for select to authenticated using (vendor_id = auth.uid());

drop policy if exists "admins manage requests" on public.design_requests;
create policy "admins manage requests" on public.design_requests
  for all to authenticated
  using (exists (select 1 from public.admins a where a.uid = auth.uid()))
  with check (exists (select 1 from public.admins a where a.uid = auth.uid()));
