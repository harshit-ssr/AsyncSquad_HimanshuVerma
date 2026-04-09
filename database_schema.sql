-- ============================================================
-- EcoMarket — Complete Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── 1. PROFILES ────────────────────────────────────────────
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  name       text not null default '',
  role       text not null default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Public read profiles"
  on public.profiles for select
  using (true);

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);


-- ─── 2. SELLERS ─────────────────────────────────────────────
create table if not exists public.sellers (
  id          uuid primary key references public.profiles(id) on delete cascade,
  store_name  text not null default '',
  description text default '',
  logo_url    text default '',
  created_at  timestamptz not null default now()
);

alter table public.sellers enable row level security;

create policy "Public read sellers"
  on public.sellers for select
  using (true);

create policy "Sellers update own store"
  on public.sellers for update
  using (auth.uid() = id);

create policy "Sellers insert own store"
  on public.sellers for insert
  with check (auth.uid() = id);


-- ─── 3. PRODUCTS ────────────────────────────────────────────
create table if not exists public.products (
  id             uuid primary key default gen_random_uuid(),
  seller_id      uuid not null references public.sellers(id) on delete cascade,
  title          text not null,
  description    text not null default '',
  price          numeric(10,2) not null default 0,
  stock_quantity integer not null default 0,
  eco_tags       text[] not null default '{}',
  image_url      text default '',
  lat            double precision,
  lng            double precision,
  created_at     timestamptz not null default now()
);

alter table public.products enable row level security;

create policy "Public read products"
  on public.products for select
  using (true);

create policy "Sellers insert own products"
  on public.products for insert
  with check (auth.uid() = seller_id);

create policy "Sellers update own products"
  on public.products for update
  using (auth.uid() = seller_id);

create policy "Sellers delete own products"
  on public.products for delete
  using (auth.uid() = seller_id);


-- ─── 4. ORDERS ──────────────────────────────────────────────
create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  buyer_id     uuid not null references public.profiles(id) on delete cascade,
  seller_id    uuid not null references public.sellers(id) on delete cascade,
  total_amount numeric(10,2) not null default 0,
  status       text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled')),
  created_at   timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "Buyers read own orders"
  on public.orders for select
  using (auth.uid() = buyer_id);

create policy "Sellers read orders sent to them"
  on public.orders for select
  using (auth.uid() = seller_id);

create policy "Buyers create orders"
  on public.orders for insert
  with check (auth.uid() = buyer_id);

create policy "Sellers update order status"
  on public.orders for update
  using (auth.uid() = seller_id);


-- ─── 5. ORDER ITEMS ─────────────────────────────────────────
create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid not null references public.products(id) on delete cascade,
  quantity      integer not null default 1,
  price_at_time numeric(10,2) not null default 0
);

alter table public.order_items enable row level security;

create policy "Buyers read own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.buyer_id = auth.uid()
    )
  );

create policy "Sellers read order items sent to them"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.seller_id = auth.uid()
    )
  );

create policy "Buyers insert order items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.buyer_id = auth.uid()
    )
  );


-- ─── 6. DECREMENT STOCK FUNCTION ────────────────────────────
create or replace function public.decrement_stock(p_id uuid, qty integer)
returns void
language plpgsql
security definer
as $$
begin
  update public.products
  set stock_quantity = greatest(stock_quantity - qty, 0)
  where id = p_id;
end;
$$;


-- ─── 7. AUTO-CREATE PROFILE ON SIGNUP ───────────────────────
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'buyer')
  );

  -- If role is seller, also create a sellers row
  if coalesce(new.raw_user_meta_data ->> 'role', 'buyer') = 'seller' then
    insert into public.sellers (id, store_name)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)) || '''s Store'
    );
  end if;

  return new;
end;
$$;

-- Drop existing trigger if any, then create
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ─── 8. ADMIN READ POLICIES (optional) ─────────────────────
-- Admins can read all orders & order items for the admin dashboard
create policy "Admins read all orders"
  on public.orders for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );

create policy "Admins read all order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid() and profiles.role = 'admin'
    )
  );


-- ============================================================
-- Done! Your EcoMarket database is ready.
-- Next: fill .env.local with your Supabase URL and anon key.
-- ============================================================
