// ═══════════════════════════════════════════════════════════
// TRUSTBANK PRO — Combined Types
// trustbank glass morphism DNA + royal fintech functionality
// ═══════════════════════════════════════════════════════════

export type LayoutColumns = 1 | 2 | 3;
export type LockLevel = 'public' | 'free_account' | 'paid';
export type AccentColor =
  | '#8b5cf6' | '#06b6d4' | '#10b981' | '#f59e0b'
  | '#ef4444' | '#ec4899' | '#14b8a6' | '#f97316'
  | '#0ea5e9' | '#a855f7' | '#64748b';

// ── Theme ────────────────────────────────────────────────────
export type ThemeStyle = 'glass' | 'dark' | 'light' | 'minimal';
export type BgStyle =
  | 'dark' | 'midnight' | 'white' | 'beige' | 'sand' | 'warm'
  | 'yellow' | 'pastel-blue' | 'pastel-pink' | 'pastel-lavender'
  | 'light-gray' | 'silver' | 'brushed-steel';

export interface ProfileTheme {
  style: ThemeStyle;
  bgStyle: BgStyle;
  accent: AccentColor;
  columns: LayoutColumns;
  gradient: string;
  darkMode: boolean;
  fontSz: 'sm' | 'md' | 'lg';
  photoShape: 'round' | 'square';
  photoSize: 'sm' | 'md' | 'lg';
  coverImage?: string;
}

// ── Social ───────────────────────────────────────────────────
export interface SocialLink {
  id: string;
  label: string;
  url: string;
  icon: 'linkedin' | 'github' | 'instagram' | 'twitter' | 'youtube'
      | 'tiktok' | 'website' | 'email' | 'whatsapp' | 'custom';
}

// ── Content Links ────────────────────────────────────────────
export interface ContentLink {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  type: 'link' | 'article' | 'video' | 'download';
  locked: boolean;
  lockPrice?: number;
  sort_order?: number;
}

// ── Videos ───────────────────────────────────────────────────
export interface VideoItem {
  id: string;
  title: string;
  description?: string;
  youtubeId: string;
  thumbnail_url?: string;
  verifiedChannel: boolean;
  // Paywall (Royal style)
  paywall_enabled?: boolean;
  paywall_price?: number;
  // NFT (Royal style)
  nft_enabled?: boolean;
  nft_price?: number;
  nft_max_views?: number;
  nft_max_editions?: number;
  nft_editions_sold?: number;
  // Recharge
  recharge_enabled?: boolean;
  recharge_price?: number;
  sort_order?: number;
}

// ── Feed Posts (7 days) ──────────────────────────────────────
export interface FeedPost {
  id: string;
  imageUrl?: string;
  images?: string[];
  caption?: string;
  text?: string;
  createdAt: string;
  expiresAt: string;
  pinned?: boolean;
  likes?: number;
}

// ── CV ───────────────────────────────────────────────────────
export interface CVContact {
  email: string; phone: string;
  whatsapp: string; linkedin: string; address: string;
}

export interface CVExperience {
  id: string; company: string; role: string;
  start: string; end: string; current: boolean;
  description: string; lockLevel: LockLevel;
}

export interface CVEducation {
  id: string; institution: string; degree: string;
  field: string; start: string; end: string;
  current: boolean; lockLevel: LockLevel;
}

export interface CVCourse {
  id: string; name: string; institution: string;
  year: string; hours: string; certUrl: string; lockLevel: LockLevel;
}

export interface CVLanguage {
  id: string; language: string;
  level: 'Básico' | 'Intermediário' | 'Avançado' | 'Fluente' | 'Nativo';
  stars: number;
}

export interface CVPublication {
  id: string; title: string; publisher: string;
  year: string; url: string; lockLevel: LockLevel;
}

export interface CVData {
  name: string; headline: string; summary: string; objective: string; photo?: string;
  contact: CVContact;
  experiences: CVExperience[];
  education: CVEducation[];
  courses: CVCourse[];
  languages: CVLanguage[];
  publications: CVPublication[];
  skills: { technical: string; tools: string; soft: string };
  awards: string; volunteer: string;
  contactLock: LockLevel; contactPrice: number;
  cvGlobalLock: LockLevel; cvGlobalPrice: number;
}

// ── Profile (mini-site) ──────────────────────────────────────
export type ProfileSection =
  | 'hero' | 'cv' | 'links' | 'videos' | 'feed'
  | 'map' | 'contact' | 'nfts' | 'photos';

export interface MapLocation {
  label: string; address: string;
  lat?: number; lng?: number; mapsUrl: string;
}

export interface ProfileData {
  // Identity
  id?: string;
  username: string;
  slug: string;
  displayName: string;
  tagline: string;
  bio: string;
  avatar?: string;
  coverImage?: string;
  verified: boolean;
  badge?: 'blue' | 'gold';
  plan: 'free' | 'starter' | 'pro' | 'elite';
  subscription_status?: 'active' | 'inactive' | 'suspended';

  // Theme
  theme: ProfileTheme;

  // Layout
  sectionsOrder: ProfileSection[];

  // Content
  socialLinks: SocialLink[];
  contentLinks: ContentLink[];
  videos: VideoItem[];
  feedPosts: FeedPost[];
  photos?: string[];
  location?: MapLocation;
  cv: CVData;

  // Monetization
  cvUnlockPrice: number;
  splitPercent: number;
  paywallEnabled?: boolean;
  paywallPrice?: number;
  paywallInterval?: 'monthly' | 'weekly';

  // Directory
  boostRank?: number;
  boostExpiresAt?: string;

  // Platform
  platform: 'trustbank' | 'trustbank' | 'hashpo' | 'mybik';
}

// ── Slug Marketplace ─────────────────────────────────────────
export interface SlugListing {
  id: string;
  slug: string;
  platform: string;
  status: 'active' | 'for_sale' | 'auction' | 'sold';
  price_usdc?: number;
  min_bid?: number;
  category?: string;
  owner_id?: string;
  tier: '1_letter' | '2_letters' | '3_letters' | '4_letters' | '5_letters' | '6_letters' | '7_plus' | 'premium';
  hot?: boolean;
}

// ── Boost ────────────────────────────────────────────────────
export interface BoostInfo {
  id: string;
  profile_id: string;
  platform: string;
  type: 'per_position' | 'to_top' | 'daily_hold';
  positions_up: number;
  amount_usdc: number;
  active: boolean;
  expires_at: string;
}

// ── Ad ───────────────────────────────────────────────────────
export interface Ad {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  link_url: string;
  platforms: string[];
  placement: 'leaderboard' | 'sidebar' | 'ticker' | 'minisite';
  status: 'pending' | 'active' | 'paused' | 'expired';
  plan: 'daily' | 'weekly' | 'monthly';
  amount_usdc: number;
  starts_at?: string;
  ends_at?: string;
}

// ── Supabase mini_sites table shape ──────────────────────────
export interface MiniSiteRow {
  id: string; user_id: string; slug: string;
  site_name: string; bio: string; avatar_url?: string;
  banner_url?: string; tagline?: string;
  theme?: string; accent_color?: string; columns?: number;
  bg_style?: string; gradient?: string;
  show_cv?: boolean; cv_headline?: string;
  cv_location?: string; cv_skills?: string;
  contact_price?: number; contact_lock?: string;
  paywall_enabled?: boolean; paywall_price?: number;
  published?: boolean; blocked?: boolean;
  boost_rank?: number; boost_expires_at?: string;
  platform?: string; badge?: string;
  sections_order?: string[];
  created_at: string; updated_at?: string;
}
