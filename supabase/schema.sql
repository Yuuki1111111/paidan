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

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  nickname text not null default '',
  contact text not null default '',
  category text not null default '其他',
  content text not null,
  page_context text not null default 'landing',
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

drop policy if exists "Anyone can insert feedback" on public.feedback;
create policy "Anyone can insert feedback"
on public.feedback
for insert
with check (
  char_length(content) between 5 and 500
  and char_length(nickname) <= 40
  and char_length(contact) <= 80
  and category in ('Bug', '功能建议', '体验问题', '其他')
);
