'use client';
import { useState, useEffect } from 'react';
import {
  ExternalLink, Play, Lock, MapPin, BadgeCheck, Award,
  Share2, Heart, Clock, Pin, Zap, Edit, Globe, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

// ─── Theme map ───────────────────────────────────────────────
const BG_MAP: Record<string,any> = {
  dark:     {bg:'#0a0a0f',text:'#f1f5f9',muted:'rgba(241,245,249,0.45)',surface:'rgba(255,255,255,0.05)',border:'rgba(255,255,255,0.09)'},
  midnight: {bg:'#050508',text:'#f1f5f9',muted:'rgba(241,245,249,0.4)',surface:'rgba(255,255,255,0.04)',border:'rgba(255,255,255,0.07)'},
  noir:     {bg:'#000000',text:'#ffffff',muted:'rgba(255,255,255,0.45)',surface:'rgba(255,255,255,0.06)',border:'rgba(255,255,255,0.1)'},
  ocean:    {bg:'#030d1a',text:'#e0f2fe',muted:'rgba(224,242,254,0.45)',surface:'rgba(56,189,248,0.08)',border:'rgba(56,189,248,0.15)'},
  forest:   {bg:'#030d06',text:'#dcfce7',muted:'rgba(220,252,231,0.45)',surface:'rgba(74,222,128,0.07)',border:'rgba(74,222,128,0.15)'},
  rose:     {bg:'#1a0010',text:'#ffe4e6',muted:'rgba(255,228,230,0.45)',surface:'rgba(251,113,133,0.08)',border:'rgba(251,113,133,0.15)'},
  gold:     {bg:'#0c0900',text:'#fef3c7',muted:'rgba(254,243,199,0.45)',surface:'rgba(253,230,138,0.07)',border:'rgba(253,230,138,0.15)'},
  nebula:   {bg:'#0d0520',text:'#f3e8ff',muted:'rgba(243,232,255,0.45)',surface:'rgba(168,85,247,0.08)',border:'rgba(168,85,247,0.15)'},
  ember:    {bg:'#1c0800',text:'#ffedd5',muted:'rgba(255,237,213,0.45)',surface:'rgba(249,115,22,0.08)',border:'rgba(249,115,22,0.15)'},
  arctic:   {bg:'#0a1628',text:'#e0f2fe',muted:'rgba(224,242,254,0.4)',surface:'rgba(125,211,252,0.07)',border:'rgba(125,211,252,0.15)'},
  matrix:   {bg:'#000800',text:'#00ff41',muted:'rgba(0,255,65,0.5)',surface:'rgba(0,255,65,0.05)',border:'rgba(0,255,65,0.2)'},
  crimson:  {bg:'#1a0505',text:'#fecaca',muted:'rgba(254,202,202,0.45)',surface:'rgba(239,68,68,0.07)',border:'rgba(239,68,68,0.15)'},
  steel:    {bg:'#1a1f2e',text:'#c8d3e0',muted:'rgba(200,211,224,0.45)',surface:'rgba(148,163,184,0.07)',border:'rgba(148,163,184,0.15)'},
  aurora:   {bg:'#050218',text:'#e0e7ff',muted:'rgba(224,231,255,0.45)',surface:'rgba(129,140,248,0.07)',border:'rgba(129,140,248,0.15)'},
  hex:      {bg:'#0f1923',text:'#e2e8f0',muted:'rgba(226,232,240,0.45)',surface:'rgba(6,182,212,0.07)',border:'rgba(6,182,212,0.15)'},
  white:    {bg:'#ffffff',text:'#0f172a',muted:'rgba(15,23,42,0.5)',surface:'rgba(0,0,0,0.04)',border:'rgba(0,0,0,0.08)'},
  ivory:    {bg:'#fafafa',text:'#18181b',muted:'rgba(24,24,27,0.5)',surface:'rgba(0,0,0,0.04)',border:'rgba(0,0,0,0.07)'},
  beige:    {bg:'#faf7f2',text:'#1c1917',muted:'rgba(28,25,23,0.5)',surface:'rgba(0,0,0,0.03)',border:'rgba(0,0,0,0.07)'},
  sky:      {bg:'#f0f9ff',text:'#0c4a6e',muted:'rgba(12,74,110,0.5)',surface:'rgba(14,165,233,0.06)',border:'rgba(14,165,233,0.15)'},
  mint:     {bg:'#f0fdf4',text:'#14532d',muted:'rgba(20,83,45,0.5)',surface:'rgba(22,163,74,0.06)',border:'rgba(22,163,74,0.15)'},
  lavender: {bg:'#faf5ff',text:'#4c1d95',muted:'rgba(76,29,149,0.5)',surface:'rgba(124,58,237,0.06)',border:'rgba(124,58,237,0.15)'},
  peach:    {bg:'#fff7ed',text:'#7c2d12',muted:'rgba(124,45,18,0.5)',surface:'rgba(234,88,12,0.05)',border:'rgba(234,88,12,0.15)'},
  lemon:    {bg:'#fefce8',text:'#713f12',muted:'rgba(113,63,18,0.5)',surface:'rgba(202,138,4,0.05)',border:'rgba(202,138,4,0.15)'},
  blush:    {bg:'#fdf2f8',text:'#831843',muted:'rgba(131,24,67,0.5)',surface:'rgba(219,39,119,0.05)',border:'rgba(219,39,119,0.15)'},
  paper:    {bg:'#faf8f4',text:'#3d2b1f',muted:'rgba(61,43,31,0.5)',surface:'rgba(0,0,0,0.03)',border:'rgba(0,0,0,0.07)'},
  sand:     {bg:'#fdf4e7',text:'#44260a',muted:'rgba(68,38,10,0.5)',surface:'rgba(217,119,6,0.05)',border:'rgba(217,119,6,0.15)'},
  cloud:    {bg:'#f8f9ff',text:'#1e3a5f',muted:'rgba(30,58,95,0.5)',surface:'rgba(59,130,246,0.05)',border:'rgba(59,130,246,0.12)'},
  nordic:   {bg:'#f5f5f0',text:'#2d2d2a',muted:'rgba(45,45,42,0.5)',surface:'rgba(0,0,0,0.04)',border:'rgba(0,0,0,0.07)'},
  sakura:   {bg:'#fff1f5',text:'#4a1530',muted:'rgba(74,21,48,0.5)',surface:'rgba(225,29,121,0.05)',border:'rgba(225,29,121,0.15)'},
  cream:    {bg:'#fdf6e3',text:'#3b2f1e',muted:'rgba(59,47,30,0.5)',surface:'rgba(0,0,0,0.03)',border:'rgba(0,0,0,0.07)'},
};

function getT(profile: any) {
  const base = BG_MAP[profile.theme||'dark'] || BG_MAP.dark;
  return {
    ...base,
    accent: profile.accent_color || '#818cf8',
    text: (profile as any).text_color || base.text,
    isDark: !['white','ivory','beige','sky','mint','lavender','peach','lemon','blush','paper','sand','cloud','nordic','sakura','cream'].includes(profile.theme||'dark'),
  };
}

// ─── Glass Card ──────────────────────────────────────────────
function GCard({ children, t, style, onClick }: any) {
  return (
    <div onClick={onClick} style={{
      background:t.surface, border:`0.5px solid ${t.border}`,
      borderRadius:18, padding:18, backdropFilter:'blur(20px) saturate(180%)',
      WebkitBackdropFilter:'blur(20px) saturate(180%)',
      cursor:onClick?'pointer':'default', transition:'all 0.2s', ...style,
    }}>{children}</div>
  );
}

// ─── Feed Post ────────────────────────────────────────────────
function FeedPost({ post, t }: any) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes || 0);
  const hoursLeft = Math.max(0, Math.ceil((new Date(post.expires_at).getTime()-Date.now())/3600000));
  const daysLeft = Math.ceil(hoursLeft/24);

  return (
    <GCard t={t} style={{ marginBottom:10, border:post.pinned?`0.5px solid ${t.accent}50`:`0.5px solid ${t.border}` }}>
      {post.pinned&&(
        <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:8 }}>
          <Pin size={10} color={t.accent}/>
          <span style={{ fontSize:10, color:t.accent, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>Pinned · 1 year</span>
        </div>
      )}
      <p style={{ fontSize:14, color:t.text, margin:0, lineHeight:1.7, whiteSpace:'pre-wrap' }}>{post.text}</p>
      {post.image_url&&<img src={post.image_url} style={{ width:'100%', borderRadius:10, marginTop:10, objectFit:'cover', maxHeight:220 }}/>}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:10, paddingTop:8, borderTop:`0.5px solid ${t.border}` }}>
        <button onClick={()=>{setLiked(l=>!l);setLikes((n:number)=>liked?n-1:n+1);}} style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', color:liked?'#fb7185':t.muted, fontSize:12, fontFamily:'inherit' }}>
          <Heart size={13} fill={liked?'#fb7185':'none'}/> {likes>0?likes:''}
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:4, fontSize:11, color:t.muted }}>
          <Clock size={11}/>
          {post.pinned?'1 year':daysLeft>1?`${daysLeft}d`:hoursLeft>0?`${hoursLeft}h`:'expiring'}
        </div>
      </div>
    </GCard>
  );
}

// ─── Contact Box ─────────────────────────────────────────────
function ContactBox({ siteId, t, accentColor }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!msg.trim()) return;
    setSending(true);
    await supabase.from('site_messages' as any).insert({
      site_id: siteId, sender_name: name, sender_email: email, message: msg,
    });
    setSent(true); setSending(false);
    setTimeout(() => { setSent(false); setName(''); setEmail(''); setMsg(''); }, 3000);
  };

  return (
    <GCard t={t} style={{ marginTop: 24 }}>
      <p style={{ fontSize: 13, fontWeight: 800, color: t.text, marginBottom: 12 }}>💬 Enviar mensagem</p>
      {sent ? (
        <p style={{ fontSize: 13, color: '#4ade80', textAlign: 'center', padding: '12px 0' }}>✓ Mensagem enviada!</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="Seu nome" style={{ padding:'9px 12px', borderRadius:8, border:`0.5px solid ${t.border}`, background:'rgba(255,255,255,0.08)', color:t.text, fontSize:13, outline:'none', width:'100%', boxSizing:'border-box' as const }}/>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email (opcional)" type="email" style={{ padding:'9px 12px', borderRadius:8, border:`0.5px solid ${t.border}`, background:'rgba(255,255,255,0.08)', color:t.text, fontSize:13, outline:'none', width:'100%', boxSizing:'border-box' as const }}/>
          </div>
          <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Sua mensagem…" rows={3} style={{ width:'100%', padding:'9px 12px', borderRadius:8, border:`0.5px solid ${t.border}`, background:'rgba(255,255,255,0.08)', color:t.text, fontSize:13, outline:'none', resize:'none', fontFamily:'inherit', marginBottom:8, boxSizing:'border-box' as const }}/>
          <button onClick={send} disabled={!msg.trim()||sending} style={{ width:'100%', padding:'11px', borderRadius:10, border:'none', background:accentColor, color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer' }}>
            {sending ? 'Enviando…' : 'Enviar Mensagem'}
          </button>
        </>
      )}
    </GCard>
  );
}

// ─── Main ────────────────────────────────────────────────────
export default function MiniSiteClient({ profile }: { profile: any }) {
  const { user } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [posts, setPosts]   = useState<any[]>([]);
  const [links, setLinks]   = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);

  const t = getT(profile);
  const isOwner = user?.id === profile.user_id;

  const pages: {id:string;label:string}[] = (() => { try { return JSON.parse(profile.site_pages||'[]')||[{id:'home',label:'Home'}]; } catch { return [{id:'home',label:'Home'}]; } })();
  const pageContents: Record<string,string> = (() => { try { return JSON.parse(profile.page_contents||'{}'); } catch { return {}; } })();
  const hasPagesNav = pages.length > 1;

  const photoSizePx = {sm:64,md:88,lg:120,xl:160}[(profile as any).photo_size||'md']||88;
  const photoRadius = profile.photo_shape==='square'?8:profile.photo_shape==='rounded'?20:photoSizePx/2;
  const fontFam = (profile as any).font_style==='serif'?'Georgia,serif':(profile as any).font_style==='mono'?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',system-ui,sans-serif";

  useEffect(() => {
    if (!profile?.id) return;
    supabase.from('mini_site_links').select('*').eq('site_id',profile.id).order('sort_order').then(({data})=>setLinks(data||[]));
    supabase.from('mini_site_videos').select('*').eq('site_id',profile.id).order('sort_order').then(({data})=>setVideos(data||[]));
    supabase.from('feed_posts').select('*').eq('site_id',profile.id)
      .gte('expires_at',new Date().toISOString())
      .order('pinned',{ascending:false}).order('created_at',{ascending:false}).limit(30)
      .then(({data})=>setPosts(data||[]));
  }, [profile.id]);

  const submitPost = async () => {
    if (!newPost.trim()||!profile?.id) return;
    setPosting(true);
    const exp = new Date(Date.now()+7*86400000).toISOString();
    const {data} = await supabase.from('feed_posts').insert({site_id:profile.id,text:newPost,pinned:false,expires_at:exp}).select().single();
    if (data) setPosts(p=>[data,...p]);
    setNewPost(''); setPosting(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:t.bg, color:t.text, fontFamily:fontFam, direction:'ltr' }}>

      {/* Banner */}
      {profile.banner_url&&(
        <div style={{ width:'100%', height:150, overflow:'hidden', position:'relative' }}>
          <img src={profile.banner_url} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
          <div style={{ position:'absolute', inset:0, background:`linear-gradient(to bottom,transparent 40%,${t.bg})` }}/>
        </div>
      )}

      <div style={{ maxWidth:500, margin:'0 auto', padding:'0 20px 60px', paddingTop: profile.banner_url ? 0 : 32 }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:24, position:'relative', zIndex:2,
          marginTop: profile.banner_url ? -(photoSizePx/2 + 4) : 0 }}>
          {profile.avatar_url
            ? <img src={profile.avatar_url} style={{ width:photoSizePx, height:photoSizePx, borderRadius:photoRadius, objectFit:'cover', border:`2.5px solid ${t.accent}`, display:'block', margin:'0 auto 12px' }}/>
            : <div style={{ width:photoSizePx, height:photoSizePx, borderRadius:photoSizePx/2, background:`${t.accent}22`, border:`2px solid ${t.accent}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:photoSizePx*0.38, fontWeight:900, color:t.accent, margin:'0 auto 12px' }}>{(profile.site_name||'?')[0].toUpperCase()}</div>
          }

          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, marginBottom:4 }}>
            <h1 style={{ fontSize:22, fontWeight:900, color:t.text, margin:0, fontFamily:fontFam }}>{profile.site_name||profile.slug}</h1>
            {profile.badge==='blue'&&<BadgeCheck size={18} color="#60a5fa"/>}
            {profile.badge==='gold'&&<Award size={18} color="#f59e0b"/>}
          </div>
          {profile.cv_headline&&<p style={{ fontSize:13, color:t.accent, fontWeight:600, margin:'0 0 4px', fontFamily:fontFam }}>{profile.cv_headline}</p>}
          {profile.bio&&<p style={{ fontSize:13, color:t.muted, margin:'0 0 14px', lineHeight:1.6, fontFamily:fontFam }}>{profile.bio}</p>}

          {/* Action buttons */}
          <div style={{ display:'flex', justifyContent:'center', gap:8, flexWrap:'wrap' }}>
            {isOwner&&<a href="/editor" style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 14px', borderRadius:8, background:`${t.accent}15`, border:`0.5px solid ${t.accent}30`, color:t.accent, textDecoration:'none', fontSize:12, fontWeight:700 }}><Edit size={12}/> Edit</a>}
            <button onClick={()=>navigator.share?.({url:window.location.href})} style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 12px', borderRadius:8, background:t.surface, border:`0.5px solid ${t.border}`, color:t.muted, cursor:'pointer', fontSize:12, fontFamily:fontFam }}>
              <Share2 size={12}/> Share
            </button>
          </div>
        </div>

        {/* Pages nav */}
        {hasPagesNav&&(
          <div style={{ display:'flex', gap:4, marginBottom:22, justifyContent:'center', background:t.surface, borderRadius:12, padding:4, border:`0.5px solid ${t.border}` }}>
            {pages.map(pg=>(
              <button key={pg.id} onClick={()=>setActivePage(pg.id)} style={{ flex:1, padding:'8px 10px', borderRadius:8, border:'none', cursor:'pointer', background:activePage===pg.id?t.accent:'transparent', color:activePage===pg.id?'#fff':t.muted, fontSize:13, fontWeight:700, transition:'all 0.15s', fontFamily:fontFam }}>
                {pg.label}
              </button>
            ))}
          </div>
        )}

        {/* Non-home page rich content */}
        {activePage!=='home'&&(
          <div className="rich-content" style={{ fontSize:15, lineHeight:1.8, color:t.text, marginBottom:24, fontFamily:fontFam }}
            dangerouslySetInnerHTML={{ __html:pageContents[activePage]||'<p style="opacity:0.3;text-align:center;padding:40px 0">No content yet</p>' }}
          />
        )}

        {/* HOME */}
        {activePage==='home'&&(<>

          {/* Home page content */}
          {pageContents['home']&&(
            <div className="rich-content" style={{ fontSize:15, lineHeight:1.8, color:t.text, marginBottom:20, fontFamily:fontFam }}
              dangerouslySetInnerHTML={{ __html:pageContents['home'] }}
            />
          )}

          {/* Links */}
          {links.length>0&&(
            <div style={{ marginBottom:22 }}>
              {links.map((link:any)=>(
                <a key={link.id} href={link.url} target="_blank" rel="noopener" style={{
                  display:'flex', alignItems:'center', gap:12, padding:'13px 16px', borderRadius:14, marginBottom:8,
                  background:link.color?`${link.color}12`:t.surface,
                  border:`0.5px solid ${link.color?`${link.color}35`:t.border}`,
                  textDecoration:'none', transition:'all 0.15s',
                }}>
                  <div style={{ width:32, height:32, borderRadius:9, background:link.color||t.accent, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Globe size={14} color="#fff"/>
                  </div>
                  <span style={{ flex:1, textAlign:'center', fontSize:14, fontWeight:700, color:t.text, fontFamily:fontFam }}>{link.title}</span>
                  <ExternalLink size={13} color={t.muted}/>
                </a>
              ))}
            </div>
          )}

          {/* CV */}
          {profile.show_cv&&(
            <GCard t={t} style={{ marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <span style={{ fontSize:14, fontWeight:800, color:t.text }}>📄 Resume / CV</span>
                {profile.cv_locked&&<span style={{ marginLeft:'auto', fontSize:11, color:'#f59e0b', fontWeight:700 }}>🔒 ${profile.cv_price} USDC</span>}
              </div>
              {profile.cv_headline&&<p style={{ fontSize:14, fontWeight:700, color:t.accent, margin:'0 0 4px' }}>{profile.cv_headline}</p>}
              {profile.cv_location&&<p style={{ fontSize:12, color:t.muted, margin:'0 0 10px', display:'flex', alignItems:'center', gap:4 }}><MapPin size={11}/>{profile.cv_location}</p>}
              {profile.cv_locked
                ? <button style={{ width:'100%', padding:'12px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#fff', fontWeight:800, cursor:'pointer', fontSize:14, fontFamily:fontFam }}>🔓 Unlock CV — ${profile.cv_price} USDC</button>
                : profile.cv_content&&<p style={{ fontSize:13, color:t.muted, lineHeight:1.7, whiteSpace:'pre-wrap', margin:0 }}>{profile.cv_content}</p>
              }
            </GCard>
          )}

          {/* Videos */}
          {videos.length>0&&(
            <div style={{ marginBottom:22 }}>
              <p style={{ fontSize:11, fontWeight:700, color:t.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:10 }}>Videos</p>
              {videos.map((v:any)=>(
                <GCard key={v.id} t={t} style={{ marginBottom:8, cursor:'pointer' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    {v.youtube_video_id&&<img src={`https://img.youtube.com/vi/${v.youtube_video_id}/mqdefault.jpg`} style={{ width:80, height:56, objectFit:'cover', borderRadius:8, flexShrink:0 }}/>}
                    <div style={{ flex:1 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:t.text, margin:'0 0 4px', fontFamily:fontFam }}>{v.title}</p>
                      <span style={{ fontSize:11, color:v.paywall_enabled?'#f59e0b':t.muted, fontWeight:v.paywall_enabled?700:400 }}>
                        {v.paywall_enabled?`🔒 $${v.paywall_price} USDC to watch`:'Free'}
                      </span>
                    </div>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:`${t.accent}18`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {v.paywall_enabled?<Lock size={14} color={t.accent}/>:<Play size={14} color={t.accent}/>}
                    </div>
                  </div>
                </GCard>
              ))}
            </div>
          )}

          {/* Feed — 500×500 window */}
          {profile.show_feed!==false&&(posts.length>0||isOwner)&&(
            <div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <p style={{ fontSize:11, fontWeight:700, color:t.muted, textTransform:'uppercase', letterSpacing:'0.08em', margin:0 }}>Feed</p>
                {posts.length>0&&<span style={{ fontSize:11, color:t.muted }}>{posts.length} posts</span>}
              </div>

              {/* Owner: compose */}
              {isOwner&&(
                <GCard t={t} style={{ marginBottom:10 }}>
                  <textarea value={newPost} onChange={e=>setNewPost(e.target.value)} placeholder="Write a post… (7 days)"
                    style={{ width:'100%', background:'transparent', border:'none', outline:'none', color:t.text, fontSize:13, lineHeight:1.6, resize:'none', fontFamily:fontFam, minHeight:56, boxSizing:'border-box' }}
                  />
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:8 }}>
                    <span style={{ fontSize:11, color:t.muted }}>7 days · Pin for $10 USDC</span>
                    <button onClick={submitPost} disabled={!newPost.trim()||posting} style={{ padding:'6px 16px', borderRadius:8, border:'none', background:newPost.trim()?t.accent:'rgba(128,128,128,0.2)', color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer', fontFamily:fontFam }}>
                      {posting?'…':'Publish'}
                    </button>
                  </div>
                </GCard>
              )}

              {/* Feed 500×500 scrollable window */}
              {posts.length>0&&(
                <div style={{ width:'100%', height:500, borderRadius:16, border:`0.5px solid ${t.border}`, overflow:'hidden', background:t.surface }}>
                  <div style={{ height:'100%', overflowY:'auto', padding:10, scrollbarWidth:'thin', scrollbarColor:`${t.accent}30 transparent` }}>
                    {posts.map(post=><FeedPost key={post.id} post={post} t={t}/>)}
                  </div>
                </div>
              )}
            </div>
          )}

        </>)}

        {/* Contact box */}
        {profile.contact_email && activePage === 'home' && (
          <ContactBox siteId={profile.id} t={t} accentColor={t.accent} />
        )}

        {/* Footer */}
        <div style={{ marginTop:40, paddingTop:20, borderTop:`0.5px solid ${t.border}`, textAlign:'center' }}>
          <p style={{ fontSize:10, color:t.muted, opacity:0.4, margin:0, fontFamily:'monospace' }}>
            <a href="/" style={{ color:'inherit', textDecoration:'none' }}>TrustBank</a> · {profile.slug}.trustbank.xyz
          </p>
        </div>
      </div>

      <style>{`
        .rich-content{direction:ltr;text-align:left;}
        .rich-content h1{font-size:clamp(20px,4vw,28px);font-weight:900;margin:16px 0 8px;line-height:1.2;}
        .rich-content h2{font-size:clamp(17px,3vw,22px);font-weight:800;margin:14px 0 6px;}
        .rich-content p{margin:0 0 10px;}
        .rich-content ul,.rich-content ol{padding-left:20px;margin:8px 0;}
        .rich-content img{max-width:100%;border-radius:8px;margin:8px 0;}
        .rich-content iframe{max-width:100%;border-radius:8px;margin:8px 0;}
        .rich-content blockquote{border-left:3px solid;padding-left:12px;opacity:.8;margin:10px 0;font-style:italic;}
        .rich-content a{text-decoration:underline;}
        .rich-content pre{background:rgba(0,0,0,0.15);border-radius:6px;padding:10px;font-family:monospace;font-size:12px;overflow-x:auto;}
        .rich-content hr{border:none;border-top:0.5px solid rgba(128,128,128,0.3);margin:16px 0;}
      `}</style>
    </div>
  );
}
