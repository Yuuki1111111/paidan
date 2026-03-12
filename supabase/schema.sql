create extension if not exists pgcrypto;

create table if not exists public.commission_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_name text not null,
  client_name text not null,
  business_type text not null,
  production_stage text not null default '',
  source text not null,
  priority text not null,
  amount integer not null default 0,
  received_amount integer not null default 0,
  payment_status text not null default '未收款',
  due_date date not null,
  completed_date date,
  status text not null default '待沟通',
  exception_type text not null default '无',
  exception_resolution text not null default '',
  exception_note text not null default '',
  refund_amount integer not null default 0,
  exception_previous_status text,
  notes text not null default '',
  fee_mode text not null default 'standard',
  fee_rate numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.commission_orders
add column if not exists exception_type text not null default '无';

alter table public.commission_orders
add column if not exists production_stage text not null default '';

alter table public.commission_orders
add column if not exists exception_resolution text not null default '';

alter table public.commission_orders
add column if not exists exception_note text not null default '';

alter table public.commission_orders
add column if not exists refund_amount integer not null default 0;

alter table public.commission_orders
add column if not exists exception_previous_status text;

alter table public.commission_orders
add column if not exists fee_rate numeric;

alter table public.commission_orders
add column if not exists fee_mode text not null default 'standard';

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

create table if not exists public.business_presets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_presets
add column if not exists updated_at timestamptz not null default now();

create unique index if not exists business_presets_user_id_name_key
on public.business_presets (user_id, name);

drop trigger if exists business_presets_set_updated_at on public.business_presets;

create trigger business_presets_set_updated_at
before update on public.business_presets
for each row
execute function public.set_updated_at();

alter table public.business_presets enable row level security;

drop policy if exists "Users can view their own business presets" on public.business_presets;
create policy "Users can view their own business presets"
on public.business_presets
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own business presets" on public.business_presets;
create policy "Users can insert their own business presets"
on public.business_presets
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own business presets" on public.business_presets;
create policy "Users can update their own business presets"
on public.business_presets
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own business presets" on public.business_presets;
create policy "Users can delete their own business presets"
on public.business_presets
for delete
using (auth.uid() = user_id);

create table if not exists public.business_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  project_name text not null default '',
  business_type text not null,
  production_stage text not null default '',
  source text not null default '',
  fee_mode text not null default 'standard',
  fee_rate numeric,
  usage_type text not null default '',
  usage_rate numeric not null default 0,
  currency text not null default 'CNY',
  fx_rate_snapshot jsonb not null default '{}'::jsonb,
  priority text not null default '',
  amount integer not null default 0,
  received_amount integer not null default 0,
  payment_status text not null default '未收款',
  work_hours numeric not null default 0,
  status text not null default '待沟通',
  exception_type text not null default '无',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_templates
add column if not exists production_stage text not null default '';

alter table public.business_templates
add column if not exists fee_mode text not null default 'standard';

alter table public.business_templates
add column if not exists fee_rate numeric;

alter table public.business_templates
add column if not exists usage_type text not null default '';

alter table public.business_templates
add column if not exists usage_rate numeric not null default 0;

alter table public.business_templates
add column if not exists currency text not null default 'CNY';

alter table public.business_templates
add column if not exists fx_rate_snapshot jsonb not null default '{}'::jsonb;

alter table public.business_templates
add column if not exists priority text not null default '';

alter table public.business_templates
add column if not exists amount integer not null default 0;

alter table public.business_templates
add column if not exists received_amount integer not null default 0;

alter table public.business_templates
add column if not exists payment_status text not null default '未收款';

alter table public.business_templates
add column if not exists work_hours numeric not null default 0;

alter table public.business_templates
add column if not exists status text not null default '待沟通';

alter table public.business_templates
add column if not exists exception_type text not null default '无';

alter table public.business_templates
add column if not exists notes text not null default '';

alter table public.business_templates
add column if not exists updated_at timestamptz not null default now();

create unique index if not exists business_templates_user_id_business_type_key
on public.business_templates (user_id, business_type);

drop trigger if exists business_templates_set_updated_at on public.business_templates;

create trigger business_templates_set_updated_at
before update on public.business_templates
for each row
execute function public.set_updated_at();

alter table public.business_templates enable row level security;

drop policy if exists "Users can view their own business templates" on public.business_templates;
create policy "Users can view their own business templates"
on public.business_templates
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own business templates" on public.business_templates;
create policy "Users can insert their own business templates"
on public.business_templates
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own business templates" on public.business_templates;
create policy "Users can update their own business templates"
on public.business_templates
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own business templates" on public.business_templates;
create policy "Users can delete their own business templates"
on public.business_templates
for delete
using (auth.uid() = user_id);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  vip_threshold integer not null default 3000,
  vip_threshold_updated_at timestamptz,
  calendar_day_marks jsonb not null default '{}'::jsonb,
  calendar_day_marks_updated_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences
add column if not exists vip_threshold integer not null default 3000;

alter table public.user_preferences
add column if not exists vip_threshold_updated_at timestamptz;

alter table public.user_preferences
add column if not exists calendar_day_marks jsonb not null default '{}'::jsonb;

alter table public.user_preferences
add column if not exists calendar_day_marks_updated_at timestamptz;

alter table public.user_preferences
add column if not exists updated_at timestamptz not null default now();

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;

create trigger user_preferences_set_updated_at
before update on public.user_preferences
for each row
execute function public.set_updated_at();

alter table public.user_preferences enable row level security;

drop policy if exists "Users can view their own preferences" on public.user_preferences;
create policy "Users can view their own preferences"
on public.user_preferences
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own preferences" on public.user_preferences;
create policy "Users can insert their own preferences"
on public.user_preferences
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own preferences" on public.user_preferences;
create policy "Users can update their own preferences"
on public.user_preferences
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own preferences" on public.user_preferences;
create policy "Users can delete their own preferences"
on public.user_preferences
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
