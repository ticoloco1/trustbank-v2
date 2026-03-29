
-- Add plans table (run in Supabase SQL Editor)
create table if not exists platform_plans (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text unique not null,
  price_monthly numeric default 0,
  price_yearly numeric default 0,
  currency text default 'USD',
  active boolean default true,
  is_free boolean default false,
  color text default '#818cf8',
  emoji text default '✨',
  features jsonb default '[]',
  limits jsonb default '{}',
  sort_order integer default 0,
  created_at timestamptz default now()
);

alter table platform_plans enable row level security;
drop policy if exists "plans_read" on platform_plans;
drop policy if exists "plans_all" on platform_plans;
create policy "plans_read" on platform_plans for select using (true);
create policy "plans_all" on platform_plans for all using (true);

-- Default plans
insert into platform_plans (name, slug, price_monthly, price_yearly, is_free, color, emoji, features, limits, sort_order)
values
  ('Pro', 'pro', 19.90, 190.00, false, '#818cf8', '⚡',
   '["Unlimited links","3 site pages","Video paywall","CV paywall","Premium themes","1 free premium slug","Analytics"]',
   '{"max_pages":3,"max_links":50,"max_videos":20}', 1),
  ('Elite', 'elite', 49.90, 490.00, false, '#f59e0b', '👑',
   '["Everything in Pro","10 pages","Custom domain","Priority support","3 free premium slugs","White label"]',
   '{"max_pages":10,"max_links":999,"max_videos":999}', 2)
on conflict (slug) do nothing;

-- Broadcast messages table
create table if not exists broadcast_messages (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  target text default 'all',
  sent_at timestamptz,
  created_at timestamptz default now()
);

alter table broadcast_messages enable row level security;
create policy "bc_all" on broadcast_messages for all using (true);

-- Inbox messages (user to user or platform)
create table if not exists site_messages (
  id uuid default gen_random_uuid() primary key,
  site_id uuid references mini_sites(id) on delete cascade,
  sender_name text,
  sender_email text,
  message text not null,
  read boolean default false,
  created_at timestamptz default now()
);

alter table site_messages enable row level security;
create policy "sm_read" on site_messages for select using (
  exists (select 1 from mini_sites where id = site_id and user_id = auth.uid())
);
create policy "sm_insert" on site_messages for insert with check (true);

-- Analytics visits
create table if not exists site_visits (
  id uuid default gen_random_uuid() primary key,
  site_id uuid references mini_sites(id) on delete cascade,
  slug text,
  referrer text,
  country text,
  device text,
  created_at timestamptz default now()
);

alter table site_visits enable row level security;
create policy "sv_read" on site_visits for select using (
  exists (select 1 from mini_sites where id = site_id and user_id = auth.uid())
);
create policy "sv_insert" on site_visits for insert with check (true);

select 'Plans, broadcast, messages, analytics tables created!' as status;
