-- Add columns to orders table to match frontend inserts
alter table if exists orders
  add column if not exists product_name text,
  add column if not exists size text,
  add column if not exists payment_method text,
  add column if not exists client_name text,
  add column if not exists client_phone text,
  add column if not exists client_address text,
  add column if not exists lat double precision,
  add column if not exists lon double precision;

-- Optional: create index on created_at if you will query by date
create index if not exists orders_created_at_idx on orders (created_at);
