'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useSiteLinks, useSiteVideos, useFeedPosts } from '@/hooks/useMiniSite';
import { useLang } from '@/hooks/useLang';
import { supabase } from '@/lib/supabase';
import { slugPrice } from '@/lib/slug';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { Navbar } from '@/components/layout/Navbar';
import {
  Save, Eye, Upload, Plus, X, Loader2, Globe, Link2, Video,
  FileText, Image as Img, Shield, ExternalLink, Send, Trash2,
  Check, Palette, User, Zap, ChevronRight, Hash
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const A = '#818cf8';

// ─── 30 Themes ───────────────────────────────────────────────
const THEMES = [
  // Dark
  { id:'dark',     e:'🌑', label:'Dark',     bg:'#0a0a0f', text:'#f1f5f9', accent:'#818cf8' },
  { id:'midnight', e:'🌃', label:'Midnight', bg:'#050508', text:'#f1f5f9', accent:'#6366f1' },
  { id:'noir',     e:'⬛', label:'Noir',     bg:'#000000', text:'#ffffff', accent:'#ffffff' },
  { id:'ocean',    e:'🌊', label:'Ocean',    bg:'#030d1a', text:'#e0f2fe', accent:'#38bdf8' },
  { id:'forest',   e:'🌿', label:'Forest',   bg:'#030d06', text:'#dcfce7', accent:'#4ade80' },
  { id:'rose',     e:'🌹', label:'Rose',     bg:'#1a0010', text:'#ffe4e6', accent:'#fb7185' },
  { id:'gold',     e:'✨', label:'Gold',     bg:'#0c0900', text:'#fef3c7', accent:'#fde68a' },
  { id:'nebula',   e:'🔮', label:'Nebula',   bg:'#0d0520', text:'#f3e8ff', accent:'#a855f7' },
  { id:'ember',    e:'🔥', label:'Ember',    bg:'#1c0800', text:'#ffedd5', accent:'#f97316' },
  { id:'arctic',   e:'🧊', label:'Arctic',   bg:'#0a1628', text:'#e0f2fe', accent:'#7dd3fc' },
  { id:'matrix',   e:'💻', label:'Matrix',   bg:'#000800', text:'#00ff41', accent:'#00ff41' },
  { id:'crimson',  e:'🩸', label:'Crimson',  bg:'#1a0505', text:'#fecaca', accent:'#ef4444' },
  { id:'steel',    e:'🔩', label:'Steel',    bg:'#1a1f2e', text:'#c8d3e0', accent:'#94a3b8' },
  { id:'aurora',   e:'🌌', label:'Aurora',   bg:'#050218', text:'#e0e7ff', accent:'#818cf8' },
  { id:'hex',      e:'⬡',  label:'Hex',      bg:'#0f1923', text:'#e2e8f0', accent:'#06b6d4' },
  // Light
  { id:'white',    e:'🤍', label:'White',    bg:'#ffffff', text:'#0f172a', accent:'#6366f1' },
  { id:'ivory',    e:'📜', label:'Ivory',    bg:'#fafafa', text:'#18181b', accent:'#6366f1' },
  { id:'beige',    e:'🧈', label:'Beige',    bg:'#faf7f2', text:'#1c1917', accent:'#b45309' },
  { id:'sky',      e:'🩵', label:'Sky',      bg:'#f0f9ff', text:'#0c4a6e', accent:'#0ea5e9' },
  { id:'mint',     e:'🌱', label:'Mint',     bg:'#f0fdf4', text:'#14532d', accent:'#16a34a' },
  { id:'lavender', e:'💜', label:'Lavender', bg:'#faf5ff', text:'#4c1d95', accent:'#7c3aed' },
  { id:'peach',    e:'🍑', label:'Peach',    bg:'#fff7ed', text:'#7c2d12', accent:'#ea580c' },
  { id:'lemon',    e:'🍋', label:'Lemon',    bg:'#fefce8', text:'#713f12', accent:'#ca8a04' },
  { id:'blush',    e:'🌸', label:'Blush',    bg:'#fdf2f8', text:'#831843', accent:'#db2777' },
  { id:'paper',    e:'📄', label:'Paper',    bg:'#faf8f4', text:'#3d2b1f', accent:'#92400e' },
  { id:'sand',     e:'🏖️', label:'Sand',     bg:'#fdf4e7', text:'#44260a', accent:'#d97706' },
  { id:'cloud',    e:'☁️', label:'Cloud',    bg:'#f8f9ff', text:'#1e3a5f', accent:'#3b82f6' },
  { id:'nordic',   e:'🇸🇪', label:'Nordic',  bg:'#f5f5f0', text:'#2d2d2a', accent:'#4b7bb5' },
  { id:'sakura',   e:'🌺', label:'Sakura',   bg:'#fff1f5', text:'#4a1530', accent:'#e11d79' },
  { id:'cream',    e:'🍦', label:'Cream',    bg:'#fdf6e3', text:'#3b2f1e', accent:'#b45309' },
];

const ACCENT_COLORS = [
  '#818cf8','#6366f1','#8b5cf6','#a855f7','#ec4899','#f43f5e',
  '#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#10b981',
  '#14b8a6','#06b6d4','#0ea5e9','#3b82f6','#ffffff','#000000',
];

const TEXT_COLORS = [
  '', '#f1f5f9','#ffffff','#fef3c7','#dcfce7','#e0f2fe',
  '#f3e8ff','#ffe4e6','#0f172a','#1c1917',
];

function extractYouTubeId(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? m[1] : null;
}

export default function EditorPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, update: save } = useProfile(user);
  const { links, addLink, deleteLink } = useSiteLinks(profile?.id);
  const { videos, addVideo, deleteVideo } = useSiteVideos(profile?.id);
  const { posts: feedPosts, addPost } = useFeedPosts(profile?.id);
  const { t } = useLang();
  const router = useRouter();
  const dirty = useRef(false);

  // Profile
  const [siteName, setSiteName]     = useState('');
  const [bio, setBio]               = useState('');
  const [avatarUrl, setAvatarUrl]   = useState('');
  const [bannerUrl, setBannerUrl]   = useState('');
  const [walletAddr, setWalletAddr] = useState('');
  const [contactEmail, setEmail]    = useState('');
  const [published, setPublished]   = useState(false);

  // Theme
  const [theme, setTheme]       = useState('dark');
  const [accent, setAccent]     = useState('#818cf8');
  const [photoShape, setShape]  = useState('round');
  const [photoSize, setSize]    = useState<'sm'|'md'|'lg'|'xl'>('md');
  const [fontStyle, setFont]    = useState('sans');
  const [textColor, setTColor]  = useState('');

  // Pages
  const [pages, setPages]           = useState<{id:string;label:string}[]>([{id:'home',label:'Home'}]);
  const [pageContents, setContents] = useState<Record<string,string>>({});
  const [pageWidth, setWidth]       = useState(680);

  // CV
  const [showCv, setShowCv]     = useState(false);
  const [cvLocked, setCvLock]   = useState(false);
  const [cvPrice, setCvPrice]   = useState('20');
  const [cvHeadline, setCvHead] = useState('');
  const [cvLocation, setCvLoc]  = useState('');
  const [cvContent, setCvBody]  = useState('');

  // Feed
  const [showFeed, setShowFeed] = useState(true);
  const [feedText, setFeedText] = useState('');
  const [posting, setPosting]   = useState(false);
  const [posts, setPosts]       = useState<any[]>([]);

  // Links form
  const [linkTitle, setLTitle] = useState('');
  const [linkUrl, setLUrl]     = useState('');
  const [linkColor, setLColor] = useState('');

  // Video form
  const [ytUrl, setYtUrl]       = useState('');
  const [ytTitle, setYtTitle]   = useState('');
  const [paywallOn, setPaywall] = useState(false);
  const [paywallAmt, setPayAmt] = useState('4.99');

  // UI
  const [tab, setTab]       = useState('profile');
  const [saving, setSaving] = useState(false);
  const [savedOk, setSaved] = useState(false);
  const [upAvatar, setUpA]  = useState(false);
  const [upBanner, setUpB]  = useState(false);

  useEffect(() => { setPosts(feedPosts); }, [feedPosts]);

  useEffect(() => {
    if (!profile) return;
    setSiteName(profile.site_name || '');
    setBio(profile.bio || '');
    setAvatarUrl(profile.avatar_url || '');
    setBannerUrl((profile as any).banner_url || '');
    setWalletAddr((profile as any).wallet_address || '');
    setEmail((profile as any).contact_email || '');
    setPublished(profile.published || false);
    setTheme(profile.theme || 'dark');
    setAccent(profile.accent_color || '#818cf8');
    setShape(profile.photo_shape || 'round');
    setSize(((profile as any).photo_size || 'md') as any);
    setFont((profile as any).font_style || 'sans');
    setTColor((profile as any).text_color || '');
    setShowCv(profile.show_cv || false);
    setCvLock(profile.cv_locked || false);
    setCvPrice(String(profile.cv_price || 20));
    setCvHead(profile.cv_headline || '');
    setCvLoc((profile as any).cv_location || '');
    setCvBody(profile.cv_content || '');
    setShowFeed((profile as any).show_feed !== false);
    try { setPages(JSON.parse((profile as any).site_pages || '[]') || [{id:'home',label:'Home'}]); } catch {}
    try { setContents(JSON.parse((profile as any).page_contents || '{}')); } catch {}
    if ((profile as any).page_width) setWidth((profile as any).page_width);
  }, [profile]);

  const upload = async (file: File, folder: string) => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user!.id}/${folder}/${Date.now()}.${ext}`;
    await supabase.storage.from('platform-assets').upload(path, file, { upsert: true });
    return supabase.storage.from('platform-assets').getPublicUrl(path).data.publicUrl;
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    await save({
      site_name: siteName, bio, avatar_url: avatarUrl, banner_url: bannerUrl,
      theme, accent_color: accent, photo_shape: photoShape,
      photo_size: photoSize, font_style: fontStyle, text_color: textColor || null,
      show_cv: showCv, cv_locked: cvLocked, cv_price: parseFloat(cvPrice) || 20,
      cv_headline: cvHeadline, cv_content: cvBody, cv_location: cvLoc,
      show_feed: showFeed, wallet_address: walletAddr, contact_email: contactEmail,
      published, site_pages: JSON.stringify(pages.length ? pages : [{id:'home',label:'Home'}]),
      page_contents: JSON.stringify(pageContents), page_width: pageWidth, platform: 'trustbank',
    } as any);
    dirty.current = false;
    setSaved(true); setTimeout(() => setSaved(false), 2500);
    setSaving(false);
  };

  if (authLoading || profileLoading) return (
    <div style={{ minHeight:'100vh', background:'#0d1117', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Loader2 size={32} color={A} className="animate-spin" />
    </div>
  );

  if (!user) { router.push('/login'); return null; }

  const slug = profile?.slug || '';
  const siteUrl = slug ? `/s/${slug}` : null;
  const curTheme = THEMES.find(th => th.id === theme) || THEMES[0];
  const photoSizePx = { sm:56, md:80, lg:112, xl:148 }[photoSize] || 80;
  const fontFam = fontStyle === 'serif' ? 'Georgia,serif' : fontStyle === 'mono' ? "'JetBrains Mono',monospace" : "'Plus Jakarta Sans',system-ui,sans-serif";

  // ─── Styles ────────────────────────────────────────────────
  const inp: any = { width:'100%', padding:'10px 14px', borderRadius:10, border:'0.5px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.06)', color:'#f1f5f9', fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit' };
  const inpW: any = { ...inp, background:'white', color:'#111827' };
  const lbl: any = { fontSize:11, fontWeight:700, color:'rgba(241,245,249,0.4)', textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:6 };
  const card: any = { background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:18, padding:22, marginBottom:14 };
  const tog = (on: boolean): any => ({ width:44, height:24, borderRadius:12, background:on?A:'rgba(255,255,255,0.12)', border:'none', cursor:'pointer', position:'relative', transition:'all 0.2s', flexShrink:0 });
  const dot = (on: boolean): any => ({ position:'absolute', top:4, width:16, height:16, borderRadius:'50%', background:'white', transition:'all 0.2s', left: on?24:4 });
  const pill = (active: boolean): any => ({ padding:'7px 14px', borderRadius:8, border:`0.5px solid ${active?A:'rgba(255,255,255,0.1)'}`, background:active?`${A}15`:'transparent', color:active?A:'rgba(241,245,249,0.5)', cursor:'pointer', fontSize:13, fontWeight:600, transition:'all 0.15s' });

  const TABS = [
    { id:'profile', icon:User,    label:'Profile' },
    { id:'theme',   icon:Palette, label:'Theme'   },
    { id:'links',   icon:Link2,   label:'Links'   },
    { id:'videos',  icon:Video,   label:'Videos'  },
    { id:'cv',      icon:FileText,label:'CV'      },
    { id:'feed',    icon:Hash,    label:'Feed'    },
    { id:'pages',   icon:Img,     label:'Pages'   },
    { id:'verify',  icon:Shield,  label:'Verify'  },
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#0d1117', color:'#f1f5f9', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <Navbar />

      {/* Top bar */}
      <div style={{ position:'sticky', top:60, zIndex:40, background:'rgba(13,17,23,0.97)', backdropFilter:'blur(20px)', borderBottom:'0.5px solid rgba(255,255,255,0.07)' }}>
        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 20px', display:'flex', alignItems:'center', height:50, gap:2 }}>
          {TABS.map(tb => (
            <button key={tb.id} onClick={() => setTab(tb.id)} style={{
              display:'flex', alignItems:'center', gap:5, padding:'5px 11px', borderRadius:7,
              border:'none', background:tab===tb.id?`${A}18`:'transparent',
              color:tab===tb.id?A:'rgba(241,245,249,0.4)', cursor:'pointer', fontSize:12, fontWeight:600, whiteSpace:'nowrap',
            }}>
              <tb.icon size={13} /> {tb.label}
            </button>
          ))}
          <div style={{ flex:1 }} />
          <div style={{ display:'flex', gap:6, flexShrink:0 }}>
            {siteUrl && (
              <Link href={siteUrl} target="_blank" style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, border:'0.5px solid rgba(255,255,255,0.1)', color:'#4ade80', textDecoration:'none', fontSize:12, fontWeight:600 }}>
                <Eye size={13} /> Preview
              </Link>
            )}
            <button onClick={handleSave} disabled={saving} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 14px', borderRadius:8, border:'none', background:savedOk?'#4ade8020':A, color:savedOk?'#4ade80':'#fff', cursor:'pointer', fontSize:12, fontWeight:700 }}>
              {saving ? <Loader2 size={13} className="animate-spin" /> : savedOk ? <Check size={13} /> : <Save size={13} />}
              {saving ? 'Saving…' : savedOk ? 'Saved!' : 'Save'}
            </button>
            <button onClick={async () => { setPublished(true); await save({ published:true } as any); }} style={{ padding:'6px 14px', borderRadius:8, border:'none', cursor:'pointer', background:published?'rgba(74,222,128,0.12)':'linear-gradient(135deg,#f59e0b,#d97706)', color:published?'#4ade80':'#fff', fontSize:12, fontWeight:800 }}>
              {published ? '✓ Live' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:'0 auto', padding:'24px 20px', display:'grid', gridTemplateColumns:'1fr 280px', gap:20 }}>
        {/* ── Main ── */}
        <div>

          {/* PROFILE */}
          {tab === 'profile' && (
            <div style={card}>
              <p style={{ fontSize:15, fontWeight:800, color:'#f1f5f9', marginBottom:18 }}>Profile</p>

              {/* Avatar + Banner row */}
              <div style={{ display:'flex', gap:14, marginBottom:18, alignItems:'flex-start' }}>
                {/* Avatar */}
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ width:72, height:72, borderRadius:photoShape==='round'?'50%':photoShape==='square'?8:20, overflow:'hidden', background:`${accent}25`, border:`2px solid ${accent}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:900, color:accent }}>
                    {avatarUrl ? <img src={avatarUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }} /> : (siteName||'?')[0]}
                  </div>
                  <label style={{ position:'absolute', bottom:-6, right:-6, width:24, height:24, borderRadius:'50%', background:A, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                    {upAvatar ? <Loader2 size={12} color="#fff" /> : <Upload size={12} color="#fff" />}
                    <input type="file" accept="image/*" style={{ display:'none' }} onChange={async e => {
                      const f = e.target.files?.[0]; if (!f) return;
                      setUpA(true); const url = await upload(f,'avatars'); setAvatarUrl(url); dirty.current=true; setUpA(false);
                    }} />
                  </label>
                </div>
                {/* Right side */}
                <div style={{ flex:1 }}>
                  <label style={lbl}>Display Name</label>
                  <input value={siteName} onChange={e=>{setSiteName(e.target.value);dirty.current=true;}} style={{ ...inpW, marginBottom:10 }} placeholder="Your Name" />
                  <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', padding:'9px 12px', borderRadius:10, border:'0.5px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', fontSize:13 }}>
                    {upBanner ? <Loader2 size={14} color={A} /> : <Upload size={14} color={A} />}
                    <span style={{ color:'rgba(241,245,249,0.6)' }}>{bannerUrl ? '✓ Banner uploaded · click to change' : 'Upload Banner Image'}</span>
                    <input type="file" accept="image/*" style={{ display:'none' }} onChange={async e => {
                      const f = e.target.files?.[0]; if (!f) return;
                      setUpB(true); const url = await upload(f,'banners'); setBannerUrl(url); dirty.current=true; setUpB(false);
                    }} />
                  </label>
                  {bannerUrl && <button onClick={()=>{setBannerUrl('');dirty.current=true;}} style={{ fontSize:11, color:'#ef4444', background:'none', border:'none', cursor:'pointer', marginTop:4 }}>Remove banner</button>}
                </div>
              </div>

              <label style={lbl}>Bio</label>
              <textarea value={bio} onChange={e=>{setBio(e.target.value);dirty.current=true;}} style={{ ...inpW, resize:'vertical', minHeight:72, marginBottom:12 }} placeholder="Short description…" />

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
                <div>
                  <label style={lbl}>Polygon Wallet</label>
                  <input value={walletAddr} onChange={e=>{setWalletAddr(e.target.value);dirty.current=true;}} style={{ ...inpW, fontFamily:"'JetBrains Mono',monospace" }} placeholder="0x…" />
                </div>
                <div>
                  <label style={lbl}>Contact Email</label>
                  <input value={contactEmail} onChange={e=>{setEmail(e.target.value);dirty.current=true;}} type="email" style={inpW} placeholder="you@email.com" />
                </div>
              </div>

              <label style={lbl}>Your Slug</label>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <input value={slug} readOnly style={{ ...inpW, fontFamily:"'JetBrains Mono',monospace", flex:1, opacity:0.7, cursor:'not-allowed' }} />
                <span style={{ fontSize:13, color:A, fontWeight:700, whiteSpace:'nowrap' }}>.trustbank.xyz</span>
              </div>
              <p style={{ fontSize:11, color:'rgba(241,245,249,0.3)', marginTop:4 }}>To change your slug, go to your Vault</p>
            </div>
          )}

          {/* THEME */}
          {tab === 'theme' && (
            <div>
              <div style={card}>
                <p style={{ fontSize:15, fontWeight:800, color:'#f1f5f9', marginBottom:4 }}>Theme — {THEMES.find(t=>t.id===theme)?.label}</p>
                <p style={{ fontSize:12, color:'rgba(241,245,249,0.4)', marginBottom:16 }}>15 dark + 15 light themes</p>

                {/* Dark themes */}
                <p style={{ fontSize:10, fontWeight:700, color:'rgba(241,245,249,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Dark</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6, marginBottom:14 }}>
                  {THEMES.slice(0,15).map(th => (
                    <button key={th.id} onClick={()=>{setTheme(th.id);setAccent(th.accent);dirty.current=true;}} style={{
                      borderRadius:10, overflow:'hidden', border:theme===th.id?`2px solid white`:'1.5px solid rgba(255,255,255,0.08)',
                      cursor:'pointer', background:th.bg, padding:0, transition:'all 0.15s',
                      boxShadow:theme===th.id?`0 0 12px ${th.accent}60`:'none',
                    }}>
                      <div style={{ padding:'10px 8px 6px' }}>
                        <div style={{ width:16, height:16, borderRadius:'50%', background:th.accent, margin:'0 auto 5px' }} />
                        <div style={{ height:2, background:th.text, opacity:0.4, borderRadius:2, marginBottom:3 }} />
                        <div style={{ height:5, background:th.accent, opacity:0.7, borderRadius:2 }} />
                      </div>
                      <p style={{ fontSize:9, fontWeight:700, color:th.text, textAlign:'center', padding:'0 2px 6px', margin:0 }}>{th.e} {th.label}</p>
                    </button>
                  ))}
                </div>

                {/* Light themes */}
                <p style={{ fontSize:10, fontWeight:700, color:'rgba(241,245,249,0.3)', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>Light</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6 }}>
                  {THEMES.slice(15).map(th => (
                    <button key={th.id} onClick={()=>{setTheme(th.id);setAccent(th.accent);dirty.current=true;}} style={{
                      borderRadius:10, overflow:'hidden', border:theme===th.id?`2px solid ${th.accent}`:'1.5px solid rgba(0,0,0,0.08)',
                      cursor:'pointer', background:th.bg, padding:0, transition:'all 0.15s',
                      boxShadow:theme===th.id?`0 0 12px ${th.accent}40`:'none',
                    }}>
                      <div style={{ padding:'10px 8px 6px' }}>
                        <div style={{ width:16, height:16, borderRadius:'50%', background:th.accent, margin:'0 auto 5px' }} />
                        <div style={{ height:2, background:th.text, opacity:0.4, borderRadius:2, marginBottom:3 }} />
                        <div style={{ height:5, background:th.accent, opacity:0.7, borderRadius:2 }} />
                      </div>
                      <p style={{ fontSize:9, fontWeight:700, color:th.text, textAlign:'center', padding:'0 2px 6px', margin:0 }}>{th.e} {th.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent color */}
              <div style={card}>
                <p style={{ fontSize:13, fontWeight:800, color:'#f1f5f9', marginBottom:12 }}>Accent Color</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:8, alignItems:'center' }}>
                  {ACCENT_COLORS.map(col => (
                    <button key={col} onClick={()=>{setAccent(col);dirty.current=true;}} style={{ width:30, height:30, borderRadius:'50%', background:col, border:accent===col?'3px solid white':'1.5px solid rgba(255,255,255,0.15)', cursor:'pointer', flexShrink:0, boxShadow:col==='#ffffff'?'0 0 0 1px rgba(0,0,0,0.2)':'none' }} />
                  ))}
                  <input type="color" value={accent} onChange={e=>{setAccent(e.target.value);dirty.current=true;}} style={{ width:30, height:30, borderRadius:'50%', border:'1.5px solid rgba(255,255,255,0.2)', cursor:'pointer', padding:0 }} />
                </div>
              </div>

              {/* Photo shape & size */}
              <div style={card}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div>
                    <p style={{ fontSize:13, fontWeight:800, color:'#f1f5f9', marginBottom:10 }}>Photo Shape</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {[['round','● Round'],['rounded','▢ Rounded'],['square','■ Square']].map(([v,l]) => (
                        <button key={v} onClick={()=>{setShape(v);dirty.current=true;}} style={{ ...pill(photoShape===v), textAlign:'left' }}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:800, color:'#f1f5f9', marginBottom:10 }}>Photo Size</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {([['sm','Small · 56px'],['md','Medium · 80px'],['lg','Large · 112px'],['xl','XL · 148px']] as const).map(([v,l]) => (
                        <button key={v} onClick={()=>{setSize(v);dirty.current=true;}} style={{ ...pill(photoSize===v), textAlign:'left' }}>{l}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Font & Text color */}
              <div style={card}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div>
                    <p style={{ fontSize:13, fontWeight:800, color:'#f1f5f9', marginBottom:10 }}>Font Style</p>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {[['sans','Modern Sans'],['serif','Classic Serif'],['mono','Monospace']].map(([v,l]) => (
                        <button key={v} onClick={()=>{setFont(v);dirty.current=true;}} style={{ ...pill(fontStyle===v), textAlign:'left', fontFamily:v==='serif'?'Georgia,serif':v==='mono'?"'JetBrains Mono',monospace":'inherit' }}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p style={{ fontSize:13, fontWeight:800, color:'#f1f5f9', marginBottom:10 }}>Text Color</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                      {TEXT_COLORS.map(col => (
                        <button key={col||'auto'} onClick={()=>{setTColor(col);dirty.current=true;}} title={col||'Auto'} style={{
                          width:28, height:28, borderRadius:'50%', cursor:'pointer',
                          background:col||`conic-gradient(${ACCENT_COLORS.slice(0,6).join(',')})`,
                          border:textColor===col?'3px solid white':'1.5px solid rgba(255,255,255,0.2)',
                          boxShadow:col==='#ffffff'?'inset 0 0 0 1px rgba(0,0,0,0.2)':'none',
                        }} />
                      ))}
                    </div>
                    {textColor && <button onClick={()=>{setTColor('');dirty.current=true;}} style={{ fontSize:11, color:A, background:'none', border:'none', cursor:'pointer', marginTop:8, fontWeight:700 }}>↩ Reset to theme default</button>}
                    <p style={{ fontSize:10, color:'rgba(241,245,249,0.3)', marginTop:6 }}>Overrides theme text color</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* LINKS */}
          {tab === 'links' && (
            <div style={card}>
              <p style={{ fontSize:15, fontWeight:800, color:'#f1f5f9', marginBottom:18 }}>Links & Social</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr auto', gap:8, alignItems:'end', marginBottom:12 }}>
                <div>
                  <label style={lbl}>Title</label>
                  <input value={linkTitle} onChange={e=>setLTitle(e.target.value)} style={inpW} placeholder="My Instagram" />
                </div>
                <div>
                  <label style={lbl}>URL</label>
                  <input value={linkUrl} onChange={e=>setLUrl(e.target.value)} style={inpW} placeholder="https://…" />
                </div>
                <div>
                  <label style={lbl}>Color</label>
                  <input type="color" value={linkColor||'#818cf8'} onChange={e=>setLColor(e.target.value)} style={{ width:44, height:42, borderRadius:10, border:'0.5px solid rgba(255,255,255,0.1)', cursor:'pointer', padding:2, background:'transparent' }} />
                </div>
              </div>
              <button onClick={async()=>{
                if(!linkTitle||!linkUrl||!profile?.id)return;
                await addLink({title:linkTitle,url:linkUrl,icon:'link',color:linkColor||null,sort_order:links.length});
                setLTitle('');setLUrl('');setLColor('');
              }} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:10, border:'none', background:A, color:'#fff', cursor:'pointer', fontWeight:700, fontSize:13, marginBottom:16 }}>
                <Plus size={14}/> Add Link
              </button>
              {links.map((l:any)=>(
                <div key={l.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:12, background:`${l.color||A}08`, border:`0.5px solid ${l.color||A}25`, marginBottom:6 }}>
                  <div style={{ width:10, height:10, borderRadius:'50%', background:l.color||A, flexShrink:0 }} />
                  <span style={{ flex:1, fontSize:14, fontWeight:700, color:'#f1f5f9' }}>{l.title}</span>
                  <span style={{ fontSize:11, color:'rgba(241,245,249,0.35)', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.url}</span>
                  <button onClick={()=>deleteLink(l.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.6)' }}><X size={14}/></button>
                </div>
              ))}
              {links.length===0 && <p style={{ textAlign:'center', padding:'24px 0', color:'rgba(241,245,249,0.25)', fontSize:13 }}>No links yet</p>}
            </div>
          )}

          {/* VIDEOS */}
          {tab === 'videos' && (
            <div style={card}>
              <p style={{ fontSize:15, fontWeight:800, color:'#f1f5f9', marginBottom:18 }}>YouTube Videos</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                <div>
                  <label style={lbl}>YouTube URL</label>
                  <input value={ytUrl} onChange={e=>setYtUrl(e.target.value)} style={inpW} placeholder="https://youtube.com/watch?v=…" />
                </div>
                <div>
                  <label style={lbl}>Title</label>
                  <input value={ytTitle} onChange={e=>setYtTitle(e.target.value)} style={inpW} placeholder="My video" />
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'11px 14px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', marginBottom:8 }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', margin:0 }}>Paywall</p>
                  <p style={{ fontSize:11, color:'rgba(241,245,249,0.4)', margin:'2px 0 0' }}>Fans pay USDC · you keep 70%</p>
                </div>
                <button onClick={()=>setPaywall(p=>!p)} style={tog(paywallOn)}><div style={dot(paywallOn)}/></button>
              </div>
              {paywallOn && <>
                <label style={lbl}>Price (USDC)</label>
                <input value={paywallAmt} onChange={e=>setPayAmt(e.target.value)} type="number" step="0.01" min="0.5" style={{ ...inpW, marginBottom:10 }} />
              </>}
              <button onClick={async()=>{
                if(!ytUrl||!profile?.id)return;
                const ytId=extractYouTubeId(ytUrl);
                if(!ytId){alert('Invalid YouTube URL');return;}
                await addVideo({youtube_video_id:ytId,title:ytTitle||'Video',paywall_enabled:paywallOn,paywall_price:parseFloat(paywallAmt)||4.99,sort_order:videos.length});
                setYtUrl('');setYtTitle('');
              }} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 16px', borderRadius:10, border:'none', background:A, color:'#fff', cursor:'pointer', fontWeight:700, fontSize:13, marginBottom:16 }}>
                <Plus size={14}/> Add Video
              </button>
              {videos.map((v:any)=>(
                <div key={v.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', marginBottom:6 }}>
                  {v.youtube_video_id&&<img src={`https://img.youtube.com/vi/${v.youtube_video_id}/default.jpg`} style={{ width:52,height:36,objectFit:'cover',borderRadius:6,flexShrink:0 }} />}
                  <span style={{ flex:1, fontSize:13, fontWeight:600, color:'#f1f5f9' }}>{v.title}</span>
                  {v.paywall_enabled&&<span style={{ fontSize:11, color:'#f59e0b', fontWeight:700 }}>🔒 ${v.paywall_price}</span>}
                  <button onClick={()=>deleteVideo(v.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.6)' }}><X size={14}/></button>
                </div>
              ))}
            </div>
          )}

          {/* CV */}
          {tab === 'cv' && (
            <div style={card}>
              <p style={{ fontSize:15, fontWeight:800, color:'#f1f5f9', marginBottom:16 }}>CV / Resume</p>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 14px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', marginBottom:10 }}>
                <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', margin:0 }}>Show CV on site</p>
                <button onClick={()=>{setShowCv(p=>!p);dirty.current=true;}} style={tog(showCv)}><div style={dot(showCv)}/></button>
              </div>
              {showCv && <>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'11px 14px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'0.5px solid rgba(255,255,255,0.08)', marginBottom:10 }}>
                  <div><p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', margin:0 }}>Lock · pay to unlock</p><p style={{ fontSize:11, color:'rgba(241,245,249,0.4)', margin:'2px 0 0' }}>Companies pay · you get 50%</p></div>
                  <button onClick={()=>{setCvLock(p=>!p);dirty.current=true;}} style={tog(cvLocked)}><div style={dot(cvLocked)}/></button>
                </div>
                {cvLocked&&<><label style={lbl}>Price (USDC)</label><input value={cvPrice} onChange={e=>{setCvPrice(e.target.value);dirty.current=true;}} type="number" min="1" style={{ ...inpW, marginBottom:10 }} /></>}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10 }}>
                  <div><label style={lbl}>Headline</label><input value={cvHeadline} onChange={e=>{setCvHead(e.target.value);dirty.current=true;}} style={inpW} placeholder="Senior Dev at Acme" /></div>
                  <div><label style={lbl}>Location</label><input value={cvLoc} onChange={e=>{setCvLoc(e.target.value);dirty.current=true;}} style={inpW} placeholder="São Paulo · Remote" /></div>
                </div>
                <label style={lbl}>Resume Content</label>
                <textarea value={cvBody} onChange={e=>{setCvBody(e.target.value);dirty.current=true;}} style={{ ...inpW, resize:'vertical', minHeight:140 }} placeholder="Experience, education, skills…" />
              </>}
            </div>
          )}

          {/* FEED */}
          {tab === 'feed' && (
            <div>
              <div style={card}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <p style={{ fontSize:15, fontWeight:800, color:'#f1f5f9', margin:0 }}>Feed (7-day posts)</p>
                  <button onClick={()=>{setShowFeed(p=>!p);dirty.current=true;}} style={tog(showFeed)}><div style={dot(showFeed)}/></button>
                </div>
                <p style={{ fontSize:12, color:'rgba(241,245,249,0.4)', marginTop:6, marginBottom:0 }}>Posts expire in 7 days · Pin for $10 USDC · shown in 500×500 window</p>
              </div>
              <div style={card}>
                <p style={{ fontSize:13, fontWeight:800, color:'#f1f5f9', marginBottom:10 }}>✍️ New Post</p>
                <textarea value={feedText} onChange={e=>setFeedText(e.target.value)} placeholder="What do you want to share?" style={{ ...inpW, resize:'vertical', minHeight:80, marginBottom:10 }} />
                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                  <button onClick={async()=>{
                    if(!feedText.trim()||!profile?.id)return;
                    setPosting(true);
                    const exp=new Date(Date.now()+7*86400000).toISOString();
                    await addPost({text:feedText,pinned:false,expires_at:exp});
                    setFeedText('');setPosting(false);
                  }} disabled={!feedText.trim()||posting} style={{ display:'flex', alignItems:'center', gap:6, padding:'9px 18px', borderRadius:9, border:'none', background:feedText.trim()?A:'rgba(255,255,255,0.08)', color:'#fff', cursor:feedText.trim()?'pointer':'not-allowed', fontWeight:700, fontSize:13 }}>
                    {posting?<Loader2 size={14} className="animate-spin"/>:<Send size={14}/>} Publish
                  </button>
                </div>
              </div>
              <div style={card}>
                <p style={{ fontSize:11, fontWeight:700, color:'rgba(241,245,249,0.4)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:12 }}>Posts ({posts.length})</p>
                {posts.length===0&&<p style={{ textAlign:'center', padding:'20px 0', color:'rgba(241,245,249,0.25)', fontSize:13 }}>No posts yet</p>}
                {posts.map((p:any)=>(
                  <div key={p.id} style={{ padding:'11px 14px', borderRadius:10, background:p.pinned?`${A}08`:'rgba(255,255,255,0.04)', border:`0.5px solid ${p.pinned?A+'30':'rgba(255,255,255,0.08)'}`, marginBottom:8 }}>
                    {p.pinned&&<p style={{ fontSize:10, color:A, fontWeight:700, marginBottom:4 }}>📌 PINNED</p>}
                    <p style={{ fontSize:13, color:'#f1f5f9', margin:0, whiteSpace:'pre-wrap' }}>{p.text}</p>
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:8, paddingTop:6, borderTop:'0.5px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontSize:10, color:'rgba(241,245,249,0.3)' }}>{new Date(p.created_at).toLocaleDateString()} · expires {new Date(p.expires_at).toLocaleDateString()}</span>
                      <button onClick={async()=>{await supabase.from('feed_posts').delete().eq('id',p.id);setPosts(prev=>prev.filter((x:any)=>x.id!==p.id));}} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.6)' }}><Trash2 size={12}/></button>
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
                <p style={{ fontSize:15, fontWeight:800, color:'#f1f5f9', marginBottom:8 }}>Site Pages</p>
                <p style={{ fontSize:12, color:'rgba(241,245,249,0.4)', marginBottom:14 }}>Up to 3 pages · shown as top nav on your mini site</p>
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
                  {pages.map((pg,idx)=>(
                    <div key={pg.id} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:22, height:22, borderRadius:6, background:`${A}18`, border:`0.5px solid ${A}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:900, color:A, flexShrink:0 }}>{idx+1}</div>
                      <input value={pg.label} onChange={e=>{setPages(prev=>prev.map(p=>p.id===pg.id?{...p,label:e.target.value}:p));dirty.current=true;}} style={{ ...inpW, marginBottom:0, flex:1 }} placeholder={idx===0?'Home':`Page ${idx+1}`} />
                      {idx>0&&<button onClick={()=>{setPages(prev=>prev.filter(p=>p.id!==pg.id));dirty.current=true;}} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.6)' }}><X size={14}/></button>}
                    </div>
                  ))}
                </div>
                {pages.length<3&&<button onClick={()=>{setPages(prev=>[...prev,{id:`p_${Date.now()}`,label:`Page ${prev.length+1}`}]);dirty.current=true;}} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:8, border:'0.5px solid rgba(255,255,255,0.12)', background:'transparent', color:'rgba(241,245,249,0.5)', cursor:'pointer', fontSize:13, fontWeight:600 }}>
                  <Plus size={13}/> Add Page
                </button>}
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, padding:'10px 14px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.07)' }}>
                <span style={{ fontSize:12, fontWeight:700, color:'rgba(241,245,249,0.4)' }}>Page width:</span>
                <input type="range" min={320} max={1200} value={pageWidth} onChange={e=>{setWidth(Number(e.target.value));dirty.current=true;}} style={{ flex:1, accentColor:A }} />
                <span style={{ fontSize:12, fontFamily:'monospace', color:A, minWidth:50 }}>{pageWidth}px</span>
              </div>

              {pages.map(pg=>(
                <div key={pg.id} style={{ ...card, marginBottom:14 }}>
                  <p style={{ fontSize:14, fontWeight:800, color:'#f1f5f9', marginBottom:12 }}>✏️ {pg.label}</p>
                  <RichTextEditor value={pageContents[pg.id]||''} onChange={v=>{setContents(prev=>({...prev,[pg.id]:v}));dirty.current=true;}} placeholder={`Content for "${pg.label}"…`} />
                </div>
              ))}
            </div>
          )}

          {/* VERIFY */}
          {tab === 'verify' && (
            <div style={card}>
              <p style={{ fontSize:15, fontWeight:800, color:'#f1f5f9', marginBottom:12 }}>YouTube Verification</p>
              <p style={{ fontSize:13, color:'rgba(241,245,249,0.5)', lineHeight:1.7, marginBottom:12 }}>
                Add a link to <code style={{ color:A, background:`${A}12`, padding:'2px 6px', borderRadius:4 }}>{siteUrl ? `trustbank.xyz/s/${slug}` : 'your site URL'}</code> in your YouTube channel description, then click verify.
              </p>
              <div style={{ padding:'14px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.08)', fontSize:12, color:'rgba(241,245,249,0.4)' }}>
                YouTube verification — coming soon
              </div>
            </div>
          )}

        </div>

        {/* ── Sidebar Preview ── */}
        <div>
          <div style={{ position:'sticky', top:120, borderRadius:18, background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.07)', padding:14 }}>
            <p style={{ fontSize:9, fontWeight:700, color:'rgba(241,245,249,0.25)', textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:10 }}>Live Preview</p>
            <div style={{ borderRadius:14, overflow:'hidden', border:'0.5px solid rgba(255,255,255,0.07)', background:curTheme.bg, minHeight:200 }}>
              {bannerUrl && (
                <div style={{ width:'100%', height:52, overflow:'hidden', position:'relative' }}>
                  <img src={bannerUrl} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  <div style={{ position:'absolute', inset:0, background:`linear-gradient(to bottom,transparent,${curTheme.bg})` }} />
                </div>
              )}
              <div style={{ padding:bannerUrl?'0 12px 14px':'14px 12px', textAlign:'center' }}>
                <div style={{ display:'inline-block', marginBottom:8, marginTop:bannerUrl?-Math.min(photoSizePx/2,28):0 }}>
                  {avatarUrl
                    ? <img src={avatarUrl} style={{ width:Math.min(photoSizePx,64), height:Math.min(photoSizePx,64), borderRadius:photoShape==='round'?'50%':photoShape==='square'?6:14, objectFit:'cover', border:`2px solid ${accent}` }} />
                    : <div style={{ width:Math.min(photoSizePx,64), height:Math.min(photoSizePx,64), borderRadius:'50%', background:`${accent}25`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:900, color:accent }}>{(siteName||'?')[0]}</div>
                  }
                </div>
                <p style={{ fontSize:13, fontWeight:900, color:textColor||curTheme.text, margin:'0 0 3px', fontFamily:fontFam }}>{siteName||'My Site'}</p>
                {bio&&<p style={{ fontSize:10, color:curTheme.text, opacity:0.6, margin:'0 0 10px', lineHeight:1.4, fontFamily:fontFam }}>{bio.slice(0,60)}</p>}
                <div style={{ padding:'8px 10px', borderRadius:9, background:`${accent}18`, border:`0.5px solid ${accent}30`, fontSize:11, fontWeight:700, color:curTheme.text, fontFamily:fontFam }}>🔗 Sample Link</div>
              </div>
              {slug&&<p style={{ textAlign:'center', fontSize:8, color:curTheme.text, opacity:0.2, padding:'0 0 8px', fontFamily:'monospace' }}>{slug}.trustbank.xyz</p>}
            </div>
            {siteUrl && (
              <Link href={siteUrl} target="_blank" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'9px', borderRadius:10, border:'0.5px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(241,245,249,0.5)', textDecoration:'none', fontSize:12, fontWeight:600, marginTop:8 }}>
                <ExternalLink size={12}/> Open full site
              </Link>
            )}
            <button onClick={handleSave} style={{ width:'100%', marginTop:6, padding:'9px', borderRadius:10, border:'none', background:A, color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
              <Save size={12}/> Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
