-- TrustBank v2 — Supabase Schema
-- Run this in Supabase SQL Editor

-- Mini sites
CREATE TABLE IF NOT EXISTS mini_sites (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  site_name text,
  bio text,
  avatar_url text,
  banner_url text,
  theme text DEFAULT 'dark',
  accent_color text DEFAULT '#818cf8',
  photo_shape text DEFAULT 'round',
  show_cv boolean DEFAULT false,
  cv_locked boolean DEFAULT false,
  cv_price numeric DEFAULT 20,
  cv_headline text,
  cv_content text,
  cv_location text,
  show_feed boolean DEFAULT true,
  wallet_address text,
  contact_email text,
  published boolean DEFAULT false,
  platform text DEFAULT 'trustbank',
  site_pages jsonb DEFAULT '[]',
  page_contents jsonb DEFAULT '{}',
  page_width integer DEFAULT 680,
  badge text,
  boost_rank integer DEFAULT 0,
  boost_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Links
CREATE TABLE IF NOT EXISTS mini_site_links (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id uuid REFERENCES mini_sites(id) ON DELETE CASCADE,
  title text NOT NULL,
  url text NOT NULL,
  icon text DEFAULT 'link',
  color text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Videos
CREATE TABLE IF NOT EXISTS mini_site_videos (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id uuid REFERENCES mini_sites(id) ON DELETE CASCADE,
  youtube_video_id text NOT NULL,
  title text,
  paywall_enabled boolean DEFAULT false,
  paywall_price numeric DEFAULT 4.99,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Feed posts
CREATE TABLE IF NOT EXISTS feed_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id uuid REFERENCES mini_sites(id) ON DELETE CASCADE,
  text text NOT NULL,
  image_url text,
  pinned boolean DEFAULT false,
  likes integer DEFAULT 0,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Slug registrations
CREATE TABLE IF NOT EXISTS slug_registrations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  status text DEFAULT 'active',
  for_sale boolean DEFAULT false,
  sale_price numeric,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Premium slugs
CREATE TABLE IF NOT EXISTS premium_slugs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  price numeric NOT NULL,
  category text DEFAULT 'general',
  active boolean DEFAULT true,
  sold_to uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Slug auctions
CREATE TABLE IF NOT EXISTS slug_auctions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  slug text NOT NULL,
  min_bid numeric NOT NULL,
  current_bid numeric,
  min_increment numeric DEFAULT 10,
  status text DEFAULT 'active',
  ends_at timestamptz NOT NULL,
  winner_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Boosts
CREATE TABLE IF NOT EXISTS site_boosts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id uuid REFERENCES mini_sites(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id),
  slug text,
  amount integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- User roles (for admin)
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Profiles (for credits)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  credits integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS Policies
ALTER TABLE mini_sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published" ON mini_sites FOR SELECT USING (published = true OR auth.uid() = user_id);
CREATE POLICY "Users manage own" ON mini_sites FOR ALL USING (auth.uid() = user_id);

ALTER TABLE mini_site_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read links" ON mini_site_links FOR SELECT USING (true);
CREATE POLICY "Owner manage links" ON mini_site_links FOR ALL USING (EXISTS (SELECT 1 FROM mini_sites WHERE id = site_id AND user_id = auth.uid()));

ALTER TABLE mini_site_videos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read videos" ON mini_site_videos FOR SELECT USING (true);
CREATE POLICY "Owner manage videos" ON mini_site_videos FOR ALL USING (EXISTS (SELECT 1 FROM mini_sites WHERE id = site_id AND user_id = auth.uid()));

ALTER TABLE feed_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read posts" ON feed_posts FOR SELECT USING (true);
CREATE POLICY "Owner manage posts" ON feed_posts FOR ALL USING (EXISTS (SELECT 1 FROM mini_sites WHERE id = site_id AND user_id = auth.uid()));

ALTER TABLE slug_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read for_sale" ON slug_registrations FOR SELECT USING (for_sale = true OR auth.uid() = user_id);
CREATE POLICY "Owner manage slugs" ON slug_registrations FOR ALL USING (auth.uid() = user_id);

ALTER TABLE premium_slugs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read premium" ON premium_slugs FOR SELECT USING (true);

ALTER TABLE slug_auctions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read auctions" ON slug_auctions FOR SELECT USING (true);

ALTER TABLE site_boosts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read boosts" ON site_boosts FOR SELECT USING (true);
CREATE POLICY "Auth insert boosts" ON site_boosts FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read roles" ON user_roles FOR SELECT USING (true);

-- Add admin role for yourself
-- INSERT INTO user_roles (user_id, role) VALUES ('YOUR_USER_ID', 'admin');

-- Storage bucket
-- Go to Storage > Create bucket "platform-assets" (public)
