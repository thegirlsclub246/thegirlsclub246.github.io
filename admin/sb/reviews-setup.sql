-- Shop Bajan product reviews. Run once in Supabase: SQL Editor > New query > paste > Run.
-- Shoppers can send a review (it starts as "pending"). Only "live" reviews are public.
-- Admins (the admins table) approve, hide or delete reviews in the vendor portal under "To approve".
create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  product_name text,
  vendor_slug text,
  name text not null check (char_length(name) between 1 and 40),
  rating int not null check (rating between 1 and 5),
  body text not null check (char_length(body) between 3 and 1000),
  order_ref text check (char_length(order_ref) <= 20),
  status text not null default 'pending' check (status in ('pending','live','hidden')),
  created_at timestamptz not null default now()
);
create index if not exists product_reviews_product_idx on public.product_reviews (product_id, status);
alter table public.product_reviews enable row level security;

drop policy if exists "anyone can send a review" on public.product_reviews;
create policy "anyone can send a review" on public.product_reviews
  for insert to anon, authenticated with check (status = 'pending');

drop policy if exists "live reviews are public" on public.product_reviews;
create policy "live reviews are public" on public.product_reviews
  for select to anon, authenticated using (status = 'live');

drop policy if exists "admins manage reviews" on public.product_reviews;
create policy "admins manage reviews" on public.product_reviews
  for all to authenticated
  using (exists (select 1 from public.admins a where a.uid = auth.uid()))
  with check (exists (select 1 from public.admins a where a.uid = auth.uid()));

-- Public readers only ever see these columns (order numbers stay private).
revoke select on public.product_reviews from anon;
grant select (product_id, name, rating, body, created_at) on public.product_reviews to anon;
grant insert (product_id, product_name, vendor_slug, name, rating, body, order_ref) on public.product_reviews to anon;
