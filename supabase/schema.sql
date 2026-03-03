create extension if not exists pgcrypto;

create table if not exists public.commission_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_name text not null,
  client_name text not null,
  business_type text not null,
  source text not null,
  priority text not null,
  amount integer not null default 0,
  received_amount integer not null default 0,
  payment_status text not null default '未收款',
  due_date date not null,
  completed_date date,
  status text not null default '待沟通',
  exception_type text not null default '无',
  notes text not null default '',
  fee_rate numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.commission_orders
add column if not exists exception_type text not null default '无';

alter table public.commission_orders
add column if not exists fee_rate numeric;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists commission_orders_set_updated_at on public.commission_orders;

create trigger commission_orders_set_updated_at
before update on public.commission_orders
for each row
execute function public.set_updated_at();

alter table public.commission_orders enable row level security;

drop policy if exists "Users can view their own orders" on public.commission_orders;
create policy "Users can view their own orders"
on public.commission_orders
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own orders" on public.commission_orders;
create policy "Users can insert their own orders"
on public.commission_orders
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own orders" on public.commission_orders;
create policy "Users can update their own orders"
on public.commission_orders
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own orders" on public.commission_orders;
create policy "Users can delete their own orders"
on public.commission_orders
for delete
using (auth.uid() = user_id);
