'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';
import type { MiniSiteRow, ProfileData, SlugListing } from '@/lib/types';

// ─── useProfile ───────────────────────────────────────────────
export function useProfile(user: User | null) {
  const [profile, setProfile] = useState<MiniSiteRow | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('mini_sites')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!data && !error) {
      // Auto-create profile
      const slug = user.email?.split('@')[0]?.toLowerCase().replace(/[^a-z0-9]/g,'') || `user${Date.now()}`;
      const { data: newProfile } = await supabase
        .from('mini_sites')
        .insert({ user_id:user.id, slug, site_name:user.user_metadata?.name||slug, platform:'trustbank', published:false })
        .select().single();
      setProfile(newProfile);
    } else {
      setProfile(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const update = async (updates: Partial<MiniSiteRow>) => {
    if (!profile) return { error: new Error('No profile') };
    const { data, error } = await supabase
      .from('mini_sites')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', profile.id)
      .select().single();
    if (!error && data) setProfile(data as MiniSiteRow);
    return { data, error };
  };

  const uploadPhoto = async (file: File, type: 'avatar' | 'banner') => {
    if (!profile) return null;
    const ext = file.name.split('.').pop();
    const path = `${profile.id}/${type}.${ext}`;
    const bucket = type === 'avatar' ? 'avatars' : 'banners';
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert:true });
    if (error) return null;
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
    await update(type === 'avatar' ? { avatar_url:publicUrl } : { banner_url:publicUrl });
    return publicUrl;
  };

  return { profile, loading, update, uploadPhoto, refetch: fetch };
}

// ─── useSiteVideos ────────────────────────────────────────────
export function useSiteVideos(siteId: string | undefined) {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!siteId) { setLoading(false); return; }
    supabase.from('mini_site_videos')
      .select('*').eq('site_id', siteId).order('sort_order')
      .then(({ data }) => { setVideos(data||[]); setLoading(false); });
  }, [siteId]);

  const addVideo = async (video: any) => {
    const { data } = await supabase.from('mini_site_videos')
      .insert({ ...video, site_id:siteId }).select().single();
    if (data) setVideos(prev => [...prev, data]);
    return data;
  };

  const updateVideo = async (id: string, updates: any) => {
    const { data } = await supabase.from('mini_site_videos')
      .update(updates).eq('id', id).select().single();
    if (data) setVideos(prev => prev.map(v => v.id===id ? data : v));
  };

  const deleteVideo = async (id: string) => {
    await supabase.from('mini_site_videos').delete().eq('id', id);
    setVideos(prev => prev.filter(v => v.id !== id));
  };

  return { videos, loading, addVideo, updateVideo, deleteVideo };
}

// ─── useSiteLinks ─────────────────────────────────────────────
export function useSiteLinks(siteId: string | undefined) {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!siteId) { setLoading(false); return; }
    supabase.from('mini_site_links')
      .select('*').eq('site_id', siteId).order('sort_order')
      .then(({ data }) => { setLinks(data||[]); setLoading(false); });
  }, [siteId]);

  const addLink = async (link: any) => {
    const { data } = await supabase.from('mini_site_links')
      .insert({ ...link, site_id:siteId, sort_order:links.length }).select().single();
    if (data) setLinks(prev => [...prev, data]);
  };

  const deleteLink = async (id: string) => {
    await supabase.from('mini_site_links').delete().eq('id', id);
    setLinks(prev => prev.filter(l => l.id !== id));
  };

  return { links, loading, addLink, deleteLink };
}

// ─── useFeedPosts ─────────────────────────────────────────────
export function useFeedPosts(siteId: string | undefined) {
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    if (!siteId) return;
    supabase.from('feed_posts')
      .select('*').eq('site_id', siteId)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending:false })
      .then(({ data }) => setPosts(data||[]));
  }, [siteId]);

  const addPost = async (post: any) => {
    const expires_at = post.pinned
      ? new Date(Date.now() + 365*864e5).toISOString()
      : new Date(Date.now() + 7*864e5).toISOString();
    const { data } = await supabase.from('feed_posts')
      .insert({ ...post, site_id:siteId, expires_at }).select().single();
    if (data) setPosts(prev => [data, ...prev]);
    return data;
  };

  return { posts, addPost };
}

// ─── useDirectorySites ────────────────────────────────────────
export function useDirectorySites(platform?: string) {
  const [sites, setSites] = useState<MiniSiteRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = supabase.from('mini_sites')
      .select('id,slug,site_name,bio,avatar_url,show_cv,contact_price,published,boost_rank,boost_expires_at,badge,platform')
      .eq('published', true)
      .eq('blocked', false)
      .order('boost_rank', { ascending:false })
      .order('created_at', { ascending:false })
      .limit(100);
    if (platform) q = q.eq('platform', platform);
    q.then(({ data }) => { setSites((data||[]) as MiniSiteRow[]); setLoading(false); });
  }, [platform]);

  return { sites, loading };
}

// ─── useSlugs ─────────────────────────────────────────────────
export function useSlugs(platform?: string) {
  const [slugs, setSlugs] = useState<SlugListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let q = supabase.from('slug_registrations' as any).select('*').in('status',['active','for_sale','auction']);
    if (platform) q = q.eq('platform', platform);
    q.order('created_at', { ascending:false })
      .then(({ data }) => { setSlugs((data||[]) as SlugListing[]); setLoading(false); });
  }, [platform]);

  return { slugs, loading };
}

// ─── usePublicSite ────────────────────────────────────────────
export function usePublicSite(slug: string) {
  const [site, setSite] = useState<MiniSiteRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    supabase.from('mini_sites').select('*')
      .eq('slug', slug).eq('published', true).maybeSingle()
      .then(({ data }) => { setSite(data as MiniSiteRow); setLoading(false); });
  }, [slug]);

  return { site, loading };
}

// ─── useBoost ─────────────────────────────────────────────────
export function useBoost() {
  const boostProfile = async (profileId: string, platform: string, positions: number, pricePerPos: number) => {
    const amount = positions * pricePerPos;
    const expires_at = new Date(Date.now() + 7*864e5).toISOString();
    const { error } = await supabase.from('directory_boosts').insert({
      profile_id: profileId, platform, boost_type:'per_position',
      positions_up: positions, amount_usdc: amount,
      active: true, expires_at
    });
    if (!error) {
      // Update boost_rank in mini_sites
      await supabase.from('mini_sites')
        .update({ boost_rank: positions, boost_expires_at: expires_at })
        .eq('id', profileId);
    }
    return { error };
  };

  return { boostProfile };
}

// ─── useWallet ────────────────────────────────────────────────
export function useWallet(userId: string | undefined) {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!userId) return;
    supabase.from('wallet_transactions')
      .select('*').eq('user_id', userId)
      .order('created_at', { ascending:false }).limit(50)
      .then(({ data }) => {
        const txs = data || [];
        setTransactions(txs);
        const bal = txs.reduce((s:number, t:any) =>
          t.type==='in' ? s+t.amount_usdc : s-t.amount_usdc, 0);
        setBalance(bal);
      });
  }, [userId]);

  return { balance, transactions };
}
