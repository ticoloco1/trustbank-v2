'use client';
import { useState } from 'react';
import {
  ExternalLink, Play, Lock, Unlock, MapPin, Globe, Mail,
  Phone, Linkedin, Hash, BadgeCheck, Award, Share2, Heart,
  Clock, Pin, ChevronDown, ChevronUp, Briefcase, GraduationCap, Star
} from 'lucide-react';
import { useCountdown } from '@/hooks/useCountdown';

// ─── Theme Engine (jobinlink ProfilePage) ───────────────────
function getTheme(profile: any) {
  const accent = profile.accent_color || '#8b5cf6';
  const bgStyle = profile.bg_style || 'dark';
  const isDark = bgStyle === 'dark' || bgStyle === 'midnight';

  const BG_MAP: Record<string, { bg:string; text:string; muted:string; surface:string; border:string }> = {
    dark:          { bg:'#0a0a0f',  text:'#f1f5f9', muted:'rgba(241,245,249,0.5)', surface:'rgba(255,255,255,0.06)', border:'rgba(255,255,255,0.10)' },
    midnight:      { bg:'#050508',  text:'#f1f5f9', muted:'rgba(241,245,249,0.45)', surface:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.08)' },
    white:         { bg:'#ffffff',  text:'#0f172a', muted:'rgba(15,23,42,0.5)', surface:'rgba(255,255,255,0.85)', border:'rgba(15,23,42,0.10)' },
    beige:         { bg:'#faf7f2',  text:'#1c1917', muted:'rgba(28,25,23,0.5)', surface:'rgba(250,247,242,0.9)', border:'rgba(28,25,23,0.1)' },
    'pastel-blue': { bg:'#f0f9ff',  text:'#0c4a6e', muted:'rgba(12,74,110,0.5)', surface:'rgba(240,249,255,0.9)', border:'rgba(12,74,110,0.12)' },
    'pastel-pink': { bg:'#fdf2f8',  text:'#831843', muted:'rgba(131,24,67,0.5)', surface:'rgba(253,242,248,0.9)', border:'rgba(131,24,67,0.12)' },
    'pastel-lav':  { bg:'#f5f3ff',  text:'#2e1065', muted:'rgba(46,16,101,0.5)', surface:'rgba(245,243,255,0.9)', border:'rgba(46,16,101,0.12)' },
    'light-gray':  { bg:'#f1f5f9',  text:'#0f172a', muted:'rgba(15,23,42,0.5)', surface:'rgba(255,255,255,0.9)', border:'rgba(15,23,42,0.10)' },
  };

  const GRAD_MAP: Record<string, string> = {
    cosmic:   'linear-gradient(135deg, #4c1d95, #312e81, #1e1b4b)',
    ocean:    'linear-gradient(135deg, #0c4a6e, #164e63, #0f766e)',
    forest:   'linear-gradient(135deg, #14532d, #065f46, #134e4a)',
    sunset:   'linear-gradient(135deg, #7c2d12, #78350f, #451a03)',
    midnight: 'linear-gradient(135deg, #0f172a, #1e293b, #0f172a)',
  };

  const theme = BG_MAP[bgStyle] || BG_MAP.dark;
  const gradient = GRAD_MAP[profile.gradient || 'cosmic'];
  return { ...theme, accent, gradient, isDark };
}

// ─── Glass Card ─────────────────────────────────────────────
function GCard({ children, t, style, onClick }: any) {
  return (
    <div onClick={onClick} style={{
      background: t.surface, border:`0.5px solid ${t.border}`,
      borderRadius:20, backdropFilter:'blur(20px) saturate(180%)',
      WebkitBackdropFilter:'blur(20px) saturate(180%)',
      padding:20, cursor:onClick?'pointer':'default',
      transition:'all 0.2s', ...style
    }}>
      {children}
    </div>
  );
}

// ─── Countdown Badge ─────────────────────────────────────────
function Countdown({ expiresAt, accent, pinned }: any) {
  const { d,h,m,s,expired } = useCountdown(expiresAt);
  if (expired) return <span style={{ fontSize:10, color:'#ef4444' }}>Expired</span>;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
      {pinned && <Pin style={{ width:11, height:11, color:accent }}/>}
      <Clock style={{ width:11, height:11, opacity:0.4 }}/>
      <span style={{ fontFamily:'monospace', fontSize:11, fontWeight:600, color:pinned?accent:'inherit' }}>
        {pinned ? `${d}d ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}` : d>0?`${d}d ${h}h`:`${h}h ${m}m ${s}s`}
      </span>
    </div>
  );
}

// ─── Feed Post ────────────────────────────────────────────────
function FeedPostCard({ post, t }: any) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes||0);
  const imgs = post.images || (post.imageUrl ? [post.imageUrl] : []);
  return (
    <GCard t={t} style={{ border:post.pinned?`0.5px solid ${t.accent}40`:undefined, marginBottom:12 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        {post.pinned && (
          <span style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:`${t.accent}15`, color:t.accent, border:`0.5px solid ${t.accent}30`, display:'inline-flex', alignItems:'center', gap:4 }}>
            <Pin style={{ width:10, height:10 }}/> Pinned · 1 year
          </span>
        )}
        <div style={{ marginLeft:'auto' }}>
          <Countdown expiresAt={post.expiresAt||post.expires_at} accent={t.accent} pinned={post.pinned}/>
        </div>
      </div>
      <p style={{ fontSize:14, lineHeight:1.65, color:t.text, whiteSpace:'pre-wrap', marginBottom:imgs.length?12:0 }}>{post.text||post.caption}</p>
      {imgs.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:imgs.length===1?'1fr':imgs.length===2?'1fr 1fr':'1fr 1fr 1fr', gap:6, borderRadius:12, overflow:'hidden', marginBottom:12 }}>
          {imgs.map((img:string,i:number) => (
            <img key={i} src={img} alt="" style={{ width:'100%', height:imgs.length===1?220:140, objectFit:'cover' }}/>
          ))}
        </div>
      )}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:10, borderTop:`0.5px solid ${t.border}` }}>
        <button onClick={()=>{setLiked(!liked);setLikes((l:number)=>liked?l-1:l+1);}}
          style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:liked?'#ef4444':t.muted, background:'none', border:'none', cursor:'pointer', transition:'all 0.2s' }}>
          <Heart style={{ width:15, height:15, fill:liked?'currentColor':'none' }}/> {likes}
        </button>
        <button style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:t.muted, background:'none', border:'none', cursor:'pointer' }}>
          <Share2 style={{ width:14, height:14 }}/> Share
        </button>
      </div>
    </GCard>
  );
}

// ─── CV Section ───────────────────────────────────────────────
function CVSection({ cv, name, t }: any) {
  const [unlocked, setUnlocked] = useState(false);
  const [open, setOpen] = useState(false);
  const exps = cv?.experiences || [];
  const edu = cv?.education || [];
  return (
    <GCard t={t}>
      <button onClick={() => setOpen(!open)}
        style={{ display:'flex', justifyContent:'space-between', alignItems:'center', width:'100%', background:'none', border:'none', cursor:'pointer', padding:0 }}>
        <span style={{ fontSize:15, fontWeight:600, color:t.text, display:'flex', alignItems:'center', gap:8 }}>
          <Briefcase style={{ width:16, height:16, color:t.accent }}/> Experience & Education
        </span>
        {open ? <ChevronUp style={{ width:16, height:16, color:t.muted }}/> : <ChevronDown style={{ width:16, height:16, color:t.muted }}/>}
      </button>
      {open && (
        <div style={{ marginTop:16 }}>
          {exps.map((e:any) => (
            <div key={e.id} style={{ marginBottom:14, paddingBottom:14, borderBottom:`0.5px solid ${t.border}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  <p style={{ fontSize:14, fontWeight:600, color:t.text }}>{e.role}</p>
                  <p style={{ fontSize:13, color:t.accent }}>{e.company}</p>
                  <p style={{ fontSize:12, color:t.muted }}>{e.start} — {e.current?'Present':e.end}</p>
                  {e.lockLevel==='public' && e.description && (
                    <p style={{ fontSize:13, color:t.muted, marginTop:4, lineHeight:1.5 }}>{e.description}</p>
                  )}
                </div>
                <div style={{ width:8, height:8, borderRadius:'50%', background:e.current?t.accent:`${t.accent}40`, marginTop:4, flexShrink:0 }}/>
              </div>
              {e.lockLevel==='paid' && (
                <div style={{ display:'inline-flex', alignItems:'center', gap:6, marginTop:6, fontSize:12, padding:'3px 10px', borderRadius:20, background:`${t.accent}15`, color:t.accent, border:`0.5px solid ${t.accent}30` }}>
                  <Lock style={{ width:11, height:11 }}/> Premium — unlock with CV
                </div>
              )}
            </div>
          ))}
          {edu.map((e:any) => (
            <div key={e.id} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                <GraduationCap style={{ width:14, height:14, color:t.accent }}/>
                <p style={{ fontSize:14, fontWeight:600, color:t.text }}>{e.degree}</p>
              </div>
              <p style={{ fontSize:13, color:t.accent }}>{e.institution}</p>
              <p style={{ fontSize:12, color:t.muted }}>{e.start} — {e.current?'Present':e.end}</p>
            </div>
          ))}
        </div>
      )}

      {/* Contact lock */}
      <div style={{ marginTop:16, paddingTop:16, borderTop:`0.5px solid ${t.border}` }}>
        {!unlocked ? (
          <div style={{ textAlign:'center' }}>
            <div style={{ width:44, height:44, borderRadius:14, background:`${t.accent}15`, border:`0.5px solid ${t.accent}30`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
              <Lock style={{ width:22, height:22, color:t.accent }}/>
            </div>
            <p style={{ fontSize:14, fontWeight:600, color:t.text, marginBottom:4 }}>Contact locked</p>
            <p style={{ fontSize:12, color:t.muted, marginBottom:14 }}>
              {name} receives 50% · One-time unlock
            </p>
            <button onClick={() => setUnlocked(true)}
              style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:'12px', borderRadius:14, border:'none', background:t.accent, color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer', boxShadow:`0 0 20px ${t.accent}40` }}>
              <Unlock style={{ width:16, height:16 }}/> Unlock for $20 USDC
            </button>
            <p style={{ fontSize:11, color:t.muted, marginTop:8 }}>You pay $20 · {name} gets $10 instantly</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <p style={{ fontSize:14, fontWeight:600, color:t.text, marginBottom:4 }}>📞 Contact Details</p>
            {cv?.contact?.email && (
              <a href={`mailto:${cv.contact.email}`} style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:t.accent, textDecoration:'none' }}>
                <Mail style={{ width:14, height:14 }}/> {cv.contact.email}
              </a>
            )}
            {cv?.contact?.phone && (
              <p style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:t.muted }}>
                <Phone style={{ width:14, height:14 }}/> {cv.contact.phone}
              </p>
            )}
            {cv?.contact?.linkedin && (
              <a href={`https://${cv.contact.linkedin}`} target="_blank" rel="noopener noreferrer"
                style={{ display:'flex', alignItems:'center', gap:8, fontSize:13, color:t.accent, textDecoration:'none' }}>
                <Linkedin style={{ width:14, height:14 }}/> {cv.contact.linkedin}
              </a>
            )}
          </div>
        )}
      </div>
    </GCard>
  );
}

// ─── Video Card ───────────────────────────────────────────────
function VideoCard({ video, t }: any) {
  const [unlocked, setUnlocked] = useState(!video.paywall_enabled);
  const ytId = video.youtube_id || video.youtubeId;
  const thumb = video.thumbnail_url || `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
  return (
    <GCard t={t} style={{ padding:0, overflow:'hidden', marginBottom:12 }}>
      <div style={{ position:'relative', cursor:'pointer' }} onClick={() => !unlocked && setUnlocked(true)}>
        <img src={thumb} alt={video.title} style={{ width:'100%', height:200, objectFit:'cover', filter:unlocked?'none':'blur(3px) brightness(0.6)' }}/>
        {!unlocked && (
          <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:8 }}>
            <div style={{ width:52, height:52, borderRadius:'50%', background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Lock style={{ width:24, height:24, color:'#fff' }}/>
            </div>
            <span style={{ fontSize:12, fontWeight:700, color:'#fff', padding:'4px 14px', borderRadius:20, background:`${t.accent}cc` }}>
              ${video.paywall_price} USDC · {video.access_hours||24}h access
            </span>
          </div>
        )}
      </div>
      {unlocked && (
        <div style={{ position:'relative', paddingTop:'56.25%' }}>
          <iframe src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
            style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}
            allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"/>
        </div>
      )}
      <div style={{ padding:16 }}>
        <p style={{ fontSize:14, fontWeight:600, color:t.text, marginBottom:4 }}>{video.title}</p>
        {video.description && <p style={{ fontSize:12, color:t.muted, lineHeight:1.5 }}>{video.description}</p>}
        {!unlocked && (
          <button onClick={() => setUnlocked(true)}
            style={{ marginTop:12, display:'flex', alignItems:'center', justifyContent:'center', gap:8, width:'100%', padding:10, borderRadius:12, border:'none', background:t.accent, color:'#fff', fontSize:13, fontWeight:600, cursor:'pointer' }}>
            <Play style={{ width:14, height:14 }}/> Unlock · ${video.paywall_price} USDC
          </button>
        )}
      </div>
    </GCard>
  );
}

// ─── Main Component ───────────────────────────────────────────
export default function MiniSiteClient({ profile }: { profile: any }) {
  const t = getTheme(profile);
  const cols = profile.columns || 1;
  const feedPosts = profile.feedPosts || [];
  const videos = profile.videos || [];
  const links = profile.links || [];
  const cv = profile.cv || {};

  const sortedPosts = [...feedPosts].sort((a,b) => {
    if (a.pinned&&!b.pinned) return -1;
    if (!a.pinned&&b.pinned) return 1;
    return new Date(b.created_at).getTime()-new Date(a.created_at).getTime();
  });

  const SOCIAL_ICONS: Record<string,any> = {
    linkedin: Linkedin, github: Globe, instagram: Hash,
    twitter: Hash, youtube: Play, tiktok: Hash, website: Globe,
    email: Mail, whatsapp: Phone,
  };

  return (
    <div style={{ minHeight:'100vh', background:t.bg, color:t.text, fontFamily:"-apple-system,'Plus Jakarta Sans',sans-serif" }}>
      {/* Ambient */}
      <div style={{ position:'fixed', top:-300, left:'50%', transform:'translateX(-50%)', width:700, height:700, borderRadius:'50%', background:t.accent, opacity:0.06, filter:'blur(100px)', pointerEvents:'none', zIndex:0 }}/>

      {/* Nav */}
      <nav style={{ position:'sticky', top:0, zIndex:50, display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 20px', background:t.isDark?'rgba(5,5,8,0.85)':'rgba(255,255,255,0.85)', backdropFilter:'blur(20px)', borderBottom:`0.5px solid ${t.border}` }}>
        <a href="/" style={{ display:'flex', alignItems:'center', gap:6, textDecoration:'none', opacity:0.7 }}>
          <Hash style={{ width:16, height:16, color:t.accent }}/>
          <span style={{ fontSize:13, fontWeight:700, color:t.accent }}>jobinlink</span>
        </a>
        <a href="/signup" style={{ fontSize:12, fontWeight:600, padding:'6px 14px', borderRadius:10, background:t.accent, color:'#fff', textDecoration:'none' }}>
          Create yours
        </a>
      </nav>

      {/* Banner */}
      <div style={{ height:160, background:t.gradient, position:'relative', overflow:'hidden' }}>
        {profile.banner_url && <img src={profile.banner_url} alt="" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', opacity:0.6 }}/>}
      </div>

      {/* Content */}
      <div style={{ maxWidth: cols===3?960:cols===2?720:520, margin:'0 auto', padding:'0 20px 60px', position:'relative', zIndex:1 }}>

        {/* Hero */}
        <div style={{ marginTop:-60, marginBottom:28 }}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.site_name} style={{ width:100, height:100, borderRadius:cols===1?'50%':16, objectFit:'cover', border:`3px solid ${t.isDark?'#0a0a0f':'#fff'}`, boxShadow:`0 0 0 2px ${t.accent}40`, marginBottom:16 }}/>
          ) : (
            <div style={{ width:100, height:100, borderRadius:cols===1?'50%':16, background:`linear-gradient(135deg,${t.accent},${t.accent}88)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36, fontWeight:800, color:'#fff', border:`3px solid ${t.isDark?'#0a0a0f':'#fff'}`, marginBottom:16 }}>
              {profile.site_name?.charAt(0)||'?'}
            </div>
          )}

          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
            <h1 style={{ fontSize:24, fontWeight:800, color:t.text }}>{profile.site_name}</h1>
            {profile.badge==='blue' && <BadgeCheck style={{ width:22, height:22, color:'#3b82f6' }}/>}
            {profile.badge==='gold' && <Award style={{ width:22, height:22, color:'#f59e0b' }}/>}
          </div>
          {profile.tagline && <p style={{ fontSize:14, color:t.muted, marginBottom:6 }}>{profile.tagline}</p>}
          {profile.cv_location && (
            <p style={{ display:'flex', alignItems:'center', gap:4, fontSize:13, color:`${t.muted}`, marginBottom:12 }}>
              <MapPin style={{ width:13, height:13 }}/> {profile.cv_location}
            </p>
          )}

          {/* Skills */}
          {profile.cv_skills && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
              {profile.cv_skills.split(',').map((sk:string) => (
                <span key={sk} style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:`${t.accent}12`, color:t.accent, border:`0.5px solid ${t.accent}25` }}>{sk.trim()}</span>
              ))}
            </div>
          )}

          {profile.bio && (
            <p style={{ fontSize:14, color:t.muted, lineHeight:1.65, marginBottom:16 }}>{profile.bio}</p>
          )}
        </div>

        {/* Grid */}
        <div style={{ display:'grid', gridTemplateColumns:cols===1?'1fr':cols===2?'1fr 1fr':'1fr 1fr 1fr', gap:16 }}>

          {/* Feed */}
          {sortedPosts.length > 0 && (
            <div style={{ gridColumn:cols>1?'1':undefined }}>
              {sortedPosts.map(post => <FeedPostCard key={post.id} post={post} t={t}/>)}
            </div>
          )}

          {/* Links */}
          {links.length > 0 && (
            <div>
              {links.map((link:any) => (
                <GCard key={link.id} t={t} style={{ marginBottom:10, padding:'14px 18px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:14, fontWeight:600, color:t.text, marginBottom:2 }}>{link.title}</p>
                      {link.description && <p style={{ fontSize:12, color:t.muted }}>{link.description}</p>}
                    </div>
                    {link.locked ? (
                      <span style={{ fontSize:11, padding:'3px 10px', borderRadius:20, background:`${t.accent}15`, color:t.accent, border:`0.5px solid ${t.accent}30`, whiteSpace:'nowrap', marginLeft:10 }}>
                        🔒 ${link.lockPrice}
                      </span>
                    ) : (
                      <a href={link.url} target="_blank" rel="noopener noreferrer"
                        style={{ color:t.accent, marginLeft:10, flexShrink:0 }}>
                        <ExternalLink style={{ width:16, height:16 }}/>
                      </a>
                    )}
                  </div>
                </GCard>
              ))}
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div>
              {videos.map((v:any) => <VideoCard key={v.id} video={v} t={t}/>)}
            </div>
          )}

          {/* CV */}
          {profile.show_cv && (
            <div style={{ gridColumn:cols>1?`1 / -1`:undefined }}>
              <CVSection cv={cv} name={profile.site_name} t={t}/>
            </div>
          )}

        </div>

        {/* Footer */}
        <div style={{ marginTop:40, paddingTop:20, borderTop:`0.5px solid ${t.border}`, textAlign:'center' }}>
          <p style={{ fontSize:12, color:`${t.muted}`, opacity:0.6 }}>
            Powered by <a href="/" style={{ color:t.accent, textDecoration:'none' }}>TrustBank</a>
            {' · '}
            <a href="/signup" style={{ color:t.accent, textDecoration:'none' }}>Create your mini-site</a>
          </p>
        </div>
      </div>
    </div>
  );
}
