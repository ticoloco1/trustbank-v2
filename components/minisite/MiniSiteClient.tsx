'use client';
import { useState, useEffect } from 'react';
import {
  ExternalLink, Play, Lock, MapPin, Globe, Mail, Phone,
  Linkedin, BadgeCheck, Award, Share2, Heart, Clock, Pin,
  ChevronDown, ChevronUp, Briefcase, GraduationCap, Zap, Edit
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { BoostButton } from '@/components/ui/BoostButton';

// ─── Theme Engine ────────────────────────────────────────────
function getTheme(profile: any) {
  const accent = profile.accent_color || '#818cf8';
  const bgStyle = profile.theme || 'dark';

  const BG_MAP: Record<string, any> = {
    dark:     { bg:'#0a0a0f', text:'#f1f5f9', muted:'rgba(241,245,249,0.45)', surface:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.09)' },
    midnight: { bg:'#050508', text:'#f1f5f9', muted:'rgba(241,245,249,0.4)', surface:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.07)' },
    ocean:    { bg:'#030d1a', text:'#e0f2fe', muted:'rgba(224,242,254,0.45)', surface:'rgba(56,189,248,0.08)', border:'rgba(56,189,248,0.15)' },
    forest:   { bg:'#030d06', text:'#dcfce7', muted:'rgba(220,252,231,0.45)', surface:'rgba(74,222,128,0.07)', border:'rgba(74,222,128,0.15)' },
    rose:     { bg:'#1a0010', text:'#ffe4e6', muted:'rgba(255,228,230,0.45)', surface:'rgba(251,113,133,0.08)', border:'rgba(251,113,133,0.15)' },
    gold:     { bg:'#0c0900', text:'#fef3c7', muted:'rgba(254,243,199,0.45)', surface:'rgba(253,230,138,0.07)', border:'rgba(253,230,138,0.15)' },
    nebula:   { bg:'#0d0520', text:'#f3e8ff', muted:'rgba(243,232,255,0.45)', surface:'rgba(168,85,247,0.08)', border:'rgba(168,85,247,0.15)' },
    white:    { bg:'#ffffff', text:'#0f172a', muted:'rgba(15,23,42,0.5)', surface:'rgba(0,0,0,0.04)', border:'rgba(0,0,0,0.08)' },
    beige:    { bg:'#faf7f2', text:'#1c1917', muted:'rgba(28,25,23,0.5)', surface:'rgba(0,0,0,0.03)', border:'rgba(0,0,0,0.07)' },
    sky:      { bg:'#f0f9ff', text:'#0c4a6e', muted:'rgba(12,74,110,0.5)', surface:'rgba(14,165,233,0.06)', border:'rgba(14,165,233,0.15)' },
    mint:     { bg:'#f0fdf4', text:'#14532d', muted:'rgba(20,83,45,0.5)', surface:'rgba(22,163,74,0.06)', border:'rgba(22,163,74,0.15)' },
    lavender: { bg:'#faf5ff', text:'#4c1d95', muted:'rgba(76,29,149,0.5)', surface:'rgba(124,58,237,0.06)', border:'rgba(124,58,237,0.15)' },
  };

  const t = BG_MAP[bgStyle] || BG_MAP.dark;
  const isDark = ['dark','midnight','ocean','forest','rose','gold','nebula'].includes(bgStyle);
  return { ...t, accent, isDark };
}

// ─── Glass Card ──────────────────────────────────────────────
function GCard({ children, t, style, onClick }: any) {
  return (
    <div onClick={onClick} style={{
      background: t.surface, border: `0.5px solid ${t.border}`,
      borderRadius: 18, padding: 18,
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s', ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Feed Post ────────────────────────────────────────────────
function FeedPost({ post, t }: any) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const timeLeft = post.expires_at ? Math.max(0, Math.ceil((new Date(post.expires_at).getTime() - Date.now()) / 3600000)) : 0;

  return (
    <GCard t={t} style={{ marginBottom: 10, border: post.pinned ? `0.5px solid ${t.accent}40` : `0.5px solid ${t.border}` }}>
      {post.pinned && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8 }}>
          <Pin size={10} color={t.accent} />
          <span style={{ fontSize: 10, color: t.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pinned</span>
        </div>
      )}
      <p style={{ fontSize: 14, color: t.text, margin: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{post.text}</p>
      {post.image_url && <img src={post.image_url} style={{ width: '100%', borderRadius: 10, marginTop: 10, objectFit: 'cover', maxHeight: 240 }} />}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTop: `0.5px solid ${t.border}` }}>
        <button onClick={() => { setLiked(l => !l); setLikes((n: number) => liked ? n-1 : n+1); }}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: liked ? '#fb7185' : t.muted, fontSize: 12 }}>
          <Heart size={13} fill={liked ? '#fb7185' : 'none'} /> {likes > 0 ? likes : ''}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: t.muted }}>
          <Clock size={11} />
          {post.pinned ? `${Math.ceil(timeLeft/24)}d` : timeLeft > 24 ? `${Math.ceil(timeLeft/24)}d` : `${timeLeft}h`}
        </div>
      </div>
    </GCard>
  );
}

// ─── Main Component ──────────────────────────────────────────
export default function MiniSiteClient({ profile }: { profile: any }) {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [posts, setPosts] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);

  const t = getTheme(profile);
  const isOwner = user?.id === profile.user_id;
  const [newPostText, setNewPostText] = useState('');
  const [postingFeed, setPostingFeed] = useState(false);

  const submitPost = async () => {
    if (!newPostText.trim() || !profile?.id) return;
    setPostingFeed(true);
    const expires = new Date(Date.now() + 7*86400000).toISOString();
    const { data } = await supabase.from('feed_posts').insert({
      site_id: profile.id, text: newPostText, pinned: false, expires_at: expires,
    }).select().single();
    if (data) setPosts((prev: any[]) => [data, ...prev]);
    setNewPostText('');
    setPostingFeed(false);
  };

  // Parse pages
  const pages: {id:string;label:string}[] = (() => {
    try { return JSON.parse(profile.site_pages || '[]'); } catch { return []; }
  })();
  const hasPagesMenu = pages.length > 1;

  const pageContents: Record<string,string> = (() => {
    try { return JSON.parse(profile.page_contents || '{}'); } catch { return {}; }
  })();

  useEffect(() => {
    if (!profile?.id) return;
    // Load links
    supabase.from('mini_site_links').select('*').eq('site_id', profile.id).order('sort_order')
      .then(({ data }) => setLinks(data || []));
    // Load videos
    supabase.from('mini_site_videos').select('*').eq('site_id', profile.id).order('sort_order')
      .then(({ data }) => setVideos(data || []));
    // Load feed
    supabase.from('feed_posts').select('*').eq('site_id', profile.id)
      .gte('expires_at', new Date().toISOString())
      .order('pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => setPosts(data || []));
  }, [profile.id]);

  const photoShape = profile.photo_shape === 'square' ? '8px' : profile.photo_shape === 'rounded' ? '20px' : '50%';

  return (
    <div style={{
      minHeight: '100vh', background: t.bg, color: t.text,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      direction: 'ltr',
    }}>
      {/* Banner */}
      {profile.banner_url && (
        <div style={{ width: '100%', height: 140, overflow: 'hidden', position: 'relative' }}>
          <img src={profile.banner_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 40%, ${t.bg})` }} />
        </div>
      )}

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 20px 40px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', paddingTop: profile.banner_url ? 0 : 32, marginBottom: 24 }}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} style={{ width: 88, height: 88, borderRadius: photoShape, objectFit: 'cover', border: `2.5px solid ${t.accent}`, marginTop: profile.banner_url ? -44 : 0, display: 'block', margin: '0 auto 12px' }} />
          ) : (
            <div style={{ width: 88, height: 88, borderRadius: '50%', background: `${t.accent}25`, border: `2px solid ${t.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 900, color: t.accent, margin: '0 auto 12px' }}>
              {(profile.site_name || '?')[0].toUpperCase()}
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 900, color: t.text, margin: 0 }}>{profile.site_name || profile.slug}</h1>
            {profile.badge === 'blue' && <BadgeCheck size={18} color="#60a5fa" />}
            {profile.badge === 'gold' && <Award size={18} color="#f59e0b" />}
          </div>

          {profile.cv_headline && <p style={{ fontSize: 13, color: t.accent, fontWeight: 600, margin: '0 0 4px' }}>{profile.cv_headline}</p>}
          {profile.bio && <p style={{ fontSize: 13, color: t.muted, margin: '0 0 12px', lineHeight: 1.6 }}>{profile.bio}</p>}

          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
            {isOwner && (
              <a href="/editor" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderRadius: 8, background: `${t.accent}15`, border: `0.5px solid ${t.accent}30`, color: t.accent, textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
                <Edit size={12} /> Edit site
              </a>
            )}
            <BoostButton siteId={profile.id} slug={profile.slug} accent={t.accent} compact />
            <button onClick={() => { navigator.share?.({ url: window.location.href }); }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, background: `${t.surface}`, border: `0.5px solid ${t.border}`, color: t.muted, cursor: 'pointer', fontSize: 12 }}>
              <Share2 size={12} /> Share
            </button>
          </div>
        </div>

        {/* Pages navigation */}
        {hasPagesMenu && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 20, justifyContent: 'center', background: t.surface, borderRadius: 12, padding: 4 }}>
            {pages.map(page => (
              <button key={page.id} onClick={() => setActivePage(page.id)} style={{
                flex: 1, padding: '8px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: activePage === page.id ? t.accent : 'transparent',
                color: activePage === page.id ? '#fff' : t.muted,
                fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
              }}>
                {page.label}
              </button>
            ))}
          </div>
        )}

        {/* Page content (non-home) */}
        {activePage !== 'home' && (
          <div className="rich-content" style={{ fontSize: 15, lineHeight: 1.8, color: t.text, marginBottom: 24 }}
            dangerouslySetInnerHTML={{ __html: pageContents[activePage] || `<p style="opacity:0.4;text-align:center;padding:40px 0">No content yet</p>` }}
          />
        )}

        {/* Home content */}
        {activePage === 'home' && (
          <>
            {/* Home page rich content */}
            {pageContents['home'] && (
              <div className="rich-content" style={{ fontSize: 15, lineHeight: 1.8, color: t.text, marginBottom: 20 }}
                dangerouslySetInnerHTML={{ __html: pageContents['home'] }}
              />
            )}

            {/* Links */}
            {links.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                {links.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener" style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '14px 16px', borderRadius: 14, marginBottom: 8,
                    background: link.color ? `${link.color}15` : t.surface,
                    border: `0.5px solid ${link.color ? `${link.color}30` : t.border}`,
                    textDecoration: 'none', transition: 'all 0.15s',
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: link.color || t.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Globe size={14} color="#fff" />
                    </div>
                    <span style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 700, color: t.text }}>{link.title}</span>
                    <ExternalLink size={13} color={t.muted} />
                  </a>
                ))}
              </div>
            )}

            {/* CV Section */}
            {profile.show_cv && (
              <GCard t={t} style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Briefcase size={16} color={t.accent} />
                  <span style={{ fontSize: 14, fontWeight: 800, color: t.text }}>Resume / CV</span>
                  {profile.cv_locked && <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#f59e0b', fontWeight: 700 }}><Lock size={11} /> ${profile.cv_price} USDC to unlock</span>}
                </div>
                {profile.cv_headline && <p style={{ fontSize: 14, fontWeight: 700, color: t.accent, margin: '0 0 4px' }}>{profile.cv_headline}</p>}
                {profile.cv_location && <p style={{ fontSize: 12, color: t.muted, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {profile.cv_location}</p>}
                {profile.cv_locked ? (
                  <button style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: `linear-gradient(135deg, #f59e0b, #d97706)`, color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: 14 }}>
                    🔓 Unlock CV — ${profile.cv_price} USDC
                  </button>
                ) : (
                  profile.cv_content && <p style={{ fontSize: 13, color: t.muted, lineHeight: 1.7, whiteSpace: 'pre-wrap', margin: 0 }}>{profile.cv_content.slice(0, 300)}{profile.cv_content.length > 300 ? '...' : ''}</p>
                )}
              </GCard>
            )}

            {/* Videos */}
            {videos.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Videos</p>
                {videos.map(v => (
                  <GCard key={v.id} t={t} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {v.youtube_video_id && (
                        <img src={`https://img.youtube.com/vi/${v.youtube_video_id}/mqdefault.jpg`} style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: '0 0 4px' }}>{v.title}</p>
                        {v.paywall_enabled ? (
                          <span style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>🔒 ${v.paywall_price} USDC</span>
                        ) : (
                          <span style={{ fontSize: 11, color: t.muted }}>Free</span>
                        )}
                      </div>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${t.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {v.paywall_enabled ? <Lock size={14} color={t.accent} /> : <Play size={14} color={t.accent} />}
                      </div>
                    </div>
                  </GCard>
                ))}
              </div>
            )}

            {/* Feed */}
            {profile.show_feed !== false && posts.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: t.muted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Posts</p>
                  <span style={{ fontSize: 11, color: t.muted }}>{posts.length} posts</span>
                </div>
                {/* Feed window with scroll */}
                <div className="feed-window" style={{ borderRadius: 14, border: `0.5px solid ${t.border}` }}>
                  <div style={{ padding: 8 }}>
                    {posts.map(post => <FeedPost key={post.id} post={post} t={t} />)}
                  </div>
                </div>
              </div>
            )}

            {/* Feed composer for owner */}
            {isOwner && profile.show_feed !== false && (
              <div style={{ marginTop: 12, padding: 14, borderRadius: 14, background: t.surface, border: `0.5px solid ${t.border}` }}>
                <textarea value={newPostText} onChange={e => setNewPostText(e.target.value)}
                  placeholder="Write a post..."
                  style={{ width:'100%', background:'transparent', border:'none', outline:'none', color:t.text, fontSize:13, lineHeight:1.6, resize:'none', fontFamily:'inherit', minHeight:60, boxSizing:'border-box' as const }}
                />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
                  <span style={{ fontSize:11, color:t.muted }}>7 days · PIN for $10 USDC</span>
                  <button onClick={submitPost} disabled={!newPostText.trim() || postingFeed} style={{
                    padding:'7px 16px', borderRadius:8, border:'none',
                    background:newPostText.trim()?t.accent:'rgba(255,255,255,0.1)',
                    color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer',
                  }}>
                    {postingFeed ? '...' : 'Publish'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: `0.5px solid ${t.border}`, textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: t.muted, opacity: 0.5, margin: 0 }}>
            <a href="/" style={{ color: 'inherit', textDecoration: 'none', fontWeight: 700 }}>TrustBank</a> · {profile.slug}.trustbank.xyz
          </p>
        </div>
      </div>

      <style>{`
        .feed-window { overflow-y: auto; max-height: 434px; scrollbar-width: thin; scrollbar-color: rgba(129,140,248,0.2) transparent; }
        .rich-content { direction: ltr; text-align: left; }
        .rich-content h1 { font-size: clamp(20px,4vw,28px); font-weight: 900; margin: 16px 0 8px; }
        .rich-content h2 { font-size: clamp(17px,3vw,22px); font-weight: 800; margin: 14px 0 6px; }
        .rich-content p { margin: 0 0 10px; }
        .rich-content ul, .rich-content ol { padding-left: 20px; margin: 8px 0; }
        .rich-content img { max-width: 100%; border-radius: 8px; margin: 8px 0; }
        .rich-content iframe { max-width: 100%; border-radius: 8px; margin: 8px 0; }
        .rich-content blockquote { border-left: 3px solid; padding-left: 12px; opacity: 0.8; margin: 10px 0; font-style: italic; }
        .rich-content a { text-decoration: underline; }
        .rich-content pre { background: rgba(0,0,0,0.15); border-radius: 6px; padding: 10px; font-family: monospace; font-size: 12px; overflow-x: auto; }
      `}</style>
    </div>
  );
}
