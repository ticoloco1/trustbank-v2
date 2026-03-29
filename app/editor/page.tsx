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
  Trash2, Send, Camera
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ACCENT_PRESETS = [
  '#818cf8','#a78bfa','#f472b6','#34d399','#fbbf24',
  '#60a5fa','#f87171','#22d3ee','#fb923c','#a3e635',
  '#e879f9','#2dd4bf','#facc15','#f97316','#06b6d4',
];

const TEXT_COLORS = [
  '',
  '#f1f5f9','#ffffff','#fef3c7','#dcfce7',
  '#e0f2fe','#f3e8ff','#0f172a','#1c1917',
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

  const [siteName, setSiteName] = useState('');
  const [bio, setBio]           = useState('');
  const [avatarUrl, setAvatar]  = useState('');
  const [bannerUrl, setBanner]  = useState('');
  const [wallet, setWallet]     = useState('');
  const [email, setEmail]       = useState('');
  const [published, setPub]     = useState(false);
  const [themeId, setThemeId]   = useState('dark');
  const [accent, setAccent]     = useState('#818cf8');
  const [photoShape, setShape]  = useState('round');
  const [photoSize, setSize]    = useState<'sm'|'md'|'lg'|'xl'>('md');
  const [fontStyle, setFont]    = useState('sans');
  const [textColor, setTColor]  = useState('');
  const [darkUI, setDarkUI]     = useState(true);
  const [pages, setPages]       = useState([{id:'home',label:'Home'}]);
  const [contents, setContents] = useState<Record<string,string>>({});
  const [pageWidth, setWidth]   = useState(680);
  const [showCv, setShowCv]     = useState(false);
  const [cvLocked, setCvLock]   = useState(false);
  const [cvPrice, setCvPrice]   = useState('20');
  const [cvHead, setCvHead]     = useState('');
  const [cvLoc, setCvLoc]       = useState('');
  const [cvBody, setCvBody]     = useState('');
  const [showFeed, setShowFeed] = useState(true);
  const [posts, setPosts]       = useState<any[]>([]);
  const [feedText, setFeedText] = useState('');
  const [posting, setPosting]   = useState(false);
  const [lTitle, setLTitle]     = useState('');
  const [lUrl, setLUrl]         = useState('');
  const [lColor, setLColor]     = useState('');
  const [ytUrl, setYtUrl]       = useState('');
  const [ytTitle, setYtTitle]   = useState('');
  const [pwOn, setPwOn]         = useState(false);
  const [pwAmt, setPwAmt]       = useState('4.99');
  const [tab, setTab]           = useState('profile');
  const [saving, setSaving]     = useState(false);
  const [savedOk, setSavedOk]   = useState(false);
  const [upA, setUpA]           = useState(false);
  const [upB, setUpB]           = useState(false);
  const dirty = useRef(false);

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
    try { const p = JSON.parse((profile as any).site_pages || '[]'); if (p.length) setPages(p); } catch {}
    try { setContents(JSON.parse((profile as any).page_contents || '{}')); } catch {}
    if ((profile as any).page_width) setWidth((profile as any).page_width);
    const th = THEMES.find(t => t.id === (profile.theme || 'dark'));
    setDarkUI(th ? th.category !== 'light' : true);
  }, [profile]);

  const upload = async (file: File, folder: string) => {
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user!.id}/${folder}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('platform-assets').upload(path, file, { upsert: true });
    if (error) throw new Error('Upload falhou. Bucket "platform-assets" existe no Supabase Storage?');
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
      published, site_pages: JSON.stringify(pages.length ? pages : [{id:'home',label:'Home'}]),
      page_contents: JSON.stringify(contents), page_width: pageWidth, platform: 'trustbank',
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
  const sizePx = {sm:56,md:80,lg:112,xl:148}[photoSize] || 80;
  const fontFam = fontStyle==='serif'?'Georgia,serif':fontStyle==='mono'?"'JetBrains Mono',monospace":"'Plus Jakarta Sans',system-ui,sans-serif";
  const shapeR = photoShape==='round'?'50%':photoShape==='square'?'8px':'20px';

  // Editor UI colors (dark/light toggle — separate from site theme)
  const bg   = darkUI ? '#0d1117' : '#f6f8fa';
  const bg2  = darkUI ? '#161b22' : '#ffffff';
  const bord = darkUI ? '#30363d' : '#d0d7de';
  const txt  = darkUI ? '#e6edf3' : '#24292f';
  const txt2 = darkUI ? '#7d8590' : '#57606a';

  const inp: React.CSSProperties = {
    width:'100%', padding:'9px 13px', borderRadius:10,
    border:`1px solid ${bord}`, background:bg2, color:txt,
    fontSize:14, outline:'none', boxSizing:'border-box', fontFamily:'inherit',
  };
  const lbl: React.CSSProperties = {
    fontSize:11, fontWeight:700, color:txt2,
    textTransform:'uppercase', letterSpacing:'0.07em', display:'block', marginBottom:6,
  };
  const card: React.CSSProperties = {
    background:bg2, border:`1px solid ${bord}`, borderRadius:16, padding:20, marginBottom:14,
  };
  const tog = (on:boolean): React.CSSProperties => ({
    width:44, height:24, borderRadius:12, background:on?accent:'rgba(128,128,128,0.25)',
    border:'none', cursor:'pointer', position:'relative', transition:'all 0.2s', flexShrink:0,
  });
  const dot = (on:boolean): React.CSSProperties => ({
    position:'absolute', top:4, width:16, height:16, borderRadius:'50%',
    background:'white', transition:'all 0.2s', left:on?24:4,
  });
  const pill = (on:boolean): React.CSSProperties => ({
    display:'block', width:'100%', textAlign:'left', padding:'8px 12px', borderRadius:8,
    border:`1px solid ${on?accent:bord}`, background:on?`${accent}15`:'transparent',
    color:on?accent:txt2, cursor:'pointer', fontSize:13, fontWeight:600, marginBottom:4,
  });

  const TABS = [
    {id:'profile',icon:User,    label:'Perfil'},
    {id:'theme',  icon:Palette, label:'Tema'},
    {id:'links',  icon:Link2,   label:'Links'},
    {id:'videos', icon:Video,   label:'Vídeos'},
    {id:'cv',     icon:FileText,label:'CV'},
    {id:'feed',   icon:Hash,    label:'Feed'},
    {id:'pages',  icon:Img,     label:'Páginas'},
    {id:'verify', icon:Shield,  label:'Verificar'},
  ];

  return (
    <div style={{ minHeight:'100vh', background:bg, color:txt, fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <Navbar />

      {/* Top tab bar */}
      <div style={{ position:'sticky', top:60, zIndex:40, background:bg, borderBottom:`1px solid ${bord}` }}>
        <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 20px', display:'flex', alignItems:'center', height:52, gap:2 }}>
          {TABS.map(tb => (
            <button key={tb.id} onClick={()=>setTab(tb.id)} style={{
              display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8,
              border:'none', background:tab===tb.id?`${accent}20`:'transparent',
              color:tab===tb.id?accent:txt2, cursor:'pointer', fontSize:12, fontWeight:600, whiteSpace:'nowrap',
            }}>
              <tb.icon size={13}/> {tb.label}
            </button>
          ))}
          <div style={{flex:1}}/>
          <button onClick={()=>setDarkUI(d=>!d)} style={{ display:'flex', alignItems:'center', gap:4, padding:'6px 10px', borderRadius:8, border:`1px solid ${bord}`, background:'transparent', color:txt2, cursor:'pointer', fontSize:12 }}>
            {darkUI?<Sun size={14}/>:<Moon size={14}/>}
          </button>
          {slug && (
            <Link href={`/s/${slug}`} target="_blank" style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 12px', borderRadius:8, border:`1px solid ${bord}`, color:'#4ade80', textDecoration:'none', fontSize:12, fontWeight:600 }}>
              <Eye size={13}/> Preview
            </Link>
          )}
          <button onClick={handleSave} disabled={saving} style={{ display:'flex', alignItems:'center', gap:5, padding:'6px 14px', borderRadius:8, border:'none', background:savedOk?'rgba(74,222,128,0.15)':accent, color:savedOk?'#4ade80':'#fff', cursor:'pointer', fontSize:12, fontWeight:700 }}>
            {saving?<Loader2 size={13} className="animate-spin"/>:savedOk?<Check size={13}/>:<Save size={13}/>}
            {saving?'Salvando…':savedOk?'Salvo!':'Salvar'}
          </button>
          <button onClick={async()=>{ setPub(true); await save({published:true} as any); }} style={{ padding:'6px 14px', borderRadius:8, border:'none', cursor:'pointer', background:published?'rgba(74,222,128,0.12)':'linear-gradient(135deg,#f59e0b,#d97706)', color:published?'#4ade80':'#fff', fontSize:12, fontWeight:800 }}>
            {published?'✓ Publicado':'Publicar'}
          </button>
        </div>
      </div>

      {/* Main: content + preview sidebar */}
      <div style={{ maxWidth:1400, margin:'0 auto', padding:'24px 20px', display:'grid', gridTemplateColumns:'1fr 300px', gap:24, alignItems:'start' }}>

        {/* LEFT: editor */}
        <div>

          {/* ── PROFILE ── */}
          {tab==='profile' && (
            <div style={card}>
              <p style={{fontSize:15,fontWeight:800,color:txt,marginBottom:18}}>Perfil</p>
              <div style={{display:'flex',gap:14,marginBottom:18}}>
                <div style={{position:'relative',flexShrink:0}}>
                  <div style={{width:80,height:80,borderRadius:photoShape==='round'?'50%':photoShape==='square'?'10px':'22px',overflow:'hidden',background:`${accent}20`,border:`2px solid ${accent}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,fontWeight:900,color:accent}}>
                    {avatarUrl?<img src={avatarUrl} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:(siteName||'?')[0]}
                  </div>
                  <label style={{position:'absolute',bottom:-6,right:-6,width:26,height:26,borderRadius:'50%',background:accent,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',border:`2px solid ${bg}`}}>
                    {upA?<Loader2 size={12} color="#fff"/>:<Camera size={12} color="#fff"/>}
                    <input type="file" accept="image/*" style={{display:'none'}} onChange={async e=>{
                      const f=e.target.files?.[0]; if(!f)return;
                      setUpA(true);
                      try{const url=await upload(f,'avatars');setAvatar(url);dirty.current=true;}
                      catch(err:any){alert(err.message);}
                      setUpA(false);
                    }}/>
                  </label>
                </div>
                <div style={{flex:1}}>
                  <label style={lbl}>Nome de exibição</label>
                  <input value={siteName} onChange={e=>{setSiteName(e.target.value);dirty.current=true;}} style={{...inp,marginBottom:10}} placeholder="Seu nome"/>
                  <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',padding:'9px 12px',borderRadius:10,border:`1px dashed ${bord}`,background:bg,fontSize:13,color:txt2}}>
                    {upB?<Loader2 size={14}/>:<Upload size={14} color={accent}/>}
                    <span style={{color:accent,fontWeight:600,fontSize:13}}>{bannerUrl?'✓ Banner · trocar':'Upload Banner'}</span>
                    <input type="file" accept="image/*" style={{display:'none'}} onChange={async e=>{
                      const f=e.target.files?.[0]; if(!f)return;
                      setUpB(true);
                      try{const url=await upload(f,'banners');setBanner(url);dirty.current=true;}
                      catch(err:any){alert(err.message);}
                      setUpB(false);
                    }}/>
                  </label>
                  {bannerUrl&&<button onClick={()=>{setBanner('');dirty.current=true;}} style={{fontSize:11,color:'#ef4444',background:'none',border:'none',cursor:'pointer',marginTop:4}}>Remover banner</button>}
                </div>
              </div>
              <label style={lbl}>Bio</label>
              <textarea value={bio} onChange={e=>{setBio(e.target.value);dirty.current=true;}} style={{...inp,resize:'vertical',minHeight:72,marginBottom:12}} placeholder="Descrição curta…"/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
                <div>
                  <label style={lbl}>Carteira Polygon</label>
                  <div style={{display:'flex',gap:6}}>
                    <input value={wallet} onChange={e=>{setWallet(e.target.value);dirty.current=true;}} style={{...inp,fontFamily:"'JetBrains Mono',monospace",flex:1}} placeholder="0x…"/>
                    <button onClick={async()=>{
                      const eth=(window as any).ethereum;
                      if(eth){try{const a=await eth.request({method:'eth_requestAccounts'});setWallet(a[0]);dirty.current=true;}catch{alert('Recusado');}}
                      else{alert('Instale MetaMask em metamask.io');}
                    }} style={{padding:'8px 10px',borderRadius:8,border:`1px solid ${bord}`,background:bg2,color:accent,cursor:'pointer',fontSize:11,fontWeight:700,whiteSpace:'nowrap'}}>🦊</button>
                  </div>
                  {!wallet&&<p style={{fontSize:10,color:txt2,marginTop:3}}>Not connected — install MetaMask</p>}
                </div>
                <div>
                  <label style={lbl}>Email de contato</label>
                  <input value={email} onChange={e=>{setEmail(e.target.value);dirty.current=true;}} type="email" style={inp} placeholder="você@email.com"/>
                </div>
              </div>
              <div style={{padding:'10px 14px',borderRadius:10,background:bg,border:`1px solid ${bord}`,fontSize:13}}>
                <span style={{color:txt2}}>Slug: </span>
                <span style={{color:accent,fontWeight:700,fontFamily:"'JetBrains Mono',monospace"}}>{slug}.trustbank.xyz</span>
                <span style={{color:txt2,fontSize:11,marginLeft:8}}>· Vault para trocar</span>
              </div>
            </div>
          )}

          {/* ── THEME ── */}
          {tab==='theme' && (
            <div>
              <div style={card}>
                <p style={{fontSize:15,fontWeight:800,color:txt,marginBottom:4}}>Tema Visual</p>
                <p style={{fontSize:12,color:txt2,marginBottom:16}}>30 temas · 15 dark + 15 light</p>
                <p style={{fontSize:10,fontWeight:700,color:txt2,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>🌑 Dark</p>
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6,marginBottom:16}}>
                  {THEMES.filter(t=>t.category!=='light').map(th=>(
                    <button key={th.id} onClick={()=>{setThemeId(th.id);setAccent(th.accent);dirty.current=true;}} style={{
                      borderRadius:12,overflow:'hidden',padding:0,cursor:'pointer',
                      border:themeId===th.id?`2px solid white`:`1.5px solid rgba(255,255,255,0.06)`,
                      boxShadow:themeId===th.id?`0 0 16px ${th.accent}60`:'none',
                      background:th.previewBg,transition:'all 0.15s',
                    }}>
                      <div style={{padding:'10px 8px 4px',background:th.previewBg}}>
                        <div style={{width:16,height:16,borderRadius:'50%',background:th.accent,margin:'0 auto 5px'}}/>
                        <div style={{height:2,background:th.previewText,opacity:0.4,borderRadius:2,marginBottom:3}}/>
                        <div style={{height:5,background:th.accent,opacity:0.7,borderRadius:2}}/>
                      </div>
                      <p style={{fontSize:9,fontWeight:700,color:th.previewText,textAlign:'center',padding:'0 4px 6px',margin:0}}>{th.emoji} {th.label}</p>
                    </button>
                  ))}
                </div>
                <p style={{fontSize:10,fontWeight:700,color:txt2,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>🤍 Light</p>
                <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:6}}>
                  {THEMES.filter(t=>t.category==='light').map(th=>(
                    <button key={th.id} onClick={()=>{setThemeId(th.id);setAccent(th.accent);dirty.current=true;}} style={{
                      borderRadius:12,overflow:'hidden',padding:0,cursor:'pointer',
                      border:themeId===th.id?`2px solid ${th.accent}`:`1.5px solid rgba(0,0,0,0.08)`,
                      boxShadow:themeId===th.id?`0 0 12px ${th.accent}40`:'none',
                      background:th.previewBg,transition:'all 0.15s',
                    }}>
                      <div style={{padding:'10px 8px 4px'}}>
                        <div style={{width:16,height:16,borderRadius:'50%',background:th.accent,margin:'0 auto 5px'}}/>
                        <div style={{height:2,background:th.previewText,opacity:0.4,borderRadius:2,marginBottom:3}}/>
                        <div style={{height:5,background:th.accent,opacity:0.7,borderRadius:2}}/>
                      </div>
                      <p style={{fontSize:9,fontWeight:700,color:th.previewText,textAlign:'center',padding:'0 4px 6px',margin:0}}>{th.emoji} {th.label}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div style={card}>
                <p style={{fontSize:13,fontWeight:800,color:txt,marginBottom:12}}>Cor de Destaque</p>
                <div style={{display:'flex',flexWrap:'wrap',gap:8,alignItems:'center'}}>
                  {ACCENT_PRESETS.map(ac=>(
                    <button key={ac} onClick={()=>{setAccent(ac);dirty.current=true;}} style={{width:30,height:30,borderRadius:'50%',background:ac,cursor:'pointer',border:accent===ac?'3px solid white':'1.5px solid rgba(0,0,0,0.1)',boxShadow:accent===ac?`0 0 8px ${ac}`:'none'}}/>
                  ))}
                  <input type="color" value={accent} onChange={e=>{setAccent(e.target.value);dirty.current=true;}} style={{width:30,height:30,borderRadius:'50%',border:'none',cursor:'pointer',padding:0}}/>
                </div>
              </div>
              <div style={{...card,display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <div>
                  <p style={{fontSize:13,fontWeight:800,color:txt,marginBottom:10}}>Foto — Forma</p>
                  {[['round','● Redonda'],['rounded','▢ Arredondada'],['square','■ Quadrada']].map(([v,l])=>(
                    <button key={v} onClick={()=>{setShape(v);dirty.current=true;}} style={pill(photoShape===v)}>{l}</button>
                  ))}
                  <p style={{fontSize:13,fontWeight:800,color:txt,marginBottom:10,marginTop:12}}>Foto — Tamanho</p>
                  {([['sm','Pequeno 56px'],['md','Médio 80px'],['lg','Grande 112px'],['xl','XL 148px']] as const).map(([v,l])=>(
                    <button key={v} onClick={()=>{setSize(v);dirty.current=true;}} style={pill(photoSize===v)}>{l}</button>
                  ))}
                </div>
                <div>
                  <p style={{fontSize:13,fontWeight:800,color:txt,marginBottom:10}}>Fonte</p>
                  {[['sans','Modern Sans'],['serif','Classic Serif'],['mono','Monospace']].map(([v,l])=>(
                    <button key={v} onClick={()=>{setFont(v);dirty.current=true;}} style={{...pill(fontStyle===v),fontFamily:v==='serif'?'Georgia,serif':v==='mono'?"'JetBrains Mono',monospace":'inherit'}}>{l}</button>
                  ))}
                  <p style={{fontSize:13,fontWeight:800,color:txt,marginBottom:10,marginTop:12}}>Cor do Texto</p>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {TEXT_COLORS.map(col=>(
                      <button key={col||'auto'} onClick={()=>{setTColor(col);dirty.current=true;}} title={col||'Auto'} style={{width:24,height:24,borderRadius:'50%',cursor:'pointer',background:col||`conic-gradient(${ACCENT_PRESETS.slice(0,6).join(',')})`,border:textColor===col?'3px solid white':'1.5px solid rgba(128,128,128,0.3)'}}/>
                    ))}
                  </div>
                  {textColor&&<button onClick={()=>{setTColor('');dirty.current=true;}} style={{fontSize:11,color:accent,background:'none',border:'none',cursor:'pointer',marginTop:6,fontWeight:700}}>↩ Auto</button>}
                </div>
              </div>
            </div>
          )}

          {/* ── LINKS ── */}
          {tab==='links' && (
            <div style={card}>
              <p style={{fontSize:15,fontWeight:800,color:txt,marginBottom:16}}>Links & Redes Sociais</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr auto',gap:8,alignItems:'end',marginBottom:10}}>
                <div><label style={lbl}>Título</label><input value={lTitle} onChange={e=>setLTitle(e.target.value)} style={inp} placeholder="Instagram"/></div>
                <div><label style={lbl}>URL</label><input value={lUrl} onChange={e=>setLUrl(e.target.value)} style={inp} placeholder="https://…"/></div>
                <div><label style={lbl}>Cor</label><input type="color" value={lColor||accent} onChange={e=>setLColor(e.target.value)} style={{width:44,height:40,borderRadius:10,border:`1px solid ${bord}`,cursor:'pointer',padding:2}}/></div>
              </div>
              <button onClick={async()=>{
                if(!lTitle||!lUrl||!profile?.id)return;
                await addLink({title:lTitle,url:lUrl,icon:'link',color:lColor||null,sort_order:links.length});
                setLTitle('');setLUrl('');setLColor('');
              }} style={{display:'flex',alignItems:'center',gap:6,padding:'9px 16px',borderRadius:10,border:'none',background:accent,color:'#fff',cursor:'pointer',fontWeight:700,fontSize:13,marginBottom:16}}>
                <Plus size={14}/> Adicionar
              </button>
              {links.map((l:any)=>(
                <div key={l.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:12,background:`${l.color||accent}10`,border:`1px solid ${l.color||accent}25`,marginBottom:6}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:l.color||accent,flexShrink:0}}/>
                  <span style={{flex:1,fontSize:14,fontWeight:700,color:txt}}>{l.title}</span>
                  <span style={{fontSize:11,color:txt2,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.url}</span>
                  <button onClick={()=>deleteLink(l.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',opacity:0.7}}><X size={14}/></button>
                </div>
              ))}
              {links.length===0&&<p style={{textAlign:'center',padding:'24px 0',color:txt2,fontSize:13}}>Nenhum link ainda</p>}
            </div>
          )}

          {/* ── VIDEOS ── */}
          {tab==='videos' && (
            <div style={card}>
              <p style={{fontSize:15,fontWeight:800,color:txt,marginBottom:16}}>Vídeos YouTube</p>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                <div><label style={lbl}>URL YouTube</label><input value={ytUrl} onChange={e=>setYtUrl(e.target.value)} style={inp} placeholder="https://youtube.com/watch?v=…"/></div>
                <div><label style={lbl}>Título</label><input value={ytTitle} onChange={e=>setYtTitle(e.target.value)} style={inp} placeholder="Meu vídeo"/></div>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 14px',borderRadius:10,background:bg,border:`1px solid ${bord}`,marginBottom:10}}>
                <div><p style={{fontSize:13,fontWeight:700,color:txt,margin:0}}>Paywall (pago)</p><p style={{fontSize:11,color:txt2,margin:'2px 0 0'}}>Fãs pagam USDC · você fica com 70%</p></div>
                <button onClick={()=>setPwOn(p=>!p)} style={tog(pwOn)}><div style={dot(pwOn)}/></button>
              </div>
              {pwOn&&<><label style={lbl}>Preço (USDC)</label><input value={pwAmt} onChange={e=>setPwAmt(e.target.value)} type="number" step="0.01" style={{...inp,marginBottom:10}}/></>}
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
                <div key={v.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:12,background:bg,border:`1px solid ${bord}`,marginBottom:6}}>
                  {v.youtube_video_id&&<img src={`https://img.youtube.com/vi/${v.youtube_video_id}/default.jpg`} style={{width:52,height:36,objectFit:'cover',borderRadius:6,flexShrink:0}}/>}
                  <span style={{flex:1,fontSize:13,fontWeight:600,color:txt}}>{v.title}</span>
                  {v.paywall_enabled&&<span style={{fontSize:11,color:'#f59e0b',fontWeight:700}}>🔒 ${v.paywall_price}</span>}
                  <button onClick={()=>deleteVideo(v.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',opacity:0.7}}><X size={14}/></button>
                </div>
              ))}
            </div>
          )}

          {/* ── CV ── */}
          {tab==='cv' && (
            <div style={card}>
              <p style={{fontSize:15,fontWeight:800,color:txt,marginBottom:14}}>CV / Currículo</p>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 14px',borderRadius:10,background:bg,border:`1px solid ${bord}`,marginBottom:10}}>
                <p style={{fontSize:13,fontWeight:700,color:txt,margin:0}}>Mostrar CV no site</p>
                <button onClick={()=>{setShowCv(p=>!p);dirty.current=true;}} style={tog(showCv)}><div style={dot(showCv)}/></button>
              </div>
              {showCv&&(
                <>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'11px 14px',borderRadius:10,background:bg,border:`1px solid ${bord}`,marginBottom:10}}>
                    <div><p style={{fontSize:13,fontWeight:700,color:txt,margin:0}}>Bloquear · pagar para ver</p><p style={{fontSize:11,color:txt2,margin:'2px 0 0'}}>Empresas pagam · você fica com 50%</p></div>
                    <button onClick={()=>{setCvLock(p=>!p);dirty.current=true;}} style={tog(cvLocked)}><div style={dot(cvLocked)}/></button>
                  </div>
                  {cvLocked&&<><label style={lbl}>Preço (USDC)</label><input value={cvPrice} onChange={e=>{setCvPrice(e.target.value);dirty.current=true;}} type="number" min="1" style={{...inp,marginBottom:10}}/></>}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
                    <div><label style={lbl}>Cargo / Headline</label><input value={cvHead} onChange={e=>{setCvHead(e.target.value);dirty.current=true;}} style={inp} placeholder="CEO na Empresa X"/></div>
                    <div><label style={lbl}>Localização</label><input value={cvLoc} onChange={e=>{setCvLoc(e.target.value);dirty.current=true;}} style={inp} placeholder="SP · Remote"/></div>
                  </div>
                  <label style={lbl}>Conteúdo do CV</label>
                  <textarea value={cvBody} onChange={e=>{setCvBody(e.target.value);dirty.current=true;}} style={{...inp,resize:'vertical',minHeight:140}} placeholder="Experiência, educação, habilidades…"/>
                </>
              )}
            </div>
          )}

          {/* ── FEED ── */}
          {tab==='feed' && (
            <div>
              <div style={card}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div><p style={{fontSize:15,fontWeight:800,color:txt,margin:0}}>Feed (7 dias)</p><p style={{fontSize:12,color:txt2,marginTop:4}}>Posts expiram em 7 dias · janela 500×500</p></div>
                  <button onClick={()=>{setShowFeed(p=>!p);dirty.current=true;}} style={tog(showFeed)}><div style={dot(showFeed)}/></button>
                </div>
              </div>
              <div style={card}>
                <p style={{fontSize:13,fontWeight:800,color:txt,marginBottom:10}}>Novo Post</p>
                <textarea value={feedText} onChange={e=>setFeedText(e.target.value)} placeholder="O que você quer compartilhar?" style={{...inp,resize:'vertical',minHeight:80,marginBottom:8}}/>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <label style={{display:'flex',alignItems:'center',gap:5,padding:'6px 10px',borderRadius:8,border:`1px solid ${bord}`,background:bg2,color:txt2,cursor:'pointer',fontSize:12,fontWeight:600}}>
                    <Img size={13}/> Imagem
                    <input type="file" accept="image/*" style={{display:'none'}} onChange={async e=>{
                      const f=e.target.files?.[0]; if(!f)return;
                      try{
                        const ext=f.name.split('.').pop()||'jpg';
                        const path=`${user!.id}/feed/${Date.now()}.${ext}`;
                        await supabase.storage.from('platform-assets').upload(path,f,{upsert:true});
                        const url=supabase.storage.from('platform-assets').getPublicUrl(path).data.publicUrl;
                        setFeedText(prev=>prev+(prev?'\n':'')+url);
                      }catch(err:any){alert(err.message);}
                    }}/>
                  </label>
                  <button onClick={async()=>{
                    if(!feedText.trim()||!profile?.id)return;
                    setPosting(true);
                    await addPost({text:feedText,pinned:false,expires_at:new Date(Date.now()+7*86400000).toISOString()});
                    setFeedText('');setPosting(false);
                  }} disabled={!feedText.trim()||posting} style={{display:'flex',alignItems:'center',gap:6,padding:'9px 18px',borderRadius:9,border:'none',background:feedText.trim()?accent:'rgba(128,128,128,0.2)',color:'#fff',cursor:feedText.trim()?'pointer':'not-allowed',fontWeight:700,fontSize:13}}>
                    {posting?<Loader2 size={14} className="animate-spin"/>:<Send size={14}/>} Publicar
                  </button>
                </div>
              </div>
              <div style={card}>
                <p style={{fontSize:11,fontWeight:700,color:txt2,textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:12}}>Posts ({posts.length})</p>
                {posts.map((p:any)=>(
                  <div key={p.id} style={{padding:'10px 14px',borderRadius:10,background:bg,border:`1px solid ${bord}`,marginBottom:8}}>
                    {p.pinned&&<p style={{fontSize:10,color:accent,fontWeight:700,marginBottom:4}}>📌 FIXADO</p>}
                    <p style={{fontSize:13,color:txt,margin:0,whiteSpace:'pre-wrap'}}>{p.text}</p>
                    <div style={{display:'flex',justifyContent:'space-between',marginTop:8,paddingTop:6,borderTop:`1px solid ${bord}`}}>
                      <span style={{fontSize:10,color:txt2}}>{new Date(p.created_at).toLocaleDateString('pt-BR')} · expira {new Date(p.expires_at).toLocaleDateString('pt-BR')}</span>
                      <button onClick={async()=>{await supabase.from('feed_posts').delete().eq('id',p.id);setPosts(prev=>prev.filter((x:any)=>x.id!==p.id));}} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',opacity:0.7}}><Trash2 size={12}/></button>
                    </div>
                  </div>
                ))}
                {posts.length===0&&<p style={{textAlign:'center',padding:'20px 0',color:txt2,fontSize:13}}>Nenhum post ainda</p>}
              </div>
            </div>
          )}

          {/* ── PAGES ── */}
          {tab==='pages' && (
            <div>
              <div style={card}>
                <p style={{fontSize:15,fontWeight:800,color:txt,marginBottom:6}}>Páginas do Site</p>
                <p style={{fontSize:12,color:txt2,marginBottom:14}}>Até 3 páginas com menu no topo do mini site</p>
                {pages.map((pg,idx)=>(
                  <div key={pg.id} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                    <div style={{width:22,height:22,borderRadius:6,background:`${accent}18`,border:`1px solid ${accent}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:900,color:accent,flexShrink:0}}>{idx+1}</div>
                    <input value={pg.label} onChange={e=>{setPages(prev=>prev.map(p=>p.id===pg.id?{...p,label:e.target.value}:p));dirty.current=true;}} style={{...inp,marginBottom:0,flex:1}} placeholder={idx===0?'Home':`Página ${idx+1}`}/>
                    {idx>0&&<button onClick={()=>{setPages(prev=>prev.filter(p=>p.id!==pg.id));dirty.current=true;}} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',opacity:0.7}}><X size={14}/></button>}
                  </div>
                ))}
                {pages.length<3&&<button onClick={()=>{setPages(prev=>[...prev,{id:`p_${Date.now()}`,label:`Página ${prev.length+1}`}]);dirty.current=true;}} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',borderRadius:8,border:`1px dashed ${bord}`,background:'transparent',color:txt2,cursor:'pointer',fontSize:13,fontWeight:600,marginTop:8}}>
                  <Plus size={13}/> Adicionar Página
                </button>}
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14,padding:'10px 14px',borderRadius:10,background:bg2,border:`1px solid ${bord}`}}>
                <span style={{fontSize:12,fontWeight:700,color:txt2,whiteSpace:'nowrap'}}>Largura:</span>
                <input type="range" min={320} max={1200} value={pageWidth} onChange={e=>{setWidth(Number(e.target.value));dirty.current=true;}} style={{flex:1,accentColor:accent}}/>
                <span style={{fontSize:12,fontFamily:'monospace',color:accent,minWidth:50}}>{pageWidth}px</span>
              </div>
              {pages.map(pg=>(
                <div key={pg.id} style={{...card,marginBottom:14}}>
                  <p style={{fontSize:14,fontWeight:800,color:txt,marginBottom:12}}>✏️ {pg.label}</p>
                  <RichTextEditor value={contents[pg.id]||''} onChange={v=>{setContents(prev=>({...prev,[pg.id]:v}));dirty.current=true;}} placeholder={`Conteúdo para "${pg.label}"…`}/>
                </div>
              ))}
            </div>
          )}

          {/* ── VERIFY ── */}
          {tab==='verify' && (
            <div style={card}>
              <p style={{fontSize:15,fontWeight:800,color:txt,marginBottom:12}}>Verificação YouTube</p>
              <p style={{fontSize:13,color:txt2,lineHeight:1.7,marginBottom:12}}>
                Adicione <code style={{color:accent,background:`${accent}12`,padding:'2px 6px',borderRadius:4}}>{slug?`trustbank.xyz/s/${slug}`:'seu-slug.trustbank.xyz'}</code> na descrição do canal YouTube, depois clique verificar.
              </p>
              <div style={{padding:14,borderRadius:10,background:bg,border:`1px solid ${bord}`,fontSize:12,color:txt2}}>YouTube verification — em breve</div>
            </div>
          )}
        </div>

        {/* RIGHT: Live Preview */}
        <div style={{position:'sticky',top:120}}>
          <div style={{borderRadius:20,background:bg2,border:`1px solid ${bord}`,padding:16,overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
              <p style={{fontSize:10,fontWeight:700,color:txt2,textTransform:'uppercase',letterSpacing:'0.12em',margin:0}}>Preview ao Vivo</p>
              {slug&&<Link href={`/s/${slug}`} target="_blank" style={{fontSize:11,color:accent,textDecoration:'none',fontWeight:700,display:'flex',alignItems:'center',gap:4}}><ExternalLink size={11}/> Abrir</Link>}
            </div>
            {/* Mini site preview */}
            <div style={{borderRadius:16,overflow:'hidden',border:`1px solid ${bord}`,background:curTheme.bg,minHeight:200}}>
              {bannerUrl&&(
                <div style={{width:'100%',height:56,overflow:'hidden',position:'relative'}}>
                  <img src={bannerUrl} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  <div style={{position:'absolute',inset:0,background:`linear-gradient(to bottom,transparent,${curTheme.bg})`}}/>
                </div>
              )}
              <div style={{padding:bannerUrl?'0 12px 14px':'14px 12px',textAlign:'center'}}>
                <div style={{display:'inline-block',marginBottom:8,marginTop:bannerUrl?`-${Math.min(sizePx/2,24)}px`:0}}>
                  {avatarUrl
                    ?<img src={avatarUrl} style={{width:Math.min(sizePx,64),height:Math.min(sizePx,64),borderRadius:shapeR,objectFit:'cover',border:`2px solid ${accent}`}}/>
                    :<div style={{width:Math.min(sizePx,64),height:Math.min(sizePx,64),borderRadius:'50%',background:`${accent}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,fontWeight:900,color:accent}}>{(siteName||'?')[0]}</div>
                  }
                </div>
                <p style={{fontSize:13,fontWeight:900,color:textColor||curTheme.text,margin:'0 0 3px',fontFamily:fontFam}}>{siteName||'Meu Site'}</p>
                {bio&&<p style={{fontSize:10,color:curTheme.muted,margin:'0 0 10px',lineHeight:1.4}}>{bio.slice(0,60)}</p>}
                <div style={{padding:'7px 10px',borderRadius:10,background:`${accent}18`,border:`1px solid ${accent}30`,fontSize:11,fontWeight:700,color:curTheme.text}}>
                  {links[0]?`🔗 ${links[0].title}`:'🔗 Exemplo de Link'}
                </div>
              </div>
              {slug&&<p style={{textAlign:'center',fontSize:8,color:curTheme.text,opacity:0.2,padding:'0 0 8px',fontFamily:'monospace'}}>{slug}.trustbank.xyz</p>}
            </div>
            <button onClick={handleSave} style={{width:'100%',marginTop:10,padding:'10px',borderRadius:12,border:'none',background:accent,color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:5}}>
              <Save size={13}/> Salvar
            </button>
            {slug&&<Link href={`/s/${slug}`} target="_blank" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:5,padding:'9px',borderRadius:12,border:`1px solid ${bord}`,background:'transparent',color:txt2,textDecoration:'none',fontSize:12,fontWeight:600,marginTop:6}}>
              <ExternalLink size={12}/> Abrir site completo
            </Link>}
          </div>
        </div>
      </div>
    </div>
  );
}
