-- SQL migration to create `orders` table for Supabase/Postgres
create extension if not exists pgcrypto;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  items jsonb not null,
  total numeric(10,2) not null default 0,
  status text not null default 'pending',
  shipping_address jsonb,
  metadata jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz
);

alter table if exists orders enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'Allow anonymous insert on orders'
  ) then
    create policy "Allow anonymous insert on orders"
      on public.orders
      for insert
      to anon
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'orders' and policyname = 'Allow anonymous read on orders'
  ) then
    create policy "Allow anonymous read on orders"
      on public.orders
      for select
      to anon
      using (true);
  end if;
end $$;

create index if not exists orders_user_id_idx on orders (user_id);
create index if not exists orders_status_idx on orders (status);
