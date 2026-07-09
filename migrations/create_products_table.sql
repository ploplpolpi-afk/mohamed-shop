create table if not exists public.products (
  id text primary key,
  name text not null,
  type text,
  material text,
  price numeric(10,2) not null default 0,
  stock integer not null default 0,
  commission_percent integer default 10,
  seller_name text,
  category text,
  images jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table if exists public.products enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'products' and policyname = 'Allow anonymous read on products'
  ) then
    create policy "Allow anonymous read on products"
      on public.products
      for select
      to anon
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'products' and policyname = 'Allow anonymous upsert on products'
  ) then
    create policy "Allow anonymous upsert on products"
      on public.products
      for insert
      to anon
      with check (true);
  end if;
end $$;
