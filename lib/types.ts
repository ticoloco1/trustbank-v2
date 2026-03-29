export type Platform = 'trustbank' | 'jobinlink' | 'hashpo' | 'mybik';

export interface MiniSiteRow {
  id: string;
  user_id: string;
  slug: string;
  site_name: string;
  bio?: string;
  avatar_url?: string;
  banner_url?: string;
  accent_color?: string;
  bg_style?: string;
  gradient?: string;
  font?: string;
  photo_shape?: string;
  photo_size?: string;
  show_cv?: boolean;
  cv_locked?: boolean;
  cv_price?: number;
  cv_headline?: string;
  cv_location?: string;
  cv_skills?: string[];
  cv_content?: string;
  show_feed?: boolean;
  feed_cols?: number;
  module_order?: string;
  site_pages?: string;
  page_contents?: string;
  page_width?: number;
  wallet_address?: string;
  contact_email?: string;
  published?: boolean;
  is_verified?: boolean;
  badge?: string;
  platform?: Platform;
  created_at?: string;
  updated_at?: string;
}
