'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Hash, Home, User, Palette, Layout, FileText, DollarSign,
  Wallet, Star, MessageSquare, Settings, Video, Eye, EyeOff,
  Menu, X, Check, Loader2, Save, Camera, Copy, Lock, Unlock,
  Plus, Trash2, Link2, Youtube, ChevronDown, ChevronUp,
  Briefcase, GraduationCap, Pin, Heart, Share2, TrendingUp,
  Coins, Hash as HashIcon, Clock, Globe, Phone, Mail, Linkedin,
  LayoutGrid, Columns2, Columns3, ArrowLeft, BadgeCheck, Award,
  Megaphone, RefreshCw, Image
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useSiteVideos, useSiteLinks, useFeedPosts } from '@/hooks/useMiniSite';

const ACCENT = '#8b5cf6';

// ─── Glass Input ──────────────────────────────────────────────
function GInput({ label, value, onChange, placeholder, type='text', textarea=false }: any) {
  const style = {
    width:'100%', background:'white',
    border:'1px solid #e5e7eb', borderRadius:12,
    padding:'10px 14px', fontSize:14, color:'#111827',
    fontFamily:'inherit', outline:'none', resize:textarea?'vertical':'none' as any,
    boxSizing:'border-box' as any
  };
  return (
    <div style={{ marginBottom:16 }}>
      {label && <label style={{ display:'block', fontSize:12, fontWeight:500, color:'#6b7280', marginBottom:6 }}>{label}</label>}
      {textarea
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={3} style={style}/>
        : <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={style}/>
      }
    </div>
  );
}

// ─── Glass Card ────────────────────────────────────────────────
function GCard({ children, style, accent }: any) {
  return (
    <div style={{
      background: accent ? `${accent}08` : 'white',
      border: `1px solid ${accent ? accent+'30' : '#e5e7eb'}`,
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      borderRadius:20, padding:20,
      ...style
    }}>
      {children}
    </div>
  );
}

// ─── Section Title ─────────────────────────────────────────────
function STitle({ icon:Icon, title, sub }: any) {
  return (
    <div style={{ marginBottom:20 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
        <Icon style={{ width:18, height:18, color:ACCENT }}/>
        <h2 style={{ fontSize:16, fontWeight:700, color:'#111827' }}>{title}</h2>
      </div>
      {sub && <p style={{ fontSize:13, color:'#9ca3af' }}>{sub}</p>}
    </div>
  );
}

const BG_STYLES = [
  { id:'dark',        label:'Dark',        preview:'#0a0a0f' },
  { id:'midnight',    label:'Midnight',    preview:'#050508' },
  { id:'white',       label:'White',       preview:'#ffffff' },
  { id:'beige',       label:'Beige',       preview:'#faf7f2' },
  { id:'pastel-blue', label:'Sky Blue',    preview:'#f0f9ff' },
  { id:'pastel-pink', label:'Rose',        preview:'#fdf2f8' },
  { id:'pastel-lav',  label:'Lavender',    preview:'#f5f3ff' },
  { id:'light-gray',  label:'Light Gray',  preview:'#f1f5f9' },
];

const GRADIENTS = [
  { id:'cosmic',   label:'Cosmic',   colors:'linear-gradient(135deg,#4c1d95,#312e81)' },
  { id:'ocean',    label:'Ocean',    colors:'linear-gradient(135deg,#0c4a6e,#164e63)' },
  { id:'forest',   label:'Forest',   colors:'linear-gradient(135deg,#14532d,#065f46)' },
  { id:'sunset',   label:'Sunset',   colors:'linear-gradient(135deg,#7c2d12,#78350f)' },
  { id:'midnight', label:'Midnight', colors:'linear-gradient(135deg,#0f172a,#1e293b)' },
];

const ACCENT_COLORS = [
  '#8b5cf6','#06b6d4','#10b981','#f59e0b',
  '#ef4444','#ec4899','#3b82f6','#f97316',
];

const NAV = [
  { id:'overview',   label:'Overview',    icon:Home },
  { id:'profile',    label:'Profile',     icon:User },
  { id:'appearance', label:'Appearance',  icon:Palette },
  { id:'links',      label:'Links',       icon:Link2 },
  { id:'videos',     label:'Videos',      icon:Video },
  { id:'feed',       label:'Feed',        icon:FileText },
  { id:'cv',         label:'CV & Contact',icon:Briefcase },
  { id:'monetize',   label:'Monetize',    icon:DollarSign },
  { id:'wallet',     label:'Wallet',      icon:Wallet },
  { id:'settings',   label:'Settings',    icon:Settings },
];

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const { profile, loading, update, uploadPhoto } = useProfile(user);
  const { videos, addVideo, deleteVideo } = useSiteVideos(profile?.id);
  const { links, addLink, deleteLink } = useSiteLinks(profile?.id);
  const { posts, addPost } = useFeedPosts(profile?.id);

  const [section, setSection] = useState('overview');
  const [mobileNav, setMobileNav] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string|null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  // Profile fields
  const [siteName, setSiteName] = useState('');
  const [slug, setSlug] = useState('');
  const [bio, setBio] = useState('');
  const [tagline, setTagline] = useState('');
  const [accent, setAccent] = useState(ACCENT);
  const [bgStyle, setBgStyle] = useState('dark');
  const [gradient, setGradient] = useState('cosmic');
  const [cols, setCols] = useState(1);
  const [showCv, setShowCv] = useState(false);
  const [published, setPublished] = useState(false);
  // CV
  const [cvHeadline, setCvHeadline] = useState('');
  const [cvLocation, setCvLocation] = useState('');
  const [cvSkills, setCvSkills] = useState('');
  const [cvBio, setCvBio] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactLinkedin, setContactLinkedin] = useState('');
  const [contactPrice, setContactPrice] = useState('20');
  const [cvExp, setCvExp] = useState<any[]>([]);
  const [cvEdu, setCvEdu] = useState<any[]>([]);
  // Links
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkLocked, setLinkLocked] = useState(false);
  const [linkPrice, setLinkPrice] = useState('');
  // Videos
  const [ytUrl, setYtUrl] = useState('');
  const [vidTitle, setVidTitle] = useState('');
  const [vidPaywall, setVidPaywall] = useState(false);
  const [vidPrice, setVidPrice] = useState('5');
  // Feed
  const [feedText, setFeedText] = useState('');
  const [feedPin, setFeedPin] = useState(false);
  // Synced
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (profile && !synced) {
      setSiteName(profile.site_name||'');
      setSlug(profile.slug||'');
      setBio(profile.bio||'');
      setTagline((profile as any).tagline||'');
      setAccent((profile as any).accent_color||ACCENT);
      setBgStyle((profile as any).bg_style||'dark');
      setGradient((profile as any).gradient||'cosmic');
      setCols(profile.columns||1);
      setShowCv(profile.show_cv||false);
      setPublished(profile.published||false);
      setCvHeadline((profile as any).cv_headline||'');
      setCvLocation((profile as any).cv_location||'');
      setCvSkills((profile as any).cv_skills||'');
      setContactPrice(String((profile as any).contact_price||20));
      setSynced(true);
    }
  }, [profile, synced]);

  const showToast = (msg:string) => { setToast(msg); setTimeout(()=>setToast(null),3000); };

  const handleSave = async () => {
    setSaving(true);
    await update({
      site_name:siteName, slug, bio, tagline,
      accent_color:accent, bg_style:bgStyle, gradient, columns:cols,
      show_cv:showCv, published,
      cv_headline:cvHeadline, cv_location:cvLocation, cv_skills:cvSkills,
      contact_price:parseFloat(contactPrice)||20,
    } as any);
    setSaving(false);
    showToast('✓ Saved!');
  };

  const handlePhoto = async (e:React.ChangeEvent<HTMLInputElement>, type:'avatar'|'banner') => {
    const file = e.target.files?.[0]; if(!file) return;
    showToast('Uploading...');
    const url = await uploadPhoto(file, type);
    if(url) showToast('✓ Photo updated!'); else showToast('Upload failed — check Storage buckets');
  };

  const handleAddLink = async () => {
    if(!linkTitle||!linkUrl) return;
    await addLink({ title:linkTitle, url:linkUrl, locked:linkLocked, lock_price:parseFloat(linkPrice)||0, type:'link' });
    setLinkTitle(''); setLinkUrl(''); setLinkLocked(false); setLinkPrice('');
    showToast('✓ Link added!');
  };

  const handleAddVideo = async () => {
    if(!ytUrl||!vidTitle) return;
    const match = ytUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const ytId = match?.[1] || ytUrl;
    await addVideo({ title:vidTitle, youtube_id:ytId, paywall_enabled:vidPaywall, paywall_price:parseFloat(vidPrice)||0, sort_order:videos.length });
    setYtUrl(''); setVidTitle(''); setVidPaywall(false); setVidPrice('5');
    showToast('✓ Video added!');
  };

  const handleAddPost = async () => {
    if(!feedText.trim()) return;
    await addPost({ text:feedText, pinned:feedPin, images:[] });
    setFeedText(''); setFeedPin(false);
    showToast(feedPin ? '✓ Post pinned for 1 year!' : '✓ Post published!');
  };

  const initials = (profile?.site_name||user?.email||'U').charAt(0).toUpperCase();
  const profileUrl = profile?.slug ? `https://trustbank.com/@${profile.slug}` : '';

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#f9fafb', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Loader2 style={{ width:32, height:32, color:ACCENT, animation:'spin 1s linear infinite' }}/>
    </div>
  );
  if (!user) { if(typeof window!=='undefined') window.location.href='/login'; return null; }

  return (
    <div style={{ minHeight:'100vh', background:'#f9fafb', color:'#111827', fontFamily:"-apple-system,'Plus Jakarta Sans',sans-serif", display:'flex' }}>
      {toast && (
        <div style={{ position:'fixed', top:16, right:16, zIndex:100, background:'white', border:'1px solid #d1d5db', borderRadius:14, padding:'12px 18px', fontSize:14, color:'#111827', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
          {toast}
        </div>
      )}

      {/* Sidebar */}
      <aside style={{
        width:220, flexShrink:0, borderRight:'1px solid #e5e7eb',
        background:'#fafafa',
        display:'flex', flexDirection:'column', position:'sticky', top:0, height:'100vh',
        overflowY:'auto'
      }}>
        {/* Logo */}
        <div style={{ padding:'18px 20px', borderBottom:'1px solid #e5e7eb', display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:10, background:ACCENT, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Hash style={{ width:16, height:16, color:'#fff' }}/>
          </div>
          <span style={{ fontSize:15, fontWeight:800, color:ACCENT }}>trustbank</span>
        </div>

        {/* User card */}
        <div style={{ padding:'14px 16px', borderBottom:'1px solid #e5e7eb' }}>
          <div style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:14, padding:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover' }}/>
                : <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg,${ACCENT},#06b6d4)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'#fff', flexShrink:0 }}>{initials}</div>
              }
              <div style={{ minWidth:0 }}>
                <p style={{ fontSize:13, fontWeight:600, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{profile?.site_name||user.email?.split('@')[0]}</p>
                <p style={{ fontSize:11, color:'#9ca3af', fontFamily:'monospace', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>/{profile?.slug||'...'}</p>
              </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:10, fontFamily:'monospace', color:'#9ca3af' }}>
                {published ? '🟢 Live' : '🟡 Draft'}
              </span>
              <a href={profileUrl} target="_blank" rel="noopener noreferrer"
                style={{ fontSize:10, color:ACCENT, textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>
                <Eye style={{ width:11, height:11 }}/> View
              </a>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:'8px 10px', overflowY:'auto' }}>
          {NAV.map(item => {
            const Icon = item.icon;
            const active = section === item.id;
            return (
              <button key={item.id} onClick={() => setSection(item.id)}
                style={{ width:'100%', display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:12, border:'none', cursor:'pointer', fontSize:13, fontWeight:active?600:400, color:active?ACCENT:'#6b7280', background:active?`${ACCENT}12`:'transparent', marginBottom:2, textAlign:'left', transition:'all 0.15s' }}>
                <Icon style={{ width:15, height:15, flexShrink:0 }}/> {item.label}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding:'12px 16px', borderTop:'1px solid #e5e7eb', display:'flex', flexDirection:'column', gap:8 }}>
          <button onClick={() => { if(profileUrl){ navigator.clipboard.writeText(profileUrl); showToast('✓ Link copied!'); } else showToast('Set a slug first'); }}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 12px', borderRadius:10, border:'1px solid #e5e7eb', background:'none', color:'#9ca3af', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
            <Copy style={{ width:12, height:12 }}/> Copy link
          </button>
          <button onClick={() => signOut()}
            style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 12px', borderRadius:10, border:'1px solid #fca5a5', background:'#fef2f2', color:'#ef4444', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
            <X style={{ width:12, height:12 }}/> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex:1, minWidth:0, overflowY:'auto' }}>
        {/* Header */}
        <div style={{ position:'sticky', top:0, zIndex:10, padding:'14px 28px', borderBottom:'1px solid #e5e7eb', background:'rgba(255,255,255,0.97)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <h1 style={{ fontSize:15, fontWeight:600, color:'#111827' }}>
            {NAV.find(n=>n.id===section)?.label}
          </h1>
          <div style={{ display:'flex', gap:10 }}>
            {['profile','appearance','cv','links','videos'].includes(section) && (
              <button onClick={handleSave} disabled={saving}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 18px', borderRadius:12, border:'none', background:ACCENT, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', opacity:saving?0.6:1, fontFamily:'inherit' }}>
                {saving ? <Loader2 style={{ width:14, height:14, animation:'spin 1s linear infinite' }}/> : <Save style={{ width:14, height:14 }}/>}
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </div>

        <div style={{ padding:'28px', maxWidth:860 }}>

          {/* ══ OVERVIEW ══ */}
          {section === 'overview' && (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:24 }}>
                {[
                  { label:'Profile views', value:'—', icon:TrendingUp, color:'#8b5cf6' },
                  { label:'USDC earned', value:'$0.00', icon:Coins, color:'#10b981' },
                  { label:'CV unlocks', value:'0', icon:Unlock, color:'#f59e0b' },
                  { label:'Links', value:String(links.length), icon:Link2, color:'#06b6d4' },
                ].map(s => (
                  <GCard key={s.label}>
                    <s.icon style={{ width:20, height:20, color:s.color, marginBottom:10 }}/>
                    <p style={{ fontSize:22, fontWeight:800, color:'#111827' }}>{s.value}</p>
                    <p style={{ fontSize:12, color:'#9ca3af', marginTop:2 }}>{s.label}</p>
                  </GCard>
                ))}
              </div>

              <GCard style={{ marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:'#111827' }}>Your mini-site</p>
                  <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:published?'rgba(16,185,129,0.15)':'rgba(245,158,11,0.15)', color:published?'#10b981':'#f59e0b', border:`0.5px solid ${published?'rgba(16,185,129,0.3)':'rgba(245,158,11,0.3)'}` }}>
                    {published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:14 }}>
                  {profile?.avatar_url
                    ? <img src={profile.avatar_url} alt="" style={{ width:52, height:52, borderRadius:14, objectFit:'cover' }}/>
                    : <div style={{ width:52, height:52, borderRadius:14, background:`linear-gradient(135deg,${ACCENT},#06b6d4)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, fontWeight:800, color:'#fff' }}>{initials}</div>
                  }
                  <div>
                    <p style={{ fontSize:15, fontWeight:700, color:'#111827' }}>{profile?.site_name||'Your name'}</p>
                    <p style={{ fontSize:13, color:'#9ca3af' }}>{(profile as any)?.tagline||'Add your tagline'}</p>
                    <p style={{ fontSize:11, fontFamily:'monospace', color:ACCENT, marginTop:2 }}>trustbank.com/{profile?.slug}</p>
                  </div>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                  <a href={profileUrl} target="_blank" rel="noopener noreferrer"
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', borderRadius:12, border:'1px solid #e5e7eb', background:'#f9fafb', color:'#6b7280', fontSize:13, textDecoration:'none' }}>
                    <Eye style={{ width:14, height:14 }}/> View profile
                  </a>
                  <button onClick={() => { if(profileUrl){ navigator.clipboard.writeText(profileUrl); showToast('✓ Copied!'); } else showToast('Set a slug first'); }}
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, padding:'10px', borderRadius:12, border:'1px solid #e5e7eb', background:'#f9fafb', color:'#6b7280', fontSize:13, cursor:'pointer', fontFamily:'inherit' }}>
                    <Copy style={{ width:14, height:14 }}/> Copy link
                  </button>
                </div>
              </GCard>

              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:10 }}>
                {[{l:'Edit profile',i:User,s:'profile'},{l:'Appearance',i:Palette,s:'appearance'},{l:'Add links',i:Link2,s:'links'},{l:'Add videos',i:Video,s:'videos'}].map(({l,i:I,s}) => (
                  <button key={l} onClick={()=>setSection(s)}
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'18px', borderRadius:16, border:'1px solid #e5e7eb', background:'#f9fafb', color:'#6b7280', fontSize:12, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s' }}>
                    <I style={{ width:22, height:22, color:ACCENT }}/> {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ══ PROFILE ══ */}
          {section === 'profile' && (
            <div>
              {/* Photo upload */}
              <GCard style={{ marginBottom:16, overflow:'hidden', padding:0 }}>
                <div style={{ height:120, background:'linear-gradient(135deg,#4c1d95,#312e81)', position:'relative', cursor:'pointer', overflow:'hidden' }}
                  onClick={() => bannerRef.current?.click()}>
                  {profile?.banner_url && <img src={profile.banner_url} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.6 }}/>}
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0)', transition:'background 0.2s' }}>
                    <Camera style={{ width:20, height:20, color:'rgba(255,255,255,0.6)' }}/>
                  </div>
                  <input ref={bannerRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>handlePhoto(e,'banner')}/>
                </div>
                <div style={{ padding:'0 20px 20px', marginTop:-28 }}>
                  <div style={{ position:'relative', display:'inline-block', cursor:'pointer' }} onClick={() => photoRef.current?.click()}>
                    {profile?.avatar_url
                      ? <img src={profile.avatar_url} alt="" style={{ width:60, height:60, borderRadius:'50%', objectFit:'cover', border:'3px solid white' }}/>
                      : <div style={{ width:60, height:60, borderRadius:'50%', background:`linear-gradient(135deg,${ACCENT},#06b6d4)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, color:'#fff', border:'3px solid white' }}>{initials}</div>
                    }
                    <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Camera style={{ width:16, height:16, color:'#fff' }}/>
                    </div>
                    <input ref={photoRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e=>handlePhoto(e,'avatar')}/>
                  </div>
                </div>
              </GCard>

              <GCard>
                <GInput label="Display name" value={siteName} onChange={setSiteName} placeholder="Your full name"/>
                <GInput label="URL slug" value={slug} onChange={setSlug} placeholder="yourname"/>
                <GInput label="Tagline" value={tagline} onChange={setTagline} placeholder="Designer · Developer · Creator"/>
                <GInput label="Bio" value={bio} onChange={setBio} placeholder="Tell your story..." textarea/>

                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderTop:'1px solid #e5e7eb' }}>
                  <div>
                    <p style={{ fontSize:14, fontWeight:500, color:'#111827' }}>Published</p>
                    <p style={{ fontSize:12, color:'#9ca3af' }}>Visible in directory and search</p>
                  </div>
                  <button onClick={()=>setPublished(!published)}
                    style={{ width:44, height:24, borderRadius:12, border:'none', background:published?ACCENT:'rgba(255,255,255,0.12)', position:'relative', cursor:'pointer', transition:'background 0.2s' }}>
                    <div style={{ position:'absolute', top:2, left:published?22:2, width:20, height:20, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }}/>
                  </button>
                </div>
              </GCard>
            </div>
          )}

          {/* ══ APPEARANCE ══ */}
          {section === 'appearance' && (
            <div>
              <GCard style={{ marginBottom:16 }}>
                <p style={{ fontSize:14, fontWeight:600, color:'#111827', marginBottom:14 }}>Background style</p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                  {BG_STYLES.map(b => (
                    <button key={b.id} onClick={()=>setBgStyle(b.id)}
                      style={{ padding:'10px 6px', borderRadius:12, border:`0.5px solid ${bgStyle===b.id?ACCENT:'rgba(255,255,255,0.08)'}`, background:bgStyle===b.id?`${ACCENT}12`:'rgba(255,255,255,0.03)', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                      <div style={{ width:32, height:20, borderRadius:6, background:b.preview, border:'0.5px solid rgba(255,255,255,0.1)' }}/>
                      <span style={{ fontSize:10, color:bgStyle===b.id?ACCENT:'#9ca3af' }}>{b.label}</span>
                    </button>
                  ))}
                </div>
              </GCard>

              <GCard style={{ marginBottom:16 }}>
                <p style={{ fontSize:14, fontWeight:600, color:'#111827', marginBottom:14 }}>Banner gradient</p>
                <div style={{ display:'flex', gap:8 }}>
                  {GRADIENTS.map(g => (
                    <button key={g.id} onClick={()=>setGradient(g.id)}
                      style={{ flex:1, height:36, borderRadius:10, border:`2px solid ${gradient===g.id?ACCENT:'transparent'}`, background:g.colors, cursor:'pointer', transition:'border-color 0.2s' }}
                      title={g.label}/>
                  ))}
                </div>
              </GCard>

              <GCard style={{ marginBottom:16 }}>
                <p style={{ fontSize:14, fontWeight:600, color:'#111827', marginBottom:14 }}>Accent color</p>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                  {ACCENT_COLORS.map(c => (
                    <button key={c} onClick={()=>setAccent(c)}
                      style={{ width:36, height:36, borderRadius:'50%', background:c, border:`3px solid ${accent===c?'#fff':'transparent'}`, cursor:'pointer', transition:'border 0.2s' }}/>
                  ))}
                </div>
              </GCard>

              <GCard>
                <p style={{ fontSize:14, fontWeight:600, color:'#111827', marginBottom:14 }}>Layout columns</p>
                <div style={{ display:'flex', gap:10 }}>
                  {[{n:1,icon:LayoutGrid},{n:2,icon:Columns2},{n:3,icon:Columns3}].map(({n,icon:Icon}) => (
                    <button key={n} onClick={()=>setCols(n)}
                      style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6, padding:'14px 0', borderRadius:12, border:`0.5px solid ${cols===n?ACCENT:'rgba(255,255,255,0.08)'}`, background:cols===n?`${ACCENT}12`:'rgba(255,255,255,0.03)', cursor:'pointer', color:cols===n?ACCENT:'#9ca3af', fontSize:12, fontFamily:'inherit' }}>
                      <Icon style={{ width:18, height:18 }}/> {n} col{n>1?'s':''}
                    </button>
                  ))}
                </div>
              </GCard>
            </div>
          )}

          {/* ══ LINKS ══ */}
          {section === 'links' && (
            <div>
              <GCard style={{ marginBottom:16 }}>
                <STitle icon={Link2} title="Add link" sub="Links appear on your mini-site. Lock them to charge USDC."/>
                <GInput label="Title" value={linkTitle} onChange={setLinkTitle} placeholder="My Portfolio"/>
                <GInput label="URL" value={linkUrl} onChange={setLinkUrl} placeholder="https://..."/>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <label style={{ fontSize:13, color:'#6b7280' }}>Lock (charge to access)</label>
                  <button onClick={()=>setLinkLocked(!linkLocked)}
                    style={{ width:40, height:22, borderRadius:11, border:'none', background:linkLocked?ACCENT:'rgba(255,255,255,0.12)', position:'relative', cursor:'pointer', transition:'background 0.2s' }}>
                    <div style={{ position:'absolute', top:2, left:linkLocked?20:2, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }}/>
                  </button>
                </div>
                {linkLocked && <GInput label="Price (USDC)" value={linkPrice} onChange={setLinkPrice} placeholder="5.00" type="number"/>}
                <button onClick={handleAddLink}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, width:'100%', padding:'11px', borderRadius:12, border:'none', background:ACCENT, color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                  <Plus style={{ width:16, height:16 }}/> Add link
                </button>
              </GCard>

              {links.length > 0 && (
                <GCard>
                  <p style={{ fontSize:14, fontWeight:600, color:'#111827', marginBottom:14 }}>Your links ({links.length})</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                    {links.map((l:any) => (
                      <div key={l.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', background:'white', border:'1px solid #e5e7eb', borderRadius:12 }}>
                        {l.locked ? <Lock style={{ width:14, height:14, color:ACCENT }}/> : <Globe style={{ width:14, height:14, color:'#9ca3af' }}/>}
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:13, fontWeight:500, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.title}</p>
                          <p style={{ fontSize:11, color:'#d1d5db', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{l.url}</p>
                        </div>
                        {l.locked && <span style={{ fontSize:11, padding:'2px 8px', borderRadius:20, background:`${ACCENT}15`, color:ACCENT }}>${l.lock_price}</span>}
                        <button onClick={()=>deleteLink(l.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.5)', padding:4, display:'flex' }}>
                          <Trash2 style={{ width:14, height:14 }}/>
                        </button>
                      </div>
                    ))}
                  </div>
                </GCard>
              )}
            </div>
          )}

          {/* ══ VIDEOS ══ */}
          {section === 'videos' && (
            <div>
              <GCard style={{ marginBottom:16 }}>
                <STitle icon={Video} title="Add YouTube video" sub="Embed a video. Enable paywall to charge USDC for access."/>
                <GInput label="YouTube URL or ID" value={ytUrl} onChange={setYtUrl} placeholder="https://youtube.com/watch?v=..."/>
                <GInput label="Video title" value={vidTitle} onChange={setVidTitle} placeholder="My tutorial on..."/>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <div>
                    <p style={{ fontSize:13, color:'#6b7280' }}>Enable paywall</p>
                    <p style={{ fontSize:11, color:'#d1d5db' }}>You set the price · Platform takes 30%</p>
                  </div>
                  <button onClick={()=>setVidPaywall(!vidPaywall)}
                    style={{ width:40, height:22, borderRadius:11, border:'none', background:vidPaywall?ACCENT:'rgba(255,255,255,0.12)', position:'relative', cursor:'pointer' }}>
                    <div style={{ position:'absolute', top:2, left:vidPaywall?20:2, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }}/>
                  </button>
                </div>
                {vidPaywall && <GInput label="Access price (USDC) — min 24h access" value={vidPrice} onChange={setVidPrice} placeholder="5.00" type="number"/>}
                <button onClick={handleAddVideo}
                  style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, width:'100%', padding:'11px', borderRadius:12, border:'none', background:ACCENT, color:'#fff', fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                  <Plus style={{ width:16, height:16 }}/> Add video
                </button>
              </GCard>

              {videos.length > 0 && (
                <GCard>
                  <p style={{ fontSize:14, fontWeight:600, color:'#111827', marginBottom:14 }}>Your videos ({videos.length})</p>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {videos.map((v:any) => {
                      const ytId = v.youtube_id;
                      return (
                        <div key={v.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px', background:'white', border:'1px solid #e5e7eb', borderRadius:14 }}>
                          <img src={`https://img.youtube.com/vi/${ytId}/default.jpg`} alt="" style={{ width:60, height:40, objectFit:'cover', borderRadius:8 }}/>
                          <div style={{ flex:1, minWidth:0 }}>
                            <p style={{ fontSize:13, fontWeight:500, color:'#111827', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{v.title}</p>
                            {v.paywall_enabled && <span style={{ fontSize:11, color:ACCENT }}>${v.paywall_price} USDC</span>}
                          </div>
                          <button onClick={()=>deleteVideo(v.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.5)', padding:4, display:'flex' }}>
                            <Trash2 style={{ width:14, height:14 }}/>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </GCard>
              )}
            </div>
          )}

          {/* ══ FEED ══ */}
          {section === 'feed' && (
            <div>
              <GCard style={{ marginBottom:16 }}>
                <STitle icon={FileText} title="Post to your feed" sub="Posts disappear in 7 days. Pin for 1 year for $10 USDC."/>
                <textarea value={feedText} onChange={e=>setFeedText(e.target.value)} placeholder="Share an update... (max 300 chars)" maxLength={300} rows={4}
                  style={{ width:'100%', background:'white', border:'1px solid #e5e7eb', borderRadius:14, padding:14, fontSize:14, color:'#111827', fontFamily:'inherit', outline:'none', resize:'none', boxSizing:'border-box', marginBottom:12 }}/>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:12, color:feedText.length>280?'#ef4444':'#d1d5db', fontFamily:'monospace' }}>{300-feedText.length}</span>
                    <button onClick={()=>setFeedPin(!feedPin)}
                      style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:10, border:`0.5px solid ${feedPin?ACCENT:'rgba(255,255,255,0.10)'}`, background:feedPin?`${ACCENT}15`:'rgba(255,255,255,0.04)', color:feedPin?ACCENT:'#9ca3af', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                      <Pin style={{ width:12, height:12 }}/> Pin · $10
                    </button>
                  </div>
                  <button onClick={handleAddPost} disabled={!feedText.trim()}
                    style={{ padding:'8px 20px', borderRadius:12, border:'none', background:ACCENT, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer', opacity:!feedText.trim()?0.4:1, fontFamily:'inherit' }}>
                    Post
                  </button>
                </div>
              </GCard>

              {posts.length > 0 && (
                <GCard>
                  <p style={{ fontSize:14, fontWeight:600, color:'#111827', marginBottom:14 }}>Your posts ({posts.length})</p>
                  {posts.map((p:any) => (
                    <div key={p.id} style={{ marginBottom:12, padding:'12px', background:'#f9fafb', border:`0.5px solid ${p.pinned?`${ACCENT}30`:'rgba(255,255,255,0.07)'}`, borderRadius:14 }}>
                      {p.pinned && <div style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, padding:'2px 8px', borderRadius:20, background:`${ACCENT}15`, color:ACCENT, marginBottom:8 }}><Pin style={{ width:10, height:10 }}/> Pinned</div>}
                      <p style={{ fontSize:13, color:'rgba(241,245,249,0.8)', lineHeight:1.5 }}>{p.text}</p>
                    </div>
                  ))}
                </GCard>
              )}
            </div>
          )}

          {/* ══ CV ══ */}
          {section === 'cv' && (
            <div>
              <GCard style={{ marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                  <STitle icon={Briefcase} title="CV & Contact" sub="Your CV is public. Contact details are locked."/>
                  <button onClick={()=>setShowCv(!showCv)}
                    style={{ width:40, height:22, borderRadius:11, border:'none', background:showCv?ACCENT:'rgba(255,255,255,0.12)', position:'relative', cursor:'pointer' }}>
                    <div style={{ position:'absolute', top:2, left:showCv?20:2, width:18, height:18, borderRadius:'50%', background:'#fff', transition:'left 0.2s' }}/>
                  </button>
                </div>
                <GInput label="Professional headline" value={cvHeadline} onChange={setCvHeadline} placeholder="Senior Full-Stack Engineer"/>
                <GInput label="Location" value={cvLocation} onChange={setCvLocation} placeholder="San Francisco, CA"/>
                <GInput label="Skills (comma separated)" value={cvSkills} onChange={setCvSkills} placeholder="React, TypeScript, Solidity..."/>
                <GInput label="Summary" value={cvBio} onChange={setCvBio} placeholder="Brief professional summary..." textarea/>
              </GCard>

              <GCard style={{ marginBottom:16 }}>
                <p style={{ fontSize:14, fontWeight:600, color:'#111827', marginBottom:4, display:'flex', alignItems:'center', gap:8 }}>
                  <Lock style={{ width:14, height:14, color:ACCENT }}/> Locked contact
                </p>
                <p style={{ fontSize:12, color:'#9ca3af', marginBottom:14 }}>Companies pay to unlock · You receive 50%</p>
                <GInput label="Email" value={contactEmail} onChange={setContactEmail} placeholder="contact@you.com" type="email"/>
                <GInput label="Phone / WhatsApp" value={contactPhone} onChange={setContactPhone} placeholder="+1 415..."/>
                <GInput label="LinkedIn URL" value={contactLinkedin} onChange={setContactLinkedin} placeholder="linkedin.com/in/..."/>
                <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <GInput label="Unlock price (USDC)" value={contactPrice} onChange={setContactPrice} placeholder="20" type="number"/>
                  <div style={{ marginTop:8, padding:'10px 14px', background:`${ACCENT}10`, border:`0.5px solid ${ACCENT}25`, borderRadius:12, fontSize:12, color:ACCENT, whiteSpace:'nowrap' }}>
                    You get ${parseFloat(contactPrice)/2||10}
                  </div>
                </div>
              </GCard>

              {/* Experience */}
              <GCard style={{ marginBottom:16 }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
                  <p style={{ fontSize:14, fontWeight:600, color:'#111827', display:'flex', alignItems:'center', gap:8 }}>
                    <Briefcase style={{ width:14, height:14, color:ACCENT }}/> Experience
                  </p>
                  <button onClick={()=>setCvExp(p=>[...p,{role:'',company:'',start:'',end:'',current:false,description:''}])}
                    style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 12px', borderRadius:10, border:`0.5px solid ${ACCENT}30`, background:`${ACCENT}10`, color:ACCENT, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
                    <Plus style={{ width:12, height:12 }}/> Add
                  </button>
                </div>
                {cvExp.map((e,i) => (
                  <div key={i} style={{ marginBottom:14, padding:14, background:'#f9fafb', border:'1px solid #e5e7eb', borderRadius:14 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      <GInput label="Role" value={e.role} onChange={(v:string)=>{const n=[...cvExp];n[i].role=v;setCvExp(n);}} placeholder="Senior Engineer"/>
                      <GInput label="Company" value={e.company} onChange={(v:string)=>{const n=[...cvExp];n[i].company=v;setCvExp(n);}} placeholder="Acme Corp"/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                      <GInput label="Start" value={e.start} onChange={(v:string)=>{const n=[...cvExp];n[i].start=v;setCvExp(n);}} placeholder="2022"/>
                      <GInput label="End" value={e.end} onChange={(v:string)=>{const n=[...cvExp];n[i].end=v;setCvExp(n);}} placeholder="Present"/>
                    </div>
                    <div style={{ display:'flex', justifyContent:'flex-end' }}>
                      <button onClick={()=>setCvExp(p=>p.filter((_,j)=>j!==i))} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.6)', fontSize:12, display:'flex', alignItems:'center', gap:4, fontFamily:'inherit' }}>
                        <Trash2 style={{ width:12, height:12 }}/> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </GCard>

              <button onClick={handleSave} disabled={saving}
                style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, width:'100%', padding:'12px', borderRadius:12, border:'none', background:ACCENT, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                {saving ? <Loader2 style={{ width:16, height:16, animation:'spin 1s linear infinite' }}/> : <Save style={{ width:16, height:16 }}/>}
                {saving ? 'Saving...' : 'Save CV & Contact'}
              </button>
            </div>
          )}

          {/* ══ MONETIZE ══ */}
          {section === 'monetize' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {[
                { title:'CV Contact Unlock', icon:Lock, desc:'Companies pay to see your email, phone and LinkedIn. You receive 50% instantly in USDC.', price:`$${parseFloat(contactPrice)/2||10} per unlock`, color:'#f59e0b' },
                { title:'Video Paywall', icon:Video, desc:'Set a price per video. Platform takes 30%. Access for minimum 24h — you choose the duration.', price:'You set the price', color:'#ec4899' },
                { title:'Link paywall', icon:Link2, desc:'Lock any link and charge USDC to unlock. Articles, files, exclusive content.', price:'You set the price', color:'#8b5cf6' },
                { title:'Feed pin', icon:Pin, desc:'Pin a post at the top of your feed for 1 year. Visible to all visitors.', price:'$10 USDC · 1 year', color:'#10b981' },
              ].map(item => (
                <GCard key={item.title} style={{ display:'flex', alignItems:'flex-start', gap:14, cursor:'pointer' }}>
                  <div style={{ width:42, height:42, borderRadius:12, background:`${item.color}15`, border:`0.5px solid ${item.color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <item.icon style={{ width:20, height:20, color:item.color }}/>
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:14, fontWeight:600, color:'#111827', marginBottom:4 }}>{item.title}</p>
                    <p style={{ fontSize:12, color:'#9ca3af', lineHeight:1.5, marginBottom:6 }}>{item.desc}</p>
                    <span style={{ fontSize:12, padding:'2px 10px', borderRadius:20, background:`${item.color}15`, color:item.color, border:`0.5px solid ${item.color}30` }}>{item.price}</span>
                  </div>
                </GCard>
              ))}
            </div>
          )}

          {/* ══ WALLET ══ */}
          {section === 'wallet' && (
            <div>
              <GCard accent={ACCENT} style={{ marginBottom:16, textAlign:'center', padding:32 }}>
                <p style={{ fontSize:12, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:8 }}>USDC Balance</p>
                <p style={{ fontSize:48, fontWeight:800, color:'#111827', marginBottom:4 }}>$0.00</p>
                <p style={{ fontSize:13, color:'rgba(141,92,246,0.7)' }}>Polygon · Smart Wallet</p>
              </GCard>
              <GCard>
                <p style={{ fontSize:14, fontWeight:600, color:'#111827', marginBottom:8 }}>Wallet address</p>
                <div style={{ background:'white', border:'1px solid #e5e7eb', borderRadius:12, padding:'10px 14px', fontFamily:'monospace', fontSize:12, color:'rgba(141,92,246,0.8)' }}>
                  Not connected yet — install MetaMask to connect
                </div>
              </GCard>
            </div>
          )}

          {/* ══ SETTINGS ══ */}
          {section === 'settings' && (
            <div>
              <GCard>
                <p style={{ fontSize:14, fontWeight:600, color:'#111827', marginBottom:16 }}>Account</p>
                {[{ l:'Email', v:user.email||'' },{ l:'Slug', v:`${profile?.slug||''}.trustbank.xyz` },{ l:'Plan', v:'Starter' },{ l:'Platform', v:'TrustBank' }].map(f => (
                  <div key={f.l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #e5e7eb' }}>
                    <span style={{ fontSize:13, color:'#6b7280' }}>{f.l}</span>
                    <span style={{ fontSize:13, color:'#111827', fontFamily:'monospace' }}>{f.v}</span>
                  </div>
                ))}
                <button onClick={()=>signOut()} style={{ marginTop:16, display:'flex', alignItems:'center', justifyContent:'center', gap:6, width:'100%', padding:'11px', borderRadius:12, border:'0.5px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.07)', color:'#ef4444', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
                  Sign out
                </button>
              </GCard>
            </div>
          )}

        </div>
      </main>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
