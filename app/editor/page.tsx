'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile, useSiteLinks, useSiteVideos, useFeedPosts } from '@/hooks/useMiniSite';
import { supabase } from '@/lib/supabase';
import { slugPrice } from '@/lib/slug';
import { THEMES } from '@/lib/themes';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { Navbar } from '@/components/layout/Navbar';
import {
  Save, Eye, Upload, Plus, X, Loader2, Check,
  User, Palette, Link2, Video, FileText, Hash,
  Image as Img, Shield, Sun, Moon, ExternalLink,
  Trash2, Send, Zap, Globe, MapPin, Camera
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ACCENT_PRESETS = [
  '#818cf8','#a78bfa','#f472b6','#34d399','#fbbf24',
  '#60a5fa','#f87171','#22d3ee','#fb923c','#a3e635',
  '#e879f9','#2dd4bf','#facc15','#f97316','#06b6d4',
];

function extractYtId(url: string) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? m[1] : null;
}

export default function EditorPage() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, update: save } = useProfile(user);
  const { links, addLink, deleteLink } = useSiteLinks(profile?.id);
  const { videos, addVideo, deleteVideo } = useSiteVideos(profile?.id);
  const { posts: rawPosts, addPost } = useFeedPosts(profile?.id);
  const router = useRouter();

  // Profile state
  const [siteName, setSiteName] = useState('');
  const [bio, setBio]           = useState('');
  const [avatarUrl, setAvatar]  = useState('');
  const [bannerUrl, setBanner]  = useState('');
  const [wallet, setWallet]     = useState('');
  const [email, setEmail]       = useState('');
  const [published, setPub]     = useState(false);

  // Theme state
  const [themeId, setThemeId]   = useState('dark');
  const [accent, setAccent]     = useState('#818cf8');
  const [photoShape, setShape]  = useState('round');
  const [photoSize, setSize]    = useState<'sm'|'md'|'lg'|'xl'>('md');
  const [fontStyle, setFont]    = useState('sans');
  const [textColor, setTColor]  = useState('');
  const [darkMode, setDarkMode] = useState(true);

  // Pages
  const [pages, setPages]       = useState([{id:'home',label:'Home'}]);
  const [contents, setContents] = useState<Record<string,string>>({});
  const [pageWidth, setWidth]   = useState(680);

  // CV
  const [showCv, setShowCv]     = useState(false);
  const [cvLocked, setCvLock]   = useState(false);
  const [cvPrice, setCvPrice]   = useState('20');
  const [cvHead, setCvHead]     = useState('');
  const [cvLoc, setCvLoc]       = useState('');
  const [cvBody, setCvBody]     = useState('');

  // Feed
  const [showFeed, setShowFeed] = useState(true);
  const [posts, setPosts]       = useState<any[]>([]);
  const [feedText, setFeedText] = useState('');
  const [posting, setPosting]   = useState(false);

  // Links form
  const [lTitle, setLTitle]     = useState('');
  const [lUrl, setLUrl]         = useState('');
  const [lColor, setLColor]     = useState('');

  // Video form
  const [ytUrl, setYtUrl]       = useState('');
  const [ytTitle, setYtTitle]   = useState('');
  const [pwOn, setPwOn]         = useState(false);
  const [pwAmt, setPwAmt]       = useState('4.99');

  // UI
  const [tab, setTab]           = useState('profile');
  const [saving, setSaving]     = useState(false);
  const [savedOk, setSavedOk]   = useState(false);
  const [upA, setUpA]           = useState(false);
  const [upB, setUpB]           = useState(false);
  const dirty                   = useRef(false);

  useEffect(() => { setPosts(rawPosts); }, [rawPosts]);

  useEffect(() => {
    if (!profile) return;
    setSiteName(profile.site_name || '');
    setBio(profile.bio || '');
    setAvatar(profile.avatar_url || '');
    setBanner((profile as any).banner_url || '');
    setWallet((profile as any).wallet_address || '');
    setEmail((profile as any).contact_email || '');
    setPub(profile.published || false);
    setThemeId(profile.theme || 'dark');
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
    try { const p = JSON.parse((profile as any).site_pages || '[]'); setPages(p.length ? p : [{id:'home',label:'Home'}]); } catch {}
    try { setContents(JSON.parse((profile as any).page_contents || '{}')); } catch {}
    if ((profile as any).page_width) setWidth((profile as any).page_width);
    // set dark mode based on theme
    const th = THEMES.find(t => t.id === (profile.theme || 'dark'));
    setDarkMode(th?.category !== 'light');
  }, [profile]);

  const upload = async (file: File, folder: string) => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user!.id}/${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('platform-assets').upload(path, file, { upsert: true });
    if (error) throw error;
    return supabase.storage.from('platform-assets').getPublicUrl(path).data.publicUrl;
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    await save({
      site_name: siteName, bio, avatar_url: avatarUrl, banner_url: bannerUrl,
      theme: themeId, accent_color: accent, photo_shape: photoShape,
      photo_size: photoSize, font_style: fontStyle, text_color: textColor || null,
      show_cv: showCv, cv_locked: cvLocked, cv_price: parseFloat(cvPrice) || 20,
      cv_headline: cvHead, cv_content: cvBody, cv_location: cvLoc,
      show_feed: showFeed, wallet_address: wallet, contact_email: email,
      published,
      site_pages: JSON.stringify(pages.length ? pages : [{id:'home',label:'Home'}]),
      page_contents: JSON.stringify(contents),
      page_width: pageWidth, platform: 'trustbank',
    } as any);
    dirty.current = false;
    setSavedOk(true); setTimeout(() => setSavedOk(false), 2500);
    setSaving(false);
  };

  if (authLoading || profileLoading) return (
    <div style={{ minHeight:'100vh', background:'#0d1117', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Loader2 size={32} color="#818cf8" className="animate-spin" />
    </div>
  );
  if (!user) { router.push('/login'); return null; }

  const slug = profile?.slug || '';
  const curTheme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const sizePx = {sm:56,md:80,lg:112,xl:148}[photoSize]||80;
  const fontFam = fontStyle==='serif'?'Georgia,serif':fontStyle==='mono'?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',system-ui,sans-serif";
  const shapeR = photoShape==='round'?'50%':photoShape==='square'?'8px':'20px';

  // CSS vars based on editor dark mode (not theme)
  const ed = {
    bg: darkMode ? '#0d1117' : '#f6f8fa',
    bg2: darkMode ? '#161b22' : '#ffffff',
    border: darkMode ? '#30363d' : '#d0d7de',
    text: darkMode ? '#e6edf3' : '#24292f',
    text2: darkMode ? '#7d8590' : '#57606a',
    card: darkMode ? '#161b22' : '#ffffff',
    accent: accent,
  };

  const inp: any = {
    width:'100%', padding:'9px 13px', borderRadius:10,
    border:`1px solid ${ed.border}`, background:ed.bg2,
    color:ed.text, fontSize:14, outline:'none',
    boxSizing:'border-box', fontFamily:'inherit',
    transition:'border 0.15s',
  };
  const lbl: any = {
    fontSize:11, fontWeight:700, color:ed.text2,
    textTransform:'uppercase', letterSpacing:'0.07em',
    display:'block', marginBottom:6,
  };
  const card: any = {
    background:ed.card, border:`1px solid ${ed.border}`,
    borderRadius:16, padding:20, marginBottom:14,
  };
  const tog = (on:boolean): any => ({
    width:44, height:24, borderRadius:12,
    background:on?accent:'rgba(128,128,128,0.25)',
    border:'none', cursor:'pointer', position:'relative', transition:'all 0.2s', flexShrink:0,
  });
  const dot = (on:boolean): any => ({
    position:'absolute', top:4, width:16, height:16,
    borderRadius:'50%', background:'white', transition:'all 0.2s', left:on?24:4,
  });

  const TABS = [
    {id:'profile', icon:User,    label:'Perfil'},
    {id:'theme',   icon:Palette, label:'Tema'},
    {id:'links',   icon:Link2,   label:'Links'},
    {id:'videos',  icon:Video,   label:'Vídeos'},
    {id:'cv',      icon:FileText,label:'CV'},
    {id:'feed',    icon:Hash,    label:'Feed'},
    {id:'pages',   icon:Img,     label:'Páginas'},
    {id:'verify',  icon:Shield,  label:'Verificar'},
  ];

  return (
    <div style={{
      minHeight:'100vh', background:ed.bg, color:ed.text,
      fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif", transition:'background 0.3s',
      ['--bg' as any]:ed.bg, ['--bg2' as any]:ed.bg2, ['--border' as any]:ed.border,
      ['--text' as any]:ed.text, ['--text2' as any]:ed.text2, ['--accent' as any]:accent,
    }}>
      <Navbar />

      {/* ── Top bar ── */}
      <div style={{ position:'sticky', top:60, zIndex:40, background:ed.bg, borderBottom:`1px solid ${ed.border}` }}>
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 20px', display:'flex', alignItems:'center', height:52, gap:4 }}>

          {/* Tab pills */}
          {TABS.map(tb => (
            <button key={tb.id} onClick={()=>setTab(tb.id)} style={{
              display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8,
              border:'none', background:tab===tb.id?`${accent}20`:'transparent',
              color:tab===tb.id?accent:ed.text2, cursor:'pointer', fontSize:12, fontWeight:600, whiteSpace:'nowrap',
            }}>
              <tb.icon size={13}/> {tb.label}
            </button>
          ))}

          <div style={{flex:1}}/>

          {/* Dark/light toggle */}
          <button onClick={()=>setDarkMode(d=>!d)} style={{
            display:'flex', alignItems:'center', gap:4, padding:'6px 10px', borderRadius:8,
            border:`1px solid ${ed.border}`, background:'transparent',
            color:ed.text2, cursor:'pointer', fontSize:12,
          }}>
            {darkMode ? <Sun size={14}/> : <Moon size={14}/>}
          </button>

          {/* Preview */}
          {slug && (
            <Link href={`/s/${slug}`} target="_blank" style={{
              display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8,
              border:`1px solid ${ed.border}`, color:'#4ade80', textDecoration:'none', fontSize:12, fontWeight:600,
            }}>
              <Eye size={13}/> Preview
            </Link>
          )}

          {/* Save */}
          <button onClick={handleSave} disabled={saving} style={{
            display:'flex', alignItems:'center', gap:5, padding:'6px 14px', borderRadius:8,
            border:'none', background:savedOk?'rgba(74,222,128,0.15)':accent,
            color:savedOk?'#4ade80':'#fff', cursor:'pointer', fontSize:12, fontWeight:700,
          }}>
            {saving?<Loader2 size={13} className="animate-spin"/>:savedOk?<Check size={13}/>:<Save size={13}/>}
            {saving?'Salvando…':savedOk?'Salvo!':'Salvar'}
          </button>

          {/* Publish */}
          <button onClick={async()=>{ setPub(true); await save({published:true} as any); }} style={{
            padding:'6px 14px', borderRadius:8, border:'none', cursor:'pointer',
            background:published?'rgba(74,222,128,0.12)':'linear-gradient(135deg,#f59e0b,#d97706)',
            color:published?'#4ade80':'#fff', fontSize:12, fontWeight:800,
          }}>
            {published?'✓ Publicado':'Publicar'}
          </button>
        </div>
      </div>

      {/* ── Main layout: content + preview sidebar ── */}
      <div style={{ maxWidth:1400, margin:'0 auto', padding:'24px 20px', display:'grid', gridTemplateColumns:'1fr 320px', gap:24, alignItems:'start' }}>

        {/* ── Left: Editor tabs ── */}
        <div>

          {/* PROFILE */}
          {tab==='profile' && (
            <div>
              <div style={card}>
                <p style={{fontSize:15,fontWeight:800,color:ed.text,marginBottom:18}}>Perfil</p>

                {/* Avatar + banner */}
                <div style={{display:'flex',gap:14,marginBottom:18}}>
                  {/* Avatar */}
                  <div style={{position:'relative',flexShrink:0}}>
                    <div style={{
                      width:80, height:80,
                      borderRadius:photoShape==='round'?'50%':photoShape==='square'?'10px':'22px',
                      overflow:'hidden', background:`${accent}20`,
                      border:`2px solid ${accent}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:32, fontWeight:900, color:accent,
                    }}>
                      {avatarUrl
                        ? <img src={avatarUrl} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                        : (siteName||'?')[0]
                      }
                    </div>
                    <label style={{
                      position:'absolute', bottom:-6, right:-6,
                      width:26, height:26, borderRadius:'50%',
                      background:accent, display:'flex', alignItems:'center',
                      justifyContent:'center', cursor:'pointer', border:`2px solid ${ed.bg}`,
                    }}>
                      {upA?<Loader2 size={12} color="#fff"/>:<Camera size={12} color="#fff"/>}
                      <input type="file" accept="image/*" style={{display:'none'}} onChange={async e=>{
                        const f=e.target.files?.[0]; if(!f)return;
                        setUpA(true);
                        try { const url=await upload(f,'avatars'); setAvatar(url); dirty.current=true; }
                        catch(err){ alert('Erro ao fazer upload. Verifique se o bucket platform-assets existe no Supabase Storage.'); }
                        setUpA(false);
                      }}/>
                    </label>
                  </div>

                  <div style={{flex:1}}>
                    <label style={lbl}>Nome de exibição</label>
                    <input value={siteName} onChange={e=>{setSiteName(e.target.value);dirty.current=true;}} style={{...inp,marginBottom:10}} placeholder="Seu nome"/>

                    {/* Banner upload */}
                    <label style={{
                      display:'flex', alignItems:'center', gap:8, cursor:'pointer',
                      padding:'9px 12px', borderRadius:10, border:`1px dashed ${ed.border}`,
                      background:ed.bg, fontSize:13, color:ed.text2,
                    }}>
                      {upB?<Loader2 size={14}/>:<Upload size={14} color={accent}/>}
                      <span style={{color:accent,fontWeight:600,fontSize:13}}>
                        {bannerUrl?'✓ Banner · clique para trocar':'Upload de Banner'}
                      </span>
                      <input type="file" accept="image/*" style={{display:'none'}} onChange={async e=>{
                        const f=e.target.files?.[0]; if(!f)return;
                        setUpB(true);
                        try { const url=await upload(f,'banners'); setBanner(url); dirty.current=true; }
                        catch(err){ alert('Erro ao fazer upload. Verifique se o bucket platform-assets existe no Supabase Storage.'); }
                        setUpB(false);
                      }}/>
                    </label>
                    {bannerUrl&&<button onClick={()=>{setBanner('');dirty.current=true;}} style={{fontSize:11,color:'#ef4444',background:'none',border:'none',cursor:'pointer',marginTop:4}}>Remover banner</button>}
                  </div>
                </div>

                <label style={lbl}>Bio</label>
                <textarea value={bio} onChange={e=>{setBio(e.target.value);dirty.current=true;}} style={{...inp,resize:'vertical',minHeight:72,marginBottom:12}} placeholder="Descrição curta…"/>

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                  <div>
                    <label style={lbl}>Carteira Polygon</label>
                    <input value={wallet} onChange={e=>{setWallet(e.target.value);dirty.current=true;}} style={{...inp,fontFamily:"'JetBrains Mono',monospace"}} placeholder="0x…"/>
                  </div>
                  <div>
                    <label style={lbl}>Email de contato</label>
                    <input value={email} onChange={e=>{setEmail(e.target.value);dirty.current=true;}} type="email" style={inp} placeholder="você@email.com"/>
                  </div>
                </div>

                <div style={{padding:'10px 14px',borderRadius:10,background:ed.bg,border:`1px solid ${ed.border}`,fontSize:13}}>
                  <span style={{color:ed.text2}}>Slug: </span>
                  <span style={{color:accent,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{slug}.trustbank.xyz</span>
                  <span style={{color:ed.text2,fontSize:11,marginLeft:8}}>· Para mudar vá em Vault</span>
                </div>
              </div>
            </div>
          )}

          {/* THEME */}
          {tab==='theme' && (
            <div>
              {/* Theme grid with ThemeCard style */}
              <div style={{...card,marginBottom:14}}>
                <p style={{fontSize:15,fontWeight:800,color:ed.text,marginBottom:4}}>Tema Visual</p>
                <p style={{fontSize:12,color:ed.text2,marginBottom:16}}>15 dark + 15 light — clique para aplicar</p>

                <p style={{fontSize:10,fontWeight:700,color:ed.text2,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>🌑 Dark</p>
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,marginBottom:16}}>
                  {THEMES.filter(t=>t.category!=='light').map(th=>(
                    <button key={th.id} onClick={()=>{setThemeId(th.id);setAccent(th.accent);dirty.current=true;}} style={{
                      borderRadius:12, overflow:'hidden', padding:0, cursor:'pointer',
                      border:themeId===th.id?`2px solid white`:`1.5px solid transparent`,
                      boxShadow:themeId===th.id?`0 0 16px ${th.accent}60`:'0 0 0 1px rgba(255,255,255,0.06)',
                      background:th.previewBg, transition:'all 0.15s',
                    }}>
                      <div style={{padding:'10px 8px 4px',background:th.previewBg}}>
                        <div style={{width:16,height:16,borderRadius:'50%',background:th.accent,margin:'0 auto 5px'}}/>
                        <div style={{height:2,background:th.previewText,opacity:0.4,borderRadius:2,marginBottom:3}}/>
                        <div style={{height:5,background:th.accent,opacity:0.7,borderRadius:2}}/>
                      </div>
                      <div style={{padding:'0 6px 6px'}}>
                        <p style={{fontSize:9,fontWeight:700,color:th.previewText,margin:0}}>{th.emoji} {th.label}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <p style={{fontSize:10,fontWeight:700,color:ed.text2,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>🤍 Light</p>
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
                  {THEMES.filter(t=>t.category==='light').map(th=>(
                    <button key={th.id} onClick={()=>{setThemeId(th.id);setAccent(th.accent);dirty.current=true;}} style={{
                      borderRadius:12, overflow:'hidden', padding:0, cursor:'pointer',
                      border:themeId===th.id?`2px solid ${th.accent}`:`1.5px solid rgba(0,0,0,0.08)`,
                      boxShadow:themeId===th.id?`0 0 12px ${th.accent}40`:'none',
                      background:th.previewBg, transition:'all 0.15s',
                    }}>
                      <div style={{padding:'10px 8px 4px'}}>
                        <div style={{width:16,height:16,borderRadius:'50%',background:th.accent,margin:'0 auto 5px'}}/>
                        <div style={{height:2,background:th.previewText,opacity:0.4,borderRadius:2,marginBottom:3}}/>
                        <div style={{height:5,background:th.accent,opacity:0.7,borderRadius:2}}/>
                      </div>
                      <div style={{padding:'0 6px 6px'}}>
                        <p style={{fontSize:9,fontWeight:700,color:th.previewText,margin:0}}>{th.emoji} {th.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent colors */}
              <div style={card}>
                <p style={{fontSize:13,fontWeight:800,color:ed.text,marginBottom:12}}>Cor de Destaque</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:8,alignItems:'center',marginBottom:10}}>
                  {ACCENT_PRESETS.map(c=>(
                    <button key={c} onClick={()=>{setAccent(c);dirty.current=true;}} style={{
                      width:30,height:30,borderRadius:'50%',background:c,cursor:'pointer',
                      border:accent===c?'3px solid white':'1.5px solid rgba(0,0,0,0.1)',
                      boxShadow:accent===c?`0 0 8px ${c}`:'none',
                    }}/>
                  ))}
                  <input type="color" value={accent} onChange={e=>{setAccent(e.target.value);dirty.current=true;}} style={{width:30,height:30,borderRadius:'50%',border:'none',cursor:'pointer',padding:0}}/>
                </div>
              </div>

              {/* Photo + Font */}
              <div style={{...card,display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <div>
                  <p style={{fontSize:13,fontWeight:800,color:ed.text,marginBottom:10}}>Formato da Foto</p>
                  {[['round','● Redonda'],['rounded','▢ Arredondada'],['square','■ Quadrada']].map(([v,l])=>(
                    <button key={v} onClick={()=>{setShape(v);dirty.current=true;}} style={{
                      display:'block',width:'100%',textAlign:'left',padding:'8px 10px',borderRadius:8,
                      border:`1px solid ${photoShape===v?accent:ed.border}`,
                      background:photoShape===v?`${accent}12`:'transparent',
                      color:photoShape===v?accent:ed.text2,cursor:'pointer',fontSize:12,fontWeight:600,marginBottom:4,
                    }}>{l}</button>
                  ))}
                </div>
                <div>
                  <p style={{fontSize:13,fontWeight:800,color:ed.text,marginBottom:10}}>Tamanho da Foto</p>
                  {([['sm','Pequeno 56px'],['md','Médio 80px'],['lg','Grande 112px'],['xl','XL 148px']] as const).map(([v,l])=>(
                    <button key={v} onClick={()=>{setSize(v);dirty.current=true;}} style={{
                      display:'block',width:'100%',textAlign:'left',padding:'8px 10px',borderRadius:8,
                      border:`1px solid ${photoSize===v?accent:ed.border}`,
                      background:photoSize===v?`${accent}12`:'transparent',
                      color:photoSize===v?accent:ed.text2,cursor:'pointer',fontSize:12,fontWeight:600,marginBottom:4,
                    }}>{l}</button>
                  ))}
                </div>
              </div>

              {/* Font + Text color */}
              <div style={{...card,display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <div>
                  <p style={{fontSize:13,fontWeight:800,color:ed.text,marginBottom:10}}>Fonte</p>
                  {[['sans','Modern Sans'],['serif','Classic Serif'],['mono','Monospace']].map(([v,l])=>(
                    <button key={v} onClick={()=>{setFont(v);dirty.current=true;}} style={{
                      display:'block',width:'100%',textAlign:'left',padding:'8px 10px',borderRadius:8,
                      border:`1px solid ${fontStyle===v?accent:ed.border}`,
                      background:fontStyle===v?`${accent}12`:'transparent',
                      color:fontStyle===v?accent:ed.text2,cursor:'pointer',fontSize:12,fontWeight:600,marginBottom:4,
                      fontFamily:v==='serif'?'Georgia,serif':v==='mono'?"'JetBrains Mono',monospace":'inherit',
                    }}>{l}</button>
                  ))}
                </div>
                <div>
                  <p style={{fontSize:13,fontWeight:800,color:ed.text,marginBottom:10}}>Cor do Texto</p>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>
                    {['','#f1f5f9','#ffffff','#fef3c7','#dcfce7','#e0f2fe','#f3e8ff','#0f172a','#1c1917'].map(col=>(
                      <button key={col||'auto'} onClick={()=>{setTColor(col);dirty.current=true;}} title={col||'Auto'} style={{
                        width:24,height:24,borderRadius:'50%',cursor:'pointer',
                        background:col||`linear-gradient(135deg,#818cf8,#f472b6,#fbbf24)`,
                        border:textColor===col?'3px solid white':'1.5px solid rgba(128,128,128,0.3)',
                      }}/>
                    ))}
                  </div>
                  {textColor&&<button onClick={()=>{setTColor('');dirty.current=true;}} style={{fontSize:11,color:accent,background:'none',border:'none',cursor:'pointer',fontWeight:700}}>↩ Auto</button>}
                  <p style={{fontSize:10,color:ed.text2,marginTop:4}}>Sobrescreve cor do tema</p>
                </div>
              </div>
            </div>
          )}

          {/* LINKS */}
          {tab==='links' && (
            <div style={card}>
              <p style={{fontSize:15,fontWeight:800,color:ed.text,marginBottom:16}}>Links & Redes Sociais</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:8,alignItems:'end',marginBottom:10}}>
                <div>
                  <label style={lbl}>Título</label>
                  <input value={lTitle} onChange={e=>setLTitle(e.target.value)} style={inp} placeholder="Instagram"/>
                </div>
                <div>
                  <label style={lbl}>URL</label>
                  <input value={lUrl} onChange={e=>setLUrl(e.target.value)} style={inp} placeholder="https://…"/>
                </div>
                <div>
                  <label style={lbl}>Cor</label>
                  <input type="color" value={lColor||accent} onChange={e=>setLColor(e.target.value)} style={{width:44,height:40,borderRadius:10,border:`1px solid ${ed.border}`,cursor:'pointer',padding:2,background:'transparent'}}/>
                </div>
              </div>
              <button onClick={async()=>{
                if(!lTitle||!lUrl||!profile?.id)return;
                await addLink({title:lTitle,url:lUrl,icon:'link',color:lColor||null,sort_order:links.length});
                setLTitle('');setLUrl('');setLColor('');
              }} style={{display:'flex',alignItems:'center',gap:6,padding:'9px 16px',borderRadius:10,border:'none',background:accent,color:'#fff',cursor:'pointer',fontWeight:700,fontSize:13,marginBottom:16}}>
                <Plus size={14}/> Adicionar Link
              </button>
              {links.map((l:any)=>(
                <div key={l.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:12,background:`${l.color||accent}10`,border:`1px solid ${l.color||accent}25`,marginBottom:6}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:l.color||accent,flexShrink:0}}/>
                  <span style={{flex:1,fontSize:14,fontWeight:700,color:ed.text}}>{l.title}</span>
                  <span style={{fontSize:11,color:ed.text2,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.url}</span>
                  <button onClick={()=>deleteLink(l.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',opacity:0.7}}><X size={14}/></button>
                </div>
              ))}
              {links.length===0&&<p style={{textAlign:'center',padding:'24px 0',color:ed.text2,fontSize:13}}>Nenhum link ainda</p>}
            </div>
          )}

          {/* VIDEOS */}
          {tab==='videos' && (
            <div style={card}>
              <p style={{fontSize:15,fontWeight:800,color:ed.text,marginBottom:16}}>Vídeos do YouTube</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                <div>
                  <label style={lbl}>URL do YouTube</label>
                  <input value={ytUrl} onChange={e=>setYtUrl(e.target.value)} style={inp} placeholder="https://youtube.com/watch?v=…"/>
                </div>
                <div>
                  <label style={lbl}>Título</label>
                  <input value={ytTitle} onChange={e=>setYtTitle(e.target.value)} style={inp} placeholder="Meu vídeo"/>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 14px',borderRadius:10,background:ed.bg,border:`1px solid ${ed.border}`,marginBottom:10}}>
                <div>
                  <p style={{fontSize:13,fontWeight:700,color:ed.text,margin:0}}>Paywall</p>
                  <p style={{fontSize:11,color:ed.text2,margin:'2px 0 0'}}>Fãs pagam USDC · você fica com 70%</p>
                </div>
                <button onClick={()=>setPwOn(p=>!p)} style={tog(pwOn)}><div style={dot(pwOn)}/></button>
              </div>
              {pwOn&&<>
                <label style={lbl}>Preço (USDC)</label>
                <input value={pwAmt} onChange={e=>setPwAmt(e.target.value)} type="number" step="0.01" min="0.5" style={{...inp,marginBottom:10}}/>
              </>}
              <button onClick={async()=>{
                if(!ytUrl||!profile?.id)return;
                const ytId=extractYtId(ytUrl);
                if(!ytId){alert('URL inválida');return;}
                await addVideo({youtube_video_id:ytId,title:ytTitle||'Vídeo',paywall_enabled:pwOn,paywall_price:parseFloat(pwAmt)||4.99,sort_order:videos.length});
                setYtUrl('');setYtTitle('');
              }} style={{display:'flex',alignItems:'center',gap:6,padding:'9px 16px',borderRadius:10,border:'none',background:accent,color:'#fff',cursor:'pointer',fontWeight:700,fontSize:13,marginBottom:16}}>
                <Plus size={14}/> Adicionar Vídeo
              </button>
              {videos.map((v:any)=>(
                <div key={v.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:12,background:ed.bg,border:`1px solid ${ed.border}`,marginBottom:6}}>
                  {v.youtube_video_id&&<img src={`https://img.youtube.com/vi/${v.youtube_video_id}/default.jpg`} style={{width:52,height:36,objectFit:'cover',borderRadius:6,flexShrink:0}}/>}
                  <span style={{flex:1,fontSize:13,fontWeight:600,color:ed.text}}>{v.title}</span>
                  {v.paywall_enabled&&<span style={{fontSize:11,color:'#f59e0b',fontWeight:700}}>🔒 ${v.paywall_price}</span>}
                  <button onClick={()=>deleteVideo(v.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',opacity:0.7}}><X size={14}/></button>
                </div>
              ))}
            </div>
          )}

          {/* CV */}
          {tab==='cv' && (
            <div style={card}>
              <p style={{fontSize:15,fontWeight:800,color:ed.text,marginBottom:14}}>CV / Currículo</p>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 14px',borderRadius:10,background:ed.bg,border:`1px solid ${ed.border}`,marginBottom:10}}>
                <p style={{fontSize:13,fontWeight:700,color:ed.text,margin:0}}>Mostrar CV no site</p>
                <button onClick={()=>{setShowCv(p=>!p);dirty.current=true;}} style={tog(showCv)}><div style={dot(showCv)}/></button>
              </div>
              {showCv&&<>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 14px',borderRadius:10,background:ed.bg,border:`1px solid ${ed.border}`,marginBottom:10}}>
                  <div>
                    <p style={{fontSize:13,fontWeight:700,color:ed.text,margin:0}}>Bloquear · pagar para ver</p>
                    <p style={{fontSize:11,color:ed.text2,margin:'2px 0 0'}}>Empresas pagam · você fica com 50%</p>
                  </div>
                  <button onClick={()=>{setCvLock(p=>!p);dirty.current=true;}} style={tog(cvLocked)}><div style={dot(cvLocked)}/></button>
                </div>
                {cvLocked&&<>
                  <label style={lbl}>Preço (USDC)</label>
                  <input value={cvPrice} onChange={e=>{setCvPrice(e.target.value);dirty.current=true;}} type="number" min="1" style={{...inp,marginBottom:10}}/>
                </>}
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                  <div><label style={lbl}>Cargo / Headline</label><input value={cvHead} onChange={e=>{setCvHead(e.target.value);dirty.current=true;}} style={inp} placeholder="CEO na Empresa X"/></div>
                  <div><label style={lbl}>Localização</label><input value={cvLoc} onChange={e=>{setCvLoc(e.target.value);dirty.current=true;}} style={inp} placeholder="SP · Remote"/></div>
                </div>
                <label style={lbl}>Conteúdo do CV</label>
                <textarea value={cvBody} onChange={e=>{setCvBody(e.target.value);dirty.current=true;}} style={{...inp,resize:'vertical',minHeight:140}} placeholder="Experiência, educação, habilidades…"/>
              </>}
            </div>
          )}

          {/* FEED */}
          {tab==='feed' && (
            <div>
              <div style={card}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <p style={{fontSize:15,fontWeight:800,color:ed.text,margin:0}}>Feed (7 dias)</p>
                    <p style={{fontSize:12,color:ed.text2,marginTop:4}}>Posts expiram em 7 dias · janela 500×500 no site</p>
                  </div>
                  <button onClick={()=>{setShowFeed(p=>!p);dirty.current=true;}} style={tog(showFeed)}><div style={dot(showFeed)}/></button>
                </div>
              </div>
              <div style={card}>
                <p style={{fontSize:13,fontWeight:800,color:ed.text,marginBottom:10}}>✍️ Novo Post</p>
                <textarea value={feedText} onChange={e=>setFeedText(e.target.value)} placeholder="O que você quer compartilhar?" style={{...inp,resize:'vertical',minHeight:80,marginBottom:10}}/>
                <div style={{display:'flex',justifyContent:'flex-end'}}>
                  <button onClick={async()=>{
                    if(!feedText.trim()||!profile?.id)return;
                    setPosting(true);
                    await addPost({text:feedText,pinned:false,expires_at:new Date(Date.now()+7*86400000).toISOString()});
                    setFeedText(''); setPosting(false);
                  }} disabled={!feedText.trim()||posting} style={{display:'flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:9,border:'none',background:feedText.trim()?accent:'rgba(128,128,128,0.2)',color:'#fff',cursor:feedText.trim()?'pointer':'not-allowed',fontWeight:700,fontSize:13}}>
                    {posting?<Loader2 size={14} className="animate-spin"/>:<Send size={14}/>} Publicar
                  </button>
                </div>
              </div>
              <div style={card}>
                <p style={{fontSize:11,fontWeight:700,color:ed.text2,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:12}}>Posts publicados ({posts.length})</p>
                {posts.length===0&&<p style={{textAlign:'center',padding:'20px 0',color:ed.text2,fontSize:13}}>Nenhum post ainda</p>}
                {posts.map((p:any)=>(
                  <div key={p.id} style={{padding:'10px 14px',borderRadius:10,background:ed.bg,border:`1px solid ${ed.border}`,marginBottom:8}}>
                    {p.pinned&&<p style={{fontSize:10,color:accent,fontWeight:700,marginBottom:4}}>📌 FIXADO</p>}
                    <p style={{fontSize:13,color:ed.text,margin:0,whiteSpace:'pre-wrap'}}>{p.text}</p>
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:8,paddingTop:6,borderTop:`1px solid ${ed.border}`}}>
                      <span style={{fontSize:10,color:ed.text2}}>
                        {new Date(p.created_at).toLocaleDateString('pt-BR')} · expira {new Date(p.expires_at).toLocaleDateString('pt-BR')}
                      </span>
                      <button onClick={async()=>{await supabase.from('feed_posts').delete().eq('id',p.id);setPosts(prev=>prev.filter((x:any)=>x.id!==p.id));}} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',opacity:0.7}}><Trash2 size={12}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAGES */}
          {tab==='pages' && (
            <div>
              <div style={card}>
                <p style={{fontSize:15,fontWeight:800,color:ed.text,marginBottom:6}}>Páginas do Site</p>
                <p style={{fontSize:12,color:ed.text2,marginBottom:14}}>Até 3 páginas · navegação no topo do mini site</p>
                {pages.map((pg,idx)=>(
                  <div key={pg.id} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                    <div style={{width:24,height:24,borderRadius:6,background:`${accent}18`,border:`1px solid ${accent}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:accent,flexShrink:0}}>{idx+1}</div>
                    <input value={pg.label} onChange={e=>{setPages(prev=>prev.map(p=>p.id===pg.id?{...p,label:e.target.value}:p));dirty.current=true;}} style={{...inp,marginBottom:0,flex:1}} placeholder={idx===0?'Home':`Página ${idx+1}`}/>
                    {idx>0&&<button onClick={()=>{setPages(prev=>prev.filter(p=>p.id!==pg.id));dirty.current=true;}} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',opacity:0.7}}><X size={14}/></button>}
                  </div>
                ))}
                {pages.length<3&&<button onClick={()=>{setPages(prev=>[...prev,{id:`p_${Date.now()}`,label:`Página ${prev.length+1}`}]);dirty.current=true;}} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:8,border:`1px dashed ${ed.border}`,background:'transparent',color:ed.text2,cursor:'pointer',fontSize:13,fontWeight:600,marginTop:8}}>
                  <Plus size={13}/> Adicionar Página
                </button>}
              </div>

              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14,padding:'10px 14px',borderRadius:10,background:ed.card,border:`1px solid ${ed.border}`}}>
                <span style={{fontSize:12,fontWeight:700,color:ed.text2,whiteSpace:'nowrap'}}>Largura:</span>
                <input type="range" min={320} max={1200} value={pageWidth} onChange={e=>{setWidth(Number(e.target.value));dirty.current=true;}} style={{flex:1,accentColor:accent}}/>
                <span style={{fontSize:12,fontFamily:'monospace',color:accent,minWidth:50}}>{pageWidth}px</span>
              </div>

              {pages.map(pg=>(
                <div key={pg.id} style={{...card,marginBottom:14}}>
                  <p style={{fontSize:14,fontWeight:800,color:ed.text,marginBottom:12}}>✏️ {pg.label}</p>
                  <RichTextEditor value={contents[pg.id]||''} onChange={v=>{setContents(prev=>({...prev,[pg.id]:v}));dirty.current=true;}} placeholder={`Conteúdo para "${pg.label}"…`}/>
                </div>
              ))}
            </div>
          )}

          {/* VERIFY */}
          {tab==='verify' && (
            <div style={card}>
              <p style={{fontSize:15,fontWeight:800,color:ed.text,marginBottom:12}}>Verificação YouTube</p>
              <p style={{fontSize:13,color:ed.text2,lineHeight:1.7,marginBottom:12}}>
                Adicione o link <code style={{color:accent,background:`${accent}12`,padding:'2px 6px',borderRadius:4}}>{slug?`trustbank.xyz/s/${slug}`:'seu site'}</code> na descrição do seu canal YouTube, depois clique em verificar.
              </p>
              <div style={{padding:'14px',borderRadius:10,background:ed.bg,border:`1px solid ${ed.border}`,fontSize:12,color:ed.text2}}>
                Verificação YouTube — em breve
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Live Preview ── */}
        <div style={{position:'sticky',top:120}}>
          <div style={{borderRadius:20,background:ed.card,border:`1px solid ${ed.border}`,padding:16,overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <p style={{fontSize:10,fontWeight:700,color:ed.text2,textTransform:'uppercase',letterSpacing:'0.12em',margin:0}}>Preview ao Vivo</p>
              {slug&&<Link href={`/s/${slug}`} target="_blank" style={{fontSize:11,color:accent,textDecoration:'none',fontWeight:700,display:'flex',alignItems:'center',gap:4}}>
                <ExternalLink size={11}/> Abrir
              </Link>}
            </div>

            {/* Mini site preview */}
            <div style={{borderRadius:16,overflow:'hidden',border:`1px solid ${ed.border}`,background:curTheme.bg,minHeight:200}}>
              {bannerUrl&&(
                <div style={{width:'100%',height:56,overflow:'hidden',position:'relative'}}>
                  <img src={bannerUrl} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  <div style={{position:'absolute',inset:0,background:`linear-gradient(to bottom,transparent,${curTheme.bg})`}}/>
                </div>
              )}
              <div style={{padding:bannerUrl?'0 12px 14px':'14px 12px',textAlign:'center'}}>
                <div style={{display:'inline-block',marginBottom:8,marginTop:bannerUrl?-Math.min(sizePx/2,28):0}}>
                  {avatarUrl
                    ?<img src={avatarUrl} style={{width:Math.min(sizePx,64),height:Math.min(sizePx,64),borderRadius:shapeR,objectFit:'cover',border:`2px solid ${accent}`}}/>
                    :<div style={{width:Math.min(sizePx,64),height:Math.min(sizePx,64),borderRadius:'50%',background:`${accent}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:900,color:accent}}>{(siteName||'?')[0]}</div>
                  }
                </div>
                <p style={{fontSize:13,fontWeight:900,color:textColor||curTheme.text,margin:'0 0 3px',fontFamily:fontFam}}>{siteName||'Meu Site'}</p>
                {bio&&<p style={{fontSize:10,color:curTheme.muted,margin:'0 0 10px',lineHeight:1.4}}>{bio.slice(0,60)}</p>}
                {links[0]&&(
                  <div style={{padding:'7px 10px',borderRadius:10,background:`${links[0].color||accent}18`,border:`1px solid ${links[0].color||accent}30`,fontSize:11,fontWeight:700,color:curTheme.text}}>
                    🔗 {links[0].title}
                  </div>
                )}
                {!links[0]&&<div style={{padding:'7px 10px',borderRadius:10,background:`${accent}18`,border:`1px solid ${accent}30`,fontSize:11,fontWeight:700,color:curTheme.text}}>🔗 Exemplo de Link</div>}
              </div>
              {slug&&<p style={{textAlign:'center',fontSize:8,color:curTheme.text,opacity:0.2,padding:'0 0 8px',fontFamily:'monospace'}}>{slug}.trustbank.xyz</p>}
            </div>

            <button onClick={handleSave} style={{width:'100%',marginTop:10,padding:'10px',borderRadius:12,border:'none',background:accent,color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
              <Save size={13}/> Salvar Alterações
            </button>

            <Link href={`/s/${slug}`} target="_blank" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:5,padding:'9px',borderRadius:12,border:`1px solid ${ed.border}`,background:'transparent',color:ed.text2,textDecoration:'none',fontSize:12,fontWeight:600,marginTop:6}}>
              <ExternalLink size={12}/> Abrir site completo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
