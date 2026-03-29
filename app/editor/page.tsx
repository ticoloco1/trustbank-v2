'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useSiteLinks, useSiteVideos, useFeedPosts } from '@/hooks/useMiniSite';
import { useLang } from '@/hooks/useLang';
import { supabase } from '@/lib/supabase';
import { slugPrice } from '@/lib/slug';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { Navbar } from '@/components/layout/Navbar';
import {
  Save, Eye, Upload, Plus, X, Loader2, Globe, Link2, Video,
  FileText, ChevronDown, Image as ImageIcon, Shield, GripVertical,
  ExternalLink, Send, Pin, Trash2, Check
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const A = '#818cf8';

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? m[1] : null;
}

const THEMES = [
  { id:'dark',     label:'Dark',     bg:'#0a0a0f', text:'#f1f5f9', accent:'#818cf8' },
  { id:'midnight', label:'Midnight', bg:'#050508', text:'#f1f5f9', accent:'#6366f1' },
  { id:'ocean',    label:'Ocean',    bg:'#030d1a', text:'#e0f2fe', accent:'#38bdf8' },
  { id:'forest',   label:'Forest',   bg:'#030d06', text:'#dcfce7', accent:'#4ade80' },
  { id:'rose',     label:'Rose',     bg:'#1a0010', text:'#ffe4e6', accent:'#fb7185' },
  { id:'gold',     label:'Gold',     bg:'#0c0900', text:'#fef3c7', accent:'#fde68a' },
  { id:'nebula',   label:'Nebula',   bg:'#0d0520', text:'#f3e8ff', accent:'#a855f7' },
  { id:'white',    label:'White',    bg:'#ffffff', text:'#0f172a', accent:'#6366f1' },
  { id:'beige',    label:'Beige',    bg:'#faf7f2', text:'#1c1917', accent:'#b45309' },
  { id:'sky',      label:'Sky',      bg:'#f0f9ff', text:'#0c4a6e', accent:'#0ea5e9' },
  { id:'mint',     label:'Mint',     bg:'#f0fdf4', text:'#14532d', accent:'#16a34a' },
  { id:'lavender', label:'Lavender', bg:'#faf5ff', text:'#4c1d95', accent:'#7c3aed' },
];

const ACCENTS = ['#818cf8','#f59e0b','#10b981','#ef4444','#06b6d4','#a855f7','#f43f5e','#0ea5e9','#84cc16','#fb923c'];

export default function EditorPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, update: save } = useProfile(user);
  const { links, addLink, deleteLink } = useSiteLinks(profile?.id);
  const { videos, addVideo, deleteVideo } = useSiteVideos(profile?.id);
  const { posts: feedPosts, addPost } = useFeedPosts(profile?.id);
  const [posts, setPosts] = useState<any[]>([]);
  useEffect(() => { setPosts(feedPosts); }, [feedPosts]);
  const { t } = useLang();
  const router = useRouter();
  const dirty = useRef(false);

  // Profile state
  const [siteName, setSiteName] = useState('');
  const [slug, setSlug] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [walletAddr, setWalletAddr] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [published, setPublished] = useState(false);

  // Theme state
  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState('#818cf8');
  const [photoShape, setPhotoShape] = useState('round');

  // Pages state
  const [pages, setPages] = useState<{id:string;label:string}[]>([{id:'home',label:'Home'}]);
  const [pageContents, setPageContents] = useState<Record<string,string>>({});
  const [pageWidth, setPageWidth] = useState(680);

  // CV state
  const [showCv, setShowCv] = useState(false);
  const [cvLocked, setCvLocked] = useState(false);
  const [cvPrice, setCvPrice] = useState('20');
  const [cvHeadline, setCvHeadline] = useState('');
  const [cvLocation, setCvLocation] = useState('');
  const [cvContent, setCvContent] = useState('');

  // Feed state
  const [showFeed, setShowFeed] = useState(true);
  const [feedText, setFeedText] = useState('');
  const [posting, setPosting] = useState(false);

  // UI state
  const [tab, setTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSavedState] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  // Link form
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkIcon, setLinkIcon] = useState('link');

  // Video form
  const [ytUrl, setYtUrl] = useState('');
  const [ytTitle, setYtTitle] = useState('');
  const [paywallOn, setPaywallOn] = useState(false);
  const [paywallPrice, setPaywallPrice] = useState('4.99');

  useEffect(() => {
    if (!profile) return;
    setSiteName(profile.site_name || '');
    setSlug(profile.slug || '');
    setBio(profile.bio || '');
    setAvatarUrl(profile.avatar_url || '');
    setBannerUrl((profile as any).banner_url || '');
    setWalletAddr((profile as any).wallet_address || '');
    setContactEmail((profile as any).contact_email || '');
    setPublished(profile.published || false);
    setTheme(profile.theme || 'dark');
    setAccent(profile.accent_color || '#818cf8');
    setPhotoShape(profile.photo_shape || 'round');
    setShowCv(profile.show_cv || false);
    setCvLocked(profile.cv_locked || false);
    setCvPrice(String(profile.cv_price || 20));
    setCvHeadline(profile.cv_headline || '');
    setCvLocation((profile as any).cv_location || '');
    setCvContent(profile.cv_content || '');
    setShowFeed((profile as any).show_feed !== false);
    if ((profile as any).site_pages) try { setPages(JSON.parse((profile as any).site_pages)); } catch {}
    if ((profile as any).page_contents) try { setPageContents(JSON.parse((profile as any).page_contents)); } catch {}
    if ((profile as any).page_width) setPageWidth((profile as any).page_width);
  }, [profile]);

  const upload = async (file: File, folder: string) => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user!.id}/${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('platform-assets').upload(path, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from('platform-assets').getPublicUrl(path).data.publicUrl;
  };

  const handleSave = async (silent = false) => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      await save({
        site_name: siteName, bio, avatar_url: avatarUrl, banner_url: bannerUrl,
        theme, accent_color: accent, photo_shape: photoShape,
        show_cv: showCv, cv_locked: cvLocked, cv_price: parseFloat(cvPrice) || 20,
        cv_headline: cvHeadline, cv_content: cvContent, cv_location: cvLocation,
        show_feed: showFeed, wallet_address: walletAddr, contact_email: contactEmail,
        published, site_pages: JSON.stringify(pages),
        page_contents: JSON.stringify(pageContents), page_width: pageWidth,
        platform: 'trustbank',
      } as any);
      dirty.current = false;
      setSavedState(true);
      setTimeout(() => setSavedState(false), 2000);
    } catch {}
    setSaving(false);
  };

  const postFeed = async () => {
    if (!feedText.trim() || !profile?.id) return;
    setPosting(true);
    await addPost({ text: feedText, pinned: false });
    setFeedText('');
    setPosting(false);
  };

  if (authLoading || profileLoading) return (
    <div style={{ minHeight:'100vh', background:'#0d1117', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Loader2 size={32} color={A} className="animate-spin" />
    </div>
  );

  if (!user) { router.push('/login'); return null; }

  const siteUrl = profile?.slug ? `https://${profile.slug}.trustbank.xyz` : null;
  const currentTheme = THEMES.find(t => t.id === theme) || THEMES[0];

  const TABS = [
    { id:'profile', label:t.profile, icon:Globe },
    { id:'theme',   label:t.theme,   icon:ImageIcon },
    { id:'links',   label:t.links,   icon:Link2 },
    { id:'videos',  label:t.videos,  icon:Video },
    { id:'cv',      label:t.cv,      icon:FileText },
    { id:'feed',    label:t.feed,    icon:ChevronDown },
    { id:'pages',   label:t.pages,   icon:FileText },
    { id:'verify',  label:t.verify,  icon:Shield },
  ];

  const inp = { width:'100%', padding:'10px 14px', borderRadius:10, border:'0.5px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.05)', color:'#f1f5f9', fontSize:14, outline:'none', boxSizing:'border-box' as const, fontFamily:'inherit' };
  const card = { background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:16, padding:24, marginBottom:16 };
  const label = { fontSize:11, fontWeight:700, color:'rgba(241,245,249,0.45)', textTransform:'uppercase' as const, letterSpacing:'0.06em', display:'block', marginBottom:6 };
  const toggle = (on: boolean) => ({
    width:44, height:24, borderRadius:12, background:on?A:'rgba(255,255,255,0.1)',
    border:'none', cursor:'pointer', position:'relative' as const, transition:'all 0.2s', flexShrink:0,
  });
  const toggleDot = (on: boolean) => ({
    position:'absolute' as const, top:4, width:16, height:16,
    borderRadius:'50%', background:'white', transition:'all 0.2s',
    left: on ? 24 : 4,
  });

  return (
    <div style={{ minHeight:'100vh', background:'#0d1117', color:'#f1f5f9', fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <Navbar />

      {/* Top bar */}
      <div style={{ position:'sticky', top:60, zIndex:40, background:'rgba(13,17,23,0.95)', backdropFilter:'blur(20px)', borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 24px', display:'flex', alignItems:'center', height:52, gap:4, overflowX:'auto' }}>
          {TABS.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{
              display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8,
              border:'none', background:tab===tb.id ? `${A}18` : 'transparent',
              color:tab===tb.id ? A : 'rgba(241,245,249,0.45)',
              cursor:'pointer', fontSize:13, fontWeight:600, whiteSpace:'nowrap', flexShrink:0,
            }}>
              <tb.icon size={14} /> {tb.label}
            </button>
          ))}
          <div style={{ flex:1 }} />
          <div style={{ display:'flex', gap:8, flexShrink:0 }}>
            {siteUrl && (
              <Link href={`/s/${profile?.slug}`} target="_blank" style={{
                display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8,
                border:`0.5px solid rgba(255,255,255,0.1)`, background:'transparent',
                color:'#4ade80', textDecoration:'none', fontSize:13, fontWeight:600,
              }}>
                <Eye size={14} /> {t.preview}
              </Link>
            )}
            <button onClick={() => handleSave()} disabled={saving} style={{
              display:'flex', alignItems:'center', gap:5, padding:'6px 14px', borderRadius:8,
              border:'none', background: saved ? '#4ade8020' : A,
              color: saved ? '#4ade80' : '#fff', cursor:'pointer', fontSize:13, fontWeight:700,
            }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : <Save size={14} />}
              {saving ? t.saving : saved ? 'Saved!' : t.save}
            </button>
            <button onClick={async () => {
              setPublished(true); dirty.current = true;
              await handleSave(true);
              await save({ published: true } as any);
            }} style={{
              padding:'6px 14px', borderRadius:8, border:'none', cursor:'pointer',
              background: published ? '#4ade8020' : 'linear-gradient(135deg,#f59e0b,#d97706)',
              color: published ? '#4ade80' : '#fff', fontSize:13, fontWeight:800,
            }}>
              {published ? `✓ ${t.live}` : t.publish}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'28px 24px', display:'grid', gridTemplateColumns:'1fr 300px', gap:24 }}>
        {/* Main panel */}
        <div>

          {/* PROFILE */}
          {tab === 'profile' && (
            <div style={card}>
              <p style={{ fontSize:16, fontWeight:800, color:'#f1f5f9', marginBottom:20 }}>Profile</p>
              <div style={{ display:'flex', gap:16, marginBottom:20, alignItems:'flex-start' }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ width:72, height:72, borderRadius:photoShape==='round'?'50%':12, overflow:'hidden', background:`${A}20`, border:`2px solid ${accent}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:900, color:accent }}>
                    {avatarUrl ? <img src={avatarUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : (siteName||'?')[0]}
                  </div>
                  <label style={{ position:'absolute', bottom:-6, right:-6, width:26, height:26, borderRadius:'50%', background:A, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                    {uploadingAvatar ? <Loader2 size={13} color="#fff" /> : <Upload size={13} color="#fff" />}
                    <input type="file" accept="image/*" style={{ display:'none' }} onChange={async e => {
                      const f = e.target.files?.[0]; if (!f) return;
                      setUploadingAvatar(true);
                      const url = await upload(f, 'avatars'); setAvatarUrl(url); dirty.current = true;
                      setUploadingAvatar(false);
                    }} />
                  </label>
                </div>
                <div style={{ flex:1 }}>
                  <label style={label}>{t.displayName}</label>
                  <input value={siteName} onChange={e => { setSiteName(e.target.value); dirty.current=true; }} style={{ ...inp, marginBottom:10 }} placeholder="Your Name" />
                  <label style={label}>Banner</label>
                  <label style={{ ...inp, display:'flex', alignItems:'center', gap:8, cursor:'pointer', marginBottom:0 }}>
                    {uploadingBanner ? <Loader2 size={14} /> : <Upload size={14} />}
                    {bannerUrl ? 'Change banner' : 'Upload banner'}
                    <input type="file" accept="image/*" style={{ display:'none' }} onChange={async e => {
                      const f = e.target.files?.[0]; if (!f) return;
                      setUploadingBanner(true);
                      const url = await upload(f, 'banners'); setBannerUrl(url); dirty.current=true;
                      setUploadingBanner(false);
                    }} />
                  </label>
                </div>
              </div>
              <label style={label}>Bio</label>
              <textarea value={bio} onChange={e => { setBio(e.target.value); dirty.current=true; }} style={{ ...inp, resize:'vertical', minHeight:80, marginBottom:12 }} placeholder="A short description..." />
              <label style={label}>{t.username}</label>
              <input value={slug} onChange={e => { setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,'')); dirty.current=true; }} style={{ ...inp, fontFamily:"'JetBrains Mono', monospace", marginBottom:6 }} placeholder="yourname" />
              {slug && <p style={{ fontSize:12, color:A, marginBottom:12 }}>✓ {slug}.trustbank.xyz{slugPrice(slug)>12?` · $${slugPrice(slug).toLocaleString()} USDC`:''}</p>}
              <label style={label}>{t.wallet}</label>
              <input value={walletAddr} onChange={e => { setWalletAddr(e.target.value); dirty.current=true; }} style={{ ...inp, fontFamily:"'JetBrains Mono', monospace", marginBottom:12 }} placeholder="0x..." />
              <label style={label}>{t.contactEmail}</label>
              <input value={contactEmail} onChange={e => { setContactEmail(e.target.value); dirty.current=true; }} type="email" style={inp} placeholder="you@example.com" />
            </div>
          )}

          {/* THEME */}
          {tab === 'theme' && (
            <div style={card}>
              <p style={{ fontSize:16, fontWeight:800, color:'#f1f5f9', marginBottom:20 }}>Theme</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(88px,1fr))', gap:8, marginBottom:20 }}>
                {THEMES.map(th => (
                  <button key={th.id} onClick={() => { setTheme(th.id); setAccent(th.accent); dirty.current=true; }} style={{
                    borderRadius:12, overflow:'hidden', border: theme===th.id ? `2px solid ${A}` : '1px solid rgba(255,255,255,0.1)',
                    cursor:'pointer', transition:'all 0.15s', background:th.bg,
                  }}>
                    <div style={{ padding:'8px 8px 4px', background:th.bg }}>
                      <div style={{ width:14, height:14, borderRadius:'50%', background:th.accent, marginBottom:4 }} />
                      <div style={{ height:2, background:th.text, opacity:0.5, borderRadius:2, marginBottom:3, width:'80%' }} />
                      <div style={{ height:6, background:th.accent, opacity:0.8, borderRadius:3 }} />
                    </div>
                    <p style={{ fontSize:9, fontWeight:700, color:th.text, textAlign:'center', padding:'3px 4px 5px', margin:0, background:th.bg }}>{th.label}</p>
                  </button>
                ))}
              </div>
              <label style={label}>Accent Color</label>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:20 }}>
                {ACCENTS.map(c => (
                  <button key={c} onClick={() => { setAccent(c); dirty.current=true; }} style={{ width:28, height:28, borderRadius:'50%', background:c, border:accent===c?`3px solid white`:'2px solid rgba(255,255,255,0.2)', cursor:'pointer' }} />
                ))}
                <input type="color" value={accent} onChange={e => { setAccent(e.target.value); dirty.current=true; }} style={{ width:28, height:28, borderRadius:'50%', border:'none', cursor:'pointer', padding:0 }} />
              </div>
              <label style={label}>Photo Shape</label>
              <div style={{ display:'flex', gap:8 }}>
                {[['round','● Round'],['square','■ Square'],['rounded','▢ Rounded']].map(([v,l]) => (
                  <button key={v} onClick={() => { setPhotoShape(v); dirty.current=true; }} style={{
                    flex:1, padding:'8px', borderRadius:8, border:`0.5px solid ${photoShape===v?A:'rgba(255,255,255,0.1)'}`,
                    background:photoShape===v?`${A}15`:'transparent', color:photoShape===v?A:'rgba(241,245,249,0.5)',
                    cursor:'pointer', fontSize:13, fontWeight:600,
                  }}>{l}</button>
                ))}
              </div>
            </div>
          )}

          {/* LINKS */}
          {tab === 'links' && (
            <div style={card}>
              <p style={{ fontSize:16, fontWeight:800, color:'#f1f5f9', marginBottom:20 }}>Links & Social</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:16 }}>
                <div>
                  <label style={label}>Title</label>
                  <input value={linkTitle} onChange={e => setLinkTitle(e.target.value)} style={inp} placeholder="My Instagram" />
                </div>
                <div>
                  <label style={label}>URL</label>
                  <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} style={inp} placeholder="https://..." />
                </div>
              </div>
              <button onClick={async () => {
                if (!linkTitle || !linkUrl || !profile?.id) return;
                await addLink({ title:linkTitle, url:linkUrl, icon:linkIcon, sort_order:links.length });
                setLinkTitle(''); setLinkUrl('');
              }} style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 16px', borderRadius:10, border:'none', background:A, color:'#fff', cursor:'pointer', fontWeight:700, fontSize:13, marginBottom:16 }}>
                <Plus size={15} /> Add Link
              </button>
              {links.map((l: any) => (
                <div key={l.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', marginBottom:6 }}>
                  <span style={{ flex:1, fontSize:14, fontWeight:600, color:'#f1f5f9' }}>{l.title}</span>
                  <span style={{ fontSize:12, color:'rgba(241,245,249,0.4)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.url}</span>
                  <button onClick={() => deleteLink(l.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.7)' }}><X size={15} /></button>
                </div>
              ))}
            </div>
          )}

          {/* VIDEOS */}
          {tab === 'videos' && (
            <div style={card}>
              <p style={{ fontSize:16, fontWeight:800, color:'#f1f5f9', marginBottom:20 }}>YouTube Videos</p>
              <label style={label}>YouTube URL</label>
              <input value={ytUrl} onChange={e => setYtUrl(e.target.value)} style={{ ...inp, marginBottom:8 }} placeholder="https://youtube.com/watch?v=..." />
              <label style={label}>Title (optional)</label>
              <input value={ytTitle} onChange={e => setYtTitle(e.target.value)} style={{ ...inp, marginBottom:12 }} placeholder="Video title" />
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', marginBottom:12 }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', margin:0 }}>Enable Paywall</p>
                  <p style={{ fontSize:11, color:'rgba(241,245,249,0.4)', margin:'2px 0 0' }}>Fans pay USDC to watch · you get 70%</p>
                </div>
                <button onClick={() => setPaywallOn(p => !p)} style={toggle(paywallOn)}><div style={toggleDot(paywallOn)} /></button>
              </div>
              {paywallOn && (
                <>
                  <label style={label}>Price (USDC)</label>
                  <input value={paywallPrice} onChange={e => setPaywallPrice(e.target.value)} type="number" step="0.01" min="0.5" style={{ ...inp, marginBottom:12 }} />
                </>
              )}
              <button onClick={async () => {
                if (!ytUrl || !profile?.id) return;
                const ytId = extractYouTubeId(ytUrl);
                if (!ytId) { alert('Invalid YouTube URL'); return; }
                await addVideo({ youtube_video_id:ytId, title:ytTitle||'Video', paywall_enabled:paywallOn, paywall_price:parseFloat(paywallPrice)||4.99, sort_order:videos.length });
                setYtUrl(''); setYtTitle('');
              }} style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 16px', borderRadius:10, border:'none', background:A, color:'#fff', cursor:'pointer', fontWeight:700, fontSize:13, marginBottom:16 }}>
                <Plus size={15} /> Add Video
              </button>
              {videos.map((v: any) => (
                <div key={v.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', marginBottom:6 }}>
                  {v.youtube_video_id && <img src={`https://img.youtube.com/vi/${v.youtube_video_id}/default.jpg`} style={{ width:52, height:36, objectFit:'cover', borderRadius:6, flexShrink:0 }} />}
                  <span style={{ flex:1, fontSize:13, fontWeight:600, color:'#f1f5f9' }}>{v.title}</span>
                  {v.paywall_enabled && <span style={{ fontSize:11, color:'#f59e0b' }}>🔒 ${v.paywall_price}</span>}
                  <button onClick={() => deleteVideo(v.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.7)' }}><X size={15} /></button>
                </div>
              ))}
            </div>
          )}

          {/* CV */}
          {tab === 'cv' && (
            <div style={card}>
              <p style={{ fontSize:16, fontWeight:800, color:'#f1f5f9', marginBottom:20 }}>CV / Resume</p>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', marginBottom:12 }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', margin:0 }}>Show CV on site</p>
                <button onClick={() => { setShowCv(p => !p); dirty.current=true; }} style={toggle(showCv)}><div style={toggleDot(showCv)} /></button>
              </div>
              {showCv && <>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', marginBottom:12 }}>
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', margin:0 }}>Lock behind payment</p>
                    <p style={{ fontSize:11, color:'rgba(241,245,249,0.4)', margin:'2px 0 0' }}>Companies pay to unlock · you get 50%</p>
                  </div>
                  <button onClick={() => { setCvLocked(p => !p); dirty.current=true; }} style={toggle(cvLocked)}><div style={toggleDot(cvLocked)} /></button>
                </div>
                {cvLocked && <><label style={label}>Unlock Price (USDC)</label><input value={cvPrice} onChange={e => { setCvPrice(e.target.value); dirty.current=true; }} type="number" min="1" style={{ ...inp, marginBottom:12 }} /></>}
                <label style={label}>Headline</label>
                <input value={cvHeadline} onChange={e => { setCvHeadline(e.target.value); dirty.current=true; }} style={{ ...inp, marginBottom:12 }} placeholder="Senior Engineer at Acme" />
                <label style={label}>Location</label>
                <input value={cvLocation} onChange={e => { setCvLocation(e.target.value); dirty.current=true; }} style={{ ...inp, marginBottom:12 }} placeholder="São Paulo, BR · Remote" />
                <label style={label}>Resume Content</label>
                <textarea value={cvContent} onChange={e => { setCvContent(e.target.value); dirty.current=true; }} style={{ ...inp, resize:'vertical', minHeight:160 }} placeholder="Work experience, education, skills..." />
              </>}
            </div>
          )}

          {/* FEED */}
          {tab === 'feed' && (
            <div>
              <div style={card}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                  <p style={{ fontSize:16, fontWeight:800, color:'#f1f5f9', margin:0 }}>Feed Settings</p>
                  <button onClick={() => { setShowFeed(p => !p); dirty.current=true; }} style={toggle(showFeed)}><div style={toggleDot(showFeed)} /></button>
                </div>
              </div>
              <div style={card}>
                <p style={{ fontSize:14, fontWeight:700, color:'#f1f5f9', marginBottom:12 }}>✍️ New Post</p>
                <textarea value={feedText} onChange={e => setFeedText(e.target.value)}
                  placeholder="What do you want to share?"
                  style={{ ...inp, resize:'vertical', minHeight:80, marginBottom:10 }} />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  {siteUrl && <Link href={`/s/${profile?.slug}`} target="_blank" style={{ fontSize:12, color:A, textDecoration:'none', fontWeight:600 }}>View site →</Link>}
                  <button onClick={postFeed} disabled={!feedText.trim()||posting} style={{
                    display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:8,
                    border:'none', background:feedText.trim()?A:'rgba(255,255,255,0.1)',
                    color:'#fff', cursor:feedText.trim()?'pointer':'not-allowed', fontWeight:700, fontSize:13,
                  }}>
                    {posting ? <Loader2 size={14} /> : <Send size={14} />}
                    Publish
                  </button>
                </div>
              </div>
              <div style={card}>
                <p style={{ fontSize:13, fontWeight:700, color:'rgba(241,245,249,0.5)', marginBottom:12, textTransform:'uppercase', letterSpacing:'0.06em' }}>Published Posts ({posts.length})</p>
                {posts.length === 0 && <p style={{ fontSize:13, color:'rgba(241,245,249,0.3)', textAlign:'center', padding:'20px 0' }}>No posts yet</p>}
                {posts.map((p: any) => (
                  <div key={p.id} style={{ padding:'12px 14px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:`0.5px solid ${p.pinned?`${A}40`:'rgba(255,255,255,0.08)'}`, marginBottom:8 }}>
                    {p.pinned && <p style={{ fontSize:10, color:A, fontWeight:700, marginBottom:4 }}>📌 PINNED</p>}
                    <p style={{ fontSize:13, color:'#f1f5f9', margin:0, whiteSpace:'pre-wrap' }}>{p.text}</p>
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, paddingTop:6, borderTop:'0.5px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize:11, color:'rgba(241,245,249,0.3)' }}>{new Date(p.created_at).toLocaleDateString()}</span>
                      <button onClick={async () => { await supabase.from('feed_posts').delete().eq('id', p.id); setPosts((prev: any[]) => prev.filter((x: any) => x.id !== p.id)); }} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.6)' }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAGES */}
          {tab === 'pages' && (
            <div>
              <div style={card}>
                <p style={{ fontSize:16, fontWeight:800, color:'#f1f5f9', marginBottom:16 }}>Site Pages</p>
                <p style={{ fontSize:12, color:'rgba(241,245,249,0.4)', marginBottom:16 }}>Up to 3 pages with top navigation (Home, Portfolio, Contact...)</p>
                {pages.map((page, idx) => (
                  <div key={page.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <div style={{ width:24, height:24, borderRadius:6, background:`${A}20`, border:`0.5px solid ${A}40`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color:A, flexShrink:0 }}>{idx+1}</div>
                    <input value={page.label} onChange={e => { setPages(prev => prev.map(p => p.id===page.id?{...p,label:e.target.value}:p)); dirty.current=true; }}
                      style={{ ...inp, marginBottom:0, flex:1 }} placeholder={idx===0?'Home':`Page ${idx+1}`} />
                    {idx > 0 && <button onClick={() => { setPages(prev => prev.filter(p => p.id!==page.id)); dirty.current=true; }} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.7)' }}><X size={15} /></button>}
                  </div>
                ))}
                {pages.length < 3 && (
                  <button onClick={() => { setPages(prev => [...prev, {id:`p_${Date.now()}`,label:`Page ${prev.length+1}`}]); dirty.current=true; }}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, border:`0.5px solid rgba(255,255,255,0.12)`, background:'transparent', color:'rgba(241,245,249,0.6)', cursor:'pointer', fontSize:13, fontWeight:600, marginTop:8 }}>
                    <Plus size={14} /> Add Page
                  </button>
                )}
              </div>

              {pages.map(page => (
                <div key={page.id} style={card}>
                  <p style={{ fontSize:14, fontWeight:800, color:'#f1f5f9', marginBottom:12 }}>✏️ {page.label}</p>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:'rgba(241,245,249,0.4)', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>Width:</span>
                    <input type="range" min={320} max={1200} value={pageWidth} onChange={e => { setPageWidth(Number(e.target.value)); dirty.current=true; }}
                      style={{ flex:1, accentColor:A }} />
                    <span style={{ fontSize:11, color:'rgba(241,245,249,0.4)', fontFamily:'monospace', whiteSpace:'nowrap' }}>{pageWidth}px</span>
                  </div>
                  <RichTextEditor
                    value={pageContents[page.id] || ''}
                    onChange={v => { setPageContents(prev => ({...prev, [page.id]:v})); dirty.current=true; }}
                    placeholder={`Write content for "${page.label}"...`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* VERIFY */}
          {tab === 'verify' && (
            <div style={card}>
              <p style={{ fontSize:16, fontWeight:800, color:'#f1f5f9', marginBottom:16 }}>Verify YouTube Channel</p>
              <p style={{ fontSize:13, color:'rgba(241,245,249,0.5)', marginBottom:16, lineHeight:1.6 }}>
                Add a link to <code style={{ color:A, background:`${A}15`, padding:'2px 6px', borderRadius:4 }}>{siteUrl || 'your mini site URL'}</code> in your YouTube channel description, then verify here to get the ✓ badge.
              </p>
              <p style={{ fontSize:12, color:'rgba(241,245,249,0.3)' }}>YouTube verification coming soon.</p>
            </div>
          )}
        </div>

        {/* Sidebar preview */}
        <div>
          <div style={{ background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:16, padding:16, position:'sticky', top:120 }}>
            <p style={{ fontSize:10, fontWeight:700, color:'rgba(241,245,249,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:12 }}>Live Preview</p>
            <div style={{ borderRadius:14, overflow:'hidden', border:'0.5px solid rgba(255,255,255,0.08)', background:currentTheme.bg }}>
              {bannerUrl && (
                <div style={{ width:'100%', height:60, overflow:'hidden', position:'relative' }}>
                  <img src={bannerUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  <div style={{ position:'absolute', inset:0, background:`linear-gradient(to bottom,transparent,${currentTheme.bg})` }} />
                </div>
              )}
              <div style={{ padding: bannerUrl?'0 12px 12px':'14px 12px', textAlign:'center' }}>
                <div style={{ display:'inline-block', marginBottom:8, marginTop:bannerUrl?-20:0 }}>
                  {avatarUrl
                    ? <img src={avatarUrl} style={{ width:56, height:56, borderRadius:photoShape==='round'?'50%':8, objectFit:'cover', border:`2px solid ${accent}` }} />
                    : <div style={{ width:56, height:56, borderRadius:'50%', background:`${accent}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:900, color:accent }}>{(siteName||'?')[0]}</div>
                  }
                </div>
                <p style={{ fontSize:13, fontWeight:900, color:currentTheme.text, margin:'0 0 2px' }}>{siteName||'My Site'}</p>
                {bio && <p style={{ fontSize:10, color:currentTheme.text, opacity:0.5, margin:'0 0 8px' }}>{bio.slice(0,50)}{bio.length>50?'...':''}</p>}
                <div style={{ width:'100%', padding:'6px 8px', borderRadius:8, background:`${accent}20`, border:`0.5px solid ${accent}40`, fontSize:11, fontWeight:700, color:currentTheme.text, textAlign:'center' }}>🔗 Sample Link</div>
              </div>
              {slug && <p style={{ textAlign:'center', fontSize:9, color:currentTheme.text, opacity:0.25, padding:'0 0 8px', fontFamily:'monospace' }}>{slug}.trustbank.xyz</p>}
            </div>
            {siteUrl && (
              <Link href={`/s/${profile?.slug}`} target="_blank" style={{
                display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                padding:'10px', borderRadius:10, border:'0.5px solid rgba(255,255,255,0.1)',
                background:'transparent', color:'rgba(241,245,249,0.6)', textDecoration:'none',
                fontSize:13, fontWeight:600, marginTop:10,
              }}>
                <ExternalLink size={13} /> Open full site
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
