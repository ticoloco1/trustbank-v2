-- TrustBank v2 Setup Completo - Cole no SQL Editor do Supabase

create table if not exists mini_sites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  slug text unique not null,
  site_name text, bio text, avatar_url text, banner_url text,
  theme text default 'dark', accent_color text default '#818cf8',
  photo_shape text default 'round', photo_size text default 'md',
  font_style text default 'sans', text_color text,
  show_cv boolean default false, cv_locked boolean default false,
  cv_price numeric default 20, cv_headline text, cv_content text, cv_location text,
  show_feed boolean default true, wallet_address text, contact_email text,
  published boolean default false, platform text default 'trustbank',
  site_pages text default '[]', page_contents text default '{}',
  page_width integer default 680, badge text,
  boost_rank integer default 0, boost_expires_at timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

create table if not exists mini_site_links (
  id uuid default gen_random_uuid() primary key,
  site_id uuid references mini_sites(id) on delete cascade,
  title text not null, url text not null, icon text default 'link',
  color text, sort_order integer default 0, created_at timestamptz default now()
);

create table if not exists mini_site_videos (
  id uuid default gen_random_uuid() primary key,
  site_id uuid references mini_sites(id) on delete cascade,
  youtube_video_id text not null, title text,
  paywall_enabled boolean default false, paywall_price numeric default 4.99,
  sort_order integer default 0, created_at timestamptz default now()
);

create table if not exists feed_posts (
  id uuid default gen_random_uuid() primary key,
  site_id uuid references mini_sites(id) on delete cascade,
  text text not null, image_url text, pinned boolean default false,
  likes integer default 0, expires_at timestamptz not null,
  created_at timestamptz default now()
);

create table if not exists slug_registrations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  slug text unique not null, status text default 'active',
  for_sale boolean default false, sale_price numeric,
  expires_at timestamptz, created_at timestamptz default now()
);

create table if not exists premium_slugs (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null, price numeric not null,
  category text default 'general', active boolean default true,
  sold_to uuid references auth.users(id), created_at timestamptz default now()
);

create table if not exists slug_auctions (
  id uuid default gen_random_uuid() primary key,
  slug text not null, min_bid numeric not null, current_bid numeric,
  min_increment numeric default 10, status text default 'active',
  ends_at timestamptz not null, winner_id uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists site_boosts (
  id uuid default gen_random_uuid() primary key,
  site_id uuid references mini_sites(id) on delete cascade,
  user_id uuid references auth.users(id), slug text,
  amount integer default 1, created_at timestamptz default now()
);

create table if not exists user_roles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null, created_at timestamptz default now(),
  unique(user_id, role)
);

create table if not exists profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  credits integer default 0, created_at timestamptz default now()
);

alter table mini_sites enable row level security;
drop policy if exists "ms_read" on mini_sites;
drop policy if exists "ms_write" on mini_sites;
create policy "ms_read" on mini_sites for select using (published = true or auth.uid() = user_id);
create policy "ms_write" on mini_sites for all using (auth.uid() = user_id);

alter table mini_site_links enable row level security;
drop policy if exists "lk_read" on mini_site_links;
drop policy if exists "lk_write" on mini_site_links;
create policy "lk_read" on mini_site_links for select using (true);
create policy "lk_write" on mini_site_links for all using (exists (select 1 from mini_sites where id = site_id and user_id = auth.uid()));

alter table mini_site_videos enable row level security;
drop policy if exists "vd_read" on mini_site_videos;
drop policy if exists "vd_write" on mini_site_videos;
create policy "vd_read" on mini_site_videos for select using (true);
create policy "vd_write" on mini_site_videos for all using (exists (select 1 from mini_sites where id = site_id and user_id = auth.uid()));

alter table feed_posts enable row level security;
drop policy if exists "fp_read" on feed_posts;
drop policy if exists "fp_write" on feed_posts;
create policy "fp_read" on feed_posts for select using (true);
create policy "fp_write" on feed_posts for all using (exists (select 1 from mini_sites where id = site_id and user_id = auth.uid()));

alter table slug_registrations enable row level security;
drop policy if exists "sr_read" on slug_registrations;
drop policy if exists "sr_write" on slug_registrations;
drop policy if exists "sr_insert" on slug_registrations;
create policy "sr_read" on slug_registrations for select using (for_sale = true or auth.uid() = user_id);
create policy "sr_write" on slug_registrations for all using (auth.uid() = user_id);
create policy "sr_insert" on slug_registrations for insert with check (true);

alter table premium_slugs enable row level security;
drop policy if exists "ps_read" on premium_slugs;
drop policy if exists "ps_all" on premium_slugs;
create policy "ps_read" on premium_slugs for select using (true);
create policy "ps_all" on premium_slugs for all using (true);

alter table slug_auctions enable row level security;
drop policy if exists "sa_read" on slug_auctions;
drop policy if exists "sa_all" on slug_auctions;
create policy "sa_read" on slug_auctions for select using (true);
create policy "sa_all" on slug_auctions for all using (true);

alter table site_boosts enable row level security;
drop policy if exists "sb_read" on site_boosts;
drop policy if exists "sb_insert" on site_boosts;
create policy "sb_read" on site_boosts for select using (true);
create policy "sb_insert" on site_boosts for insert with check (auth.uid() = user_id);

alter table user_roles enable row level security;
drop policy if exists "ur_read" on user_roles;
drop policy if exists "ur_all" on user_roles;
create policy "ur_read" on user_roles for select using (true);
create policy "ur_all" on user_roles for all using (true);

alter table profiles enable row level security;
drop policy if exists "pr_all" on profiles;
create policy "pr_all" on profiles for all using (auth.uid() = user_id);

select 'PRONTO! Agora: Storage > New bucket > platform-assets > toggle Public ON' as proximo_passo;

-- PARA SER ADMIN:
-- 1. Va em Authentication > Users e copie seu user_id
-- 2. Rode: insert into user_roles (user_id, role) values ('SEU-USER-ID', 'admin');
