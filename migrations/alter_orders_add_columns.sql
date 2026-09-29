-- Add columns to orders table to match frontend inserts
alter table if exists orders
  add column if not exists metadata jsonb,
  add column if not exists product_id text,
  add column if not exists product_name text,
  add column if not exists seller_name text,
  add column if not exists customer_name text,
  add column if not exists customer_phone text,
  add column if not exists size text,
  add column if not exists payment_method text,
  add column if not exists client_name text,
  add column if not exists client_phone text,
  add column if not exists client_address text,
  add column if not exists lat double precision,
  add column if not exists lon double precision;

-- Optional: create index on created_at if you will query by date
create index if not exists orders_created_at_idx on orders (created_at);
create index if not exists orders_product_id_idx on orders (product_id);

alter table public.orders enable row level security;

drop policy if exists "Allow anonymous read on orders" on public.orders;
drop policy if exists "Allow anonymous insert on orders" on public.orders;

create policy "Allow anonymous insert on orders"
  on public.orders
  for insert
  to anon
  with check (
    jsonb_typeof(items) = 'array'
    and jsonb_array_length(items) > 0
    and total >= 0
  );

grant insert on table public.orders to anon;
