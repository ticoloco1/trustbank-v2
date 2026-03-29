'use client';
import { useState, useEffect } from 'react';
import {
  Hash, Shield, Activity, Users, Globe, Crown, BadgeCheck,
  Video, Megaphone, DollarSign, Settings, Loader2, Search,
  Ban, CheckCircle, Trash2, Eye, EyeOff, Plus, TrendingUp,
  Power, Check, X, Send, Percent, Gavel, Timer, Upload,
  Filter, Tag, AtSign, Key, Palette, RefreshCw, Hexagon,
  Coins, ShoppingBag, FileText, BarChart3, Lock, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { normalizeSlug } from '@/lib/slug';

const A = '#8b5cf6';
const ADMIN_EMAILS: string[] = ['arytcfme@gmail.com', 'arytcf@gmail.com'];

const DEFAULT_PRICES: Record<number, number> = {
  1:2000, 2:1500, 3:1000, 4:500, 5:250, 6:100, 7:50
};
const SLUG_CATS = ['general','profession','tech','finance','entertainment','lifestyle','creative','media'];
const LENGTH_FILTERS = [
  { label:'Todas', value:0 }, { label:'1', value:1 }, { label:'2', value:2 },
  { label:'3', value:3 }, { label:'4', value:4 }, { label:'5', value:5 },
  { label:'6', value:6 }, { label:'7+', value:7 },
];

// ─── UI helpers ──────────────────────────────────────────────
function GInput({ label, value, onChange, placeholder, type='text', small=false }: any) {
  return (
    <div style={{ marginBottom:small?0:12 }}>
      {label&&<label style={{ display:'block', fontSize:11, fontWeight:600, color:'rgba(241,245,249,0.45)', marginBottom:5, textTransform:'uppercase' as const, letterSpacing:'0.06em' }}>{label}</label>}
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:'100%', padding:small?'6px 10px':'9px 12px', borderRadius:10, border:'0.5px solid rgba(255,255,255,0.12)', background:'white', color:'#111827', fontSize:small?12:13, outline:'none', fontFamily:'inherit', boxSizing:'border-box' as const }}/>
    </div>
  );
}

function GCard({ children, style }: any) {
  return <div style={{ background:'white', border:'0.5px solid rgba(255,255,255,0.09)', borderRadius:16, padding:20, ...style }}>{children}</div>;
}

function SectionTitle({ icon:Icon, title, color=A }: any) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
      <Icon style={{ width:16, height:16, color }}/>
      <p style={{ fontSize:12, fontWeight:700, color, textTransform:'uppercase' as const, letterSpacing:'0.1em', margin:0 }}>{title}</p>
    </div>
  );
}

function Btn({ children, onClick, disabled, style, danger, ghost }: any) {
  const bg = danger ? 'rgba(239,68,68,0.12)' : ghost ? 'rgba(255,255,255,0.04)' : A;
  const color = danger ? '#ef4444' : ghost ? '#6b7280' : '#fff';
  const border = danger ? 'rgba(239,68,68,0.3)' : ghost ? 'rgba(255,255,255,0.10)' : 'transparent';
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px', borderRadius:10, border:`0.5px solid ${border}`, background:bg, color, fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'inherit', opacity:disabled?0.4:1, transition:'all 0.2s', ...style }}>
      {children}
    </button>
  );
}

function StatCard({ label, value, icon:Icon, color }: any) {
  return (
    <GCard style={{ display:'flex', alignItems:'center', gap:14 }}>
      <div style={{ width:38, height:38, borderRadius:10, background:`${color}15`, border:`0.5px solid ${color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon style={{ width:18, height:18, color }}/>
      </div>
      <div>
        <p style={{ fontSize:20, fontWeight:800, color:'#111827', margin:0 }}>{value}</p>
        <p style={{ fontSize:11, color:'#9ca3af', margin:0 }}>{label}</p>
      </div>
    </GCard>
  );
}

function Toast({ msg, ok }: { msg:string; ok:boolean }) {
  return (
    <div style={{ position:'fixed', top:16, right:16, zIndex:200, padding:'12px 20px', borderRadius:14, background:ok?'rgba(16,185,129,0.12)':'rgba(239,68,68,0.12)', border:`0.5px solid ${ok?'rgba(16,185,129,0.4)':'rgba(239,68,68,0.4)'}`, color:ok?'#10b981':'#ef4444', fontSize:13, backdropFilter:'none', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>
      {ok?'✓ ':''}{msg}
    </div>
  );
}

// ─── Number setting input (save on click) ────────────────────
function NumInput({ label, value, onSave }: { label:string; value:number; onSave:(v:number)=>void }) {
  const [v, setV] = useState(String(value));
  useEffect(()=>setV(String(value)),[value]);
  return (
    <div>
      <label style={{ display:'block', fontSize:11, color:'rgba(241,245,249,0.45)', marginBottom:6 }}>{label}</label>
      <div style={{ display:'flex', gap:6 }}>
        <input type="number" value={v} onChange={e=>setV(e.target.value)} step="0.01"
          style={{ flex:1, padding:'8px 10px', borderRadius:10, border:'0.5px solid rgba(255,255,255,0.12)', background:'white', color:'#111827', fontSize:12, outline:'none', fontFamily:'monospace' }}/>
        <button onClick={()=>onSave(parseFloat(v)||0)}
          style={{ padding:'8px 12px', borderRadius:10, border:'none', background:A, color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
          <Check style={{ width:13, height:13 }}/>
        </button>
      </div>
    </div>
  );
}

function TxtInput({ label, value, onSave, placeholder }: any) {
  const [v, setV] = useState(value||'');
  useEffect(()=>setV(value||''),[value]);
  return (
    <div>
      <label style={{ display:'block', fontSize:11, color:'rgba(241,245,249,0.45)', marginBottom:6 }}>{label}</label>
      <div style={{ display:'flex', gap:6 }}>
        <input type="text" value={v} onChange={e=>setV(e.target.value)} placeholder={placeholder}
          style={{ flex:1, padding:'8px 10px', borderRadius:10, border:'0.5px solid rgba(255,255,255,0.12)', background:'white', color:'#111827', fontSize:11, outline:'none', fontFamily:'monospace' }}/>
        <button onClick={()=>onSave(v)}
          style={{ padding:'8px 12px', borderRadius:10, border:'none', background:A, color:'#fff', fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
          <Check style={{ width:13, height:13 }}/>
        </button>
      </div>
    </div>
  );
}

const TABS = [
  { id:'analytics',  label:'Analytics',    icon:Activity },
  { id:'minisites',  label:'Mini-Sites',    icon:Globe },
  { id:'slugs',      label:'Slugs Premium', icon:Crown },
  { id:'auctions',   label:'Leilões',       icon:Gavel },
  { id:'badges',     label:'Badges',        icon:BadgeCheck },
  { id:'videos',     label:'Vídeos',        icon:Video },
  { id:'ads',        label:'Anúncios',      icon:Megaphone },
  { id:'revenue',    label:'Revenue Splits',icon:Percent },
  { id:'settings',   label:'Plataforma',    icon:Settings },
];

export default function AdminClient() {
  const { user } = useAuth();
  const [tab, setTab] = useState('analytics');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{msg:string;ok:boolean}|null>(null);
  const showToast = (msg:string,ok=true)=>{ setToast({msg,ok}); setTimeout(()=>setToast(null),3500); };

  // Data
  const [analytics, setAnalytics] = useState<any>(null);
  const [sites, setSites] = useState<any[]>([]);
  const [premiumSlugs, setPremiumSlugs] = useState<any[]>([]);
  const [slugAuctions, setSlugAuctions] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});

  // Slug management state
  const [newSlug, setNewSlug] = useState('');
  const [newSlugPrice, setNewSlugPrice] = useState('500');
  const [newSlugCat, setNewSlugCat] = useState('general');
  const [bulkText, setBulkText] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkCat, setBulkCat] = useState('general');
  const [lenFilter, setLenFilter] = useState(0);
  const [selectedSlugIds, setSelectedSlugIds] = useState<Set<string>>(new Set());
  const [bulkPrice, setBulkPrice] = useState('');
  const [editingSlugId, setEditingSlugId] = useState<string|null>(null);
  const [editSlugPrice, setEditSlugPrice] = useState('');
  const [transferSlugId, setTransferSlugId] = useState<string|null>(null);
  const [transferEmail, setTransferEmail] = useState('');

  // Auction state
  const [auctionMode, setAuctionMode] = useState(false);
  const [auctionSlug, setAuctionSlug] = useState('');
  const [auctionMin, setAuctionMin] = useState('100');
  const [auctionIncrement, setAuctionIncrement] = useState('10');
  const [auctionDays, setAuctionDays] = useState('7');

  // Badge state
  const [grantSlug, setGrantSlug] = useState('');
  const [grantType, setGrantType] = useState<'blue'|'gold'>('blue');

  // Mini-sites
  const [editingSiteId, setEditingSiteId] = useState<string|null>(null);
  const [editSitePrice, setEditSitePrice] = useState('');

  // ⚠️ TODO antes do launch: adicione seu email em ADMIN_EMAILS para restringir
  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email || '');


  const registerBulkFree = async () => {
    const list = bulkText.split(/[\n,]/).map((s:string) => s.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')).filter(Boolean);
    if (!list.length || !user) return;
    setLoading(true);
    const results: string[] = [];
    for (const slug of list) {
      const { data: ex } = await (supabase as any).from('slug_registrations').select('id').eq('slug', slug).maybeSingle();
      if (ex) { results.push(`⚠️ ${slug} already exists`); continue; }
      const price = parseInt(newSlugPrice) || 100;
      await (supabase as any).from('slug_registrations').insert({
        user_id: user.id, slug, status: 'active',
        expires_at: new Date(Date.now() + 365*86400000).toISOString(),
        for_sale: false,
      });
      results.push(`✅ ${slug}.trustbank.xyz registered`);
    }
    showToast(results.filter(r => r.startsWith('✅')).length + ' slugs registered!');
    setBulkText('');
    setLoading(false);
  };

  const loadAllRegistered = async (search = '') => {
    setLoading(true);
    let q = (supabase as any).from('slug_registrations').select('*, mini_sites(site_name)').order('created_at', { ascending: false }).limit(200);
    if (search) q = q.ilike('slug', \`%\${search}%\`);
    const { data } = await q;
    setPremiumSlugs(prev => prev); // keep premium
    setLoading(false);
    return data || [];
  };

  useEffect(()=>{
    if (!isAdmin) return;
    loadTab(tab);
  }, [tab, isAdmin]);

  const loadTab = async (t:string) => {
    setLoading(true);
    try {
      if (t==='analytics') await loadAnalytics();
      else if (t==='minisites') { const {data}=await supabase.from('mini_sites').select('*').order('created_at',{ascending:false}).limit(300); setSites(data||[]); }
      else if (t==='slugs') await loadSlugs();
      else if (t==='auctions') { const {data}=await supabase.from('slug_auctions').select('*').order('created_at',{ascending:false}).limit(50); setSlugAuctions(data||[]); }
      else if (t==='badges') { const {data}=await supabase.from('mini_sites').select('id,slug,site_name,avatar_url,badge,platform').not('badge','is',null).order('created_at',{ascending:false}).limit(100); setBadges(data||[]); }
      else if (t==='videos') { const {data}=await supabase.from('mini_site_videos').select('*').order('created_at',{ascending:false}).limit(200); setVideos(data||[]); }
      else if (t==='ads') { const {data}=await supabase.from('ads').select('*').order('created_at',{ascending:false}).limit(200); setAds(data||[]); }
      else if (t==='settings'||t==='revenue') await loadSettings();
    } catch(e){}
    setLoading(false);
  };

  const loadAnalytics = async () => {
    const [s,v,sl,a] = await Promise.all([
      supabase.from('mini_sites').select('id,published',{count:'exact'}),
      supabase.from('mini_site_videos').select('id,paywall_enabled,paywall_price',{count:'exact'}),
      supabase.from('premium_slugs').select('id,price,sold',{count:'exact'}),
      supabase.from('ads').select('id,amount_usdc,status',{count:'exact'}),
    ]);
    setAnalytics({
      totalSites:s.count||0, publishedSites:(s.data||[]).filter((x:any)=>x.published).length,
      totalVideos:v.count||0, paywallVideos:(v.data||[]).filter((x:any)=>x.paywall_enabled).length,
      slugRevenue:(sl.data||[]).filter((x:any)=>x.sold).reduce((n:number,x:any)=>n+Number(x.price||0),0),
      adsRevenue:(a.data||[]).filter((x:any)=>x.status!=='pending').reduce((n:number,x:any)=>n+Number(x.amount_usdc||0),0),
      totalSlugs:sl.count||0, soldSlugs:(sl.data||[]).filter((x:any)=>x.sold).length,
    });
  };

  const loadSlugs = async () => {
    const {data}=await supabase.from('premium_slugs').select('*').order('category').order('price',{ascending:false});
    setPremiumSlugs(data||[]);
  };

  const loadSettings = async () => {
    const {data}=await supabase.from('platform_config').select('*').eq('id',1).maybeSingle();
    setSettings(data||{
      nft_launch_fee:300, nft_creator_pct:70, nft_platform_pct:30,
      paywall_creator_pct:60, paywall_platform_pct:40, paywall_expires_hours:12,
      paywall_min_embed:0.10,
      recharge_creator_pct:50, recharge_platform_pct:50,
      marketplace_fee_pct:5, marketplace_creator_pct:2, marketplace_platform_pct:3,
      cv_unlock_price:20, cv_creator_pct:50, cv_platform_pct:50,
      commission_shares:5, commission_ads:35, brokerage_fee_pct:0.5,
      monthly_price_jobinlink:14.99, monthly_price_trustbank:29.90,
      monthly_price_hashpo:9.99, monthly_price_mybik:9.99,
      boost_price_per_position:1.50, boost_top_price:1000, boost_top_days:7,
      slug_fee_pct:5, slug_registration_fee:12, slug_renewal_fee:12,
      polygon_contract_address:'', polygon_receiver_address:'',
    });
  };

  const saveSetting = async (key:string,value:any) => {
    await supabase.from('platform_config').upsert({id:1,[key]:value,updated_at:new Date().toISOString()} as any);
    setSettings((p:any)=>({...p,[key]:value}));
    showToast(`${key} salvo`);
  };

  // ── Slug actions ──────────────────────────────────────────
  const handleAddSlug = async () => {
    const s=normalizeSlug(newSlug); if(!s) return;
    const price=parseFloat(newSlugPrice)||DEFAULT_PRICES[Math.min(s.length,7)]||50;
    const {error}=await supabase.from('premium_slugs').insert({slug:s,keyword:s,category:newSlugCat,price,active:true,sold:false} as any);
    if(error){showToast(error.message,false);return;}
    showToast(`/${s} adicionado por $${price}`);
    setNewSlug(''); loadSlugs();
  };

  const handleBulkSlugs = async () => {
    const lines=bulkText.split('\n').map(l=>l.trim()).filter(Boolean);
    const seen=new Set<string>(); const rows:any[]=[];
    for(const line of lines){
      const parts=line.split(/[:\t,;]+/).map(p=>p.trim());
      const s=normalizeSlug(parts[0]||''); if(!s||seen.has(s))continue; seen.add(s);
      const price=parts[1]?parseFloat(parts[1]):(DEFAULT_PRICES[Math.min(s.length,7)]||50);
      rows.push({slug:s,keyword:s,category:bulkCat,price:isNaN(price)?50:price,active:true,sold:false});
    }
    if(!rows.length){showToast('Nenhum slug válido',false);return;}
    // Skip existing
    const {data:existing}=await supabase.from('premium_slugs').select('slug').in('slug',rows.map(r=>r.slug));
    const existSet=new Set((existing||[]).map((r:any)=>r.slug));
    const toInsert=rows.filter(r=>!existSet.has(r.slug));
    if(!toInsert.length){showToast(`0 novos. ${rows.length} já existiam`,false);return;}
    const {error}=await supabase.from('premium_slugs').insert(toInsert);
    if(error){showToast(error.message,false);return;}
    showToast(`${toInsert.length} slugs importados${existSet.size?` · ${existSet.size} ignorados (já existiam)`:''}`);
    setBulkText(''); setBulkMode(false); loadSlugs();
  };

  const applyBulkPrice = async () => {
    const price=parseFloat(bulkPrice); if(!selectedSlugIds.size||isNaN(price)){showToast('Selecione slugs e defina preço',false);return;}
    const {error}=await supabase.from('premium_slugs').update({price}).in('id',Array.from(selectedSlugIds));
    if(error){showToast(error.message,false);return;}
    showToast(`Preço $${price} aplicado a ${selectedSlugIds.size} slugs`);
    setSelectedSlugIds(new Set()); setBulkPrice(''); loadSlugs();
  };

  const applyLenPrice = async (len:number) => {
    const price=DEFAULT_PRICES[len]||50;
    const ids=(premiumSlugs||[]).filter((s:any)=>s.slug?.length===len).map((s:any)=>s.id);
    if(!ids.length){showToast(`Nenhum slug com ${len} letra(s)`,false);return;}
    await supabase.from('premium_slugs').update({price}).in('id',ids);
    showToast(`${ids.length} slugs de ${len} letra(s) → $${price}`);
    loadSlugs();
  };

  const toggleSlugActive = async (id:string,active:boolean) => {
    await supabase.from('premium_slugs').update({active:!active} as any).eq('id',id);
    setPremiumSlugs(p=>p.map((s:any)=>s.id===id?{...s,active:!active}:s));
  };

  const deleteSlug = async (id:string,slug:string) => {
    if(!confirm(`Deletar /${slug}?`))return;
    await supabase.from('premium_slugs').delete().eq('id',id);
    setPremiumSlugs(p=>p.filter((s:any)=>s.id!==id));
    showToast(`/${slug} deletado`);
  };

  const handleTransfer = async (slugId:string) => {
    if(!transferEmail.trim()){return;}
    const {data:profile}=await supabase.from('profiles').select('user_id').ilike('display_name',transferEmail.trim()).maybeSingle();
    if(!profile){showToast('Usuário não encontrado',false);return;}
    await supabase.from('premium_slugs').update({sold:true,buyer_id:profile.user_id,sold_at:new Date().toISOString()} as any).eq('id',slugId);
    showToast('Slug transferido'); setTransferSlugId(null); setTransferEmail(''); loadSlugs();
  };

  // ── Auction actions ───────────────────────────────────────
  const createAuction = async () => {
    const s=normalizeSlug(auctionSlug); if(!s){showToast('Slug inválido',false);return;}
    const startingPrice=parseFloat(auctionMin)||100;
    const minInc=parseFloat(auctionIncrement)||10;
    const endsAt=new Date(Date.now()+parseInt(auctionDays)*864e5).toISOString();
    const {error}=await supabase.from('slug_auctions').insert({keyword:s,starting_price:startingPrice,min_increment:minInc,current_bid:null,status:'active',ends_at:endsAt,seller_id:user?.id});
    if(error){showToast(error.message,false);return;}
    showToast(`Leilão de /${s} criado por ${auctionDays} dias`);
    setAuctionSlug(''); setAuctionMode(false);
    const {data}=await supabase.from('slug_auctions').select('*').order('created_at',{ascending:false}).limit(20);
    setSlugAuctions(data||[]);
  };

  const closeAuction = async (id:string) => {
    await supabase.from('slug_auctions').update({status:'closed'} as any).eq('id',id);
    setSlugAuctions(p=>p.map((a:any)=>a.id===id?{...a,status:'closed'}:a));
    showToast('Leilão encerrado');
  };

  // ── Badge actions ─────────────────────────────────────────
  const grantBadge = async () => {
    const slug=normalizeSlug(grantSlug); if(!slug)return;
    const {data,error}=await supabase.from('mini_sites').update({badge:grantType} as any).eq('slug',slug).select('id,slug,site_name,badge').single();
    if(error){showToast(error.message,false);return;}
    showToast(`Badge ${grantType} concedido a /${slug}`);
    setGrantSlug('');
    setBadges(p=>[data,...p.filter((b:any)=>b.slug!==slug)]);
  };

  const revokeBadge = async (id:string) => {
    await supabase.from('mini_sites').update({badge:null} as any).eq('id',id);
    setBadges(p=>p.filter((b:any)=>b.id!==id));
    showToast('Badge revogado');
  };

  // ── Mini-sites actions ────────────────────────────────────
  const toggleSite = async (id:string,field:'published'|'blocked',cur:boolean) => {
    await supabase.from('mini_sites').update({[field]:!cur} as any).eq('id',id);
    setSites(p=>p.map((s:any)=>s.id===id?{...s,[field]:!cur}:s));
  };

  const deleteSite = async (id:string,name:string) => {
    if(!confirm(`Deletar "${name}"?`))return;
    await supabase.from('mini_sites').delete().eq('id',id);
    setSites(p=>p.filter((s:any)=>s.id!==id));
    showToast('Site deletado');
  };

  const saveSitePrice = async (id:string) => {
    const price=parseFloat(editSitePrice);
    if(isNaN(price)||price<0){showToast('Preço inválido',false);return;}
    await supabase.from('mini_sites').update({monthly_price:price} as any).eq('id',id);
    setSites(p=>p.map((s:any)=>s.id===id?{...s,monthly_price:price}:s));
    setEditingSiteId(null);
    showToast('Preço atualizado');
  };

  // ── Ad actions ────────────────────────────────────────────
  const setAdStatus = async (id:string,status:'active'|'rejected') => {
    await supabase.from('ads').update({status} as any).eq('id',id);
    setAds(p=>p.map((a:any)=>a.id===id?{...a,status}:a));
    showToast(status==='active'?'Anúncio aprovado':'Anúncio rejeitado');
  };

  // ── Slug filtering ────────────────────────────────────────
  const filteredSlugs = (premiumSlugs||[]).filter((s:any)=>{
    const ms=!search||s.slug?.includes(search.toLowerCase())||s.category?.includes(search.toLowerCase());
    const ml=lenFilter===0||(lenFilter===7?s.slug?.length>=7:s.slug?.length===lenFilter);
    return ms&&ml;
  });

  const slugsByCat = SLUG_CATS.map(cat=>({
    cat, items: filteredSlugs.filter((s:any)=>s.category===cat)
  })).filter(g=>g.items.length>0);

  // Other filtered
  const fs = (items:any[],...fields:string[]) =>
    !search.trim()?items:items.filter(i=>fields.some(f=>(i[f]||'').toLowerCase().includes(search.toLowerCase())));

  if(!user) return (
    <div style={{minHeight:'100vh',background:'#f9fafb',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{textAlign:'center'}}><Lock style={{width:40,height:40,color:A,margin:'0 auto 16px'}}/><p style={{color:'#111827',fontSize:16,fontWeight:600,marginBottom:8}}>Admin restrito</p><a href="/login" style={{color:A,fontSize:13}}>Fazer login →</a></div>
    </div>
  );

  if(!isAdmin) return (
    <div style={{minHeight:'100vh',background:'#f9fafb',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <div style={{textAlign:'center'}}>
        <Shield style={{width:40,height:40,color:'#ef4444',margin:'0 auto 16px'}}/>
        <p style={{color:'#111827',fontSize:16,fontWeight:600,marginBottom:4}}>Acesso negado</p>
        <p style={{color:'#9ca3af',fontSize:13,marginBottom:12}}>Logado como: {user.email}</p>
        <p style={{color:'#9ca3af',fontSize:11}}>Adicione seu email em ADMIN_EMAILS no arquivo AdminClient.tsx</p>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:'100vh',background:'#f9fafb',color:'#111827',fontFamily:"-apple-system,'Plus Jakarta Sans',sans-serif",display:'flex'}}>
      {toast&&<Toast msg={toast.msg} ok={toast.ok}/>}

      {/* Sidebar */}
      <aside style={{width:200,flexShrink:0,borderRight:'0.5px solid rgba(255,255,255,0.07)',background:'white',display:'flex',flexDirection:'column',position:'sticky',top:0,height:'100vh',overflowY:'auto'}}>
        <div style={{padding:'16px',borderBottom:'1px solid #e5e7eb',display:'flex',alignItems:'center',gap:8}}>
          <div style={{width:30,height:30,borderRadius:8,background:A,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Shield style={{width:14,height:14,color:'#fff'}}/></div>
          <div><p style={{fontSize:13,fontWeight:800,color:A,margin:0}}>Admin</p><p style={{fontSize:10,color:'#9ca3af',margin:0}}>TrustBank</p></div>
        </div>
        <nav style={{flex:1,padding:'8px 8px'}}>
          {TABS.map(t=>{const Icon=t.icon;const active=tab===t.id;return(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{width:'100%',display:'flex',alignItems:'center',gap:8,padding:'9px 10px',borderRadius:10,border:'none',cursor:'pointer',fontSize:12,fontWeight:active?600:400,color:active?A:'rgba(241,245,249,0.45)',background:active?`${A}12`:'transparent',marginBottom:1,textAlign:'left',fontFamily:'inherit',transition:'all 0.15s',borderLeft:active?`2px solid ${A}`:'2px solid transparent'}}>
              <Icon style={{width:14,height:14,flexShrink:0}}/>{t.label}
            </button>
          );})}
        </nav>
        <div style={{padding:'12px',borderTop:'0.5px solid rgba(255,255,255,0.07)',fontSize:10,color:'#9ca3af',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.email}</div>
      </aside>

      {/* Main */}
      <main style={{flex:1,minWidth:0,overflowY:'auto'}}>
        <div style={{position:'sticky',top:0,zIndex:10,padding:'12px 24px',borderBottom:'1px solid #e5e7eb',background:'rgba(255,255,255,0.92)',backdropFilter:'none',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <h1 style={{fontSize:14,fontWeight:600,color:'#111827',margin:0}}>{TABS.find(t=>t.id===tab)?.label}</h1>
          <div style={{display:'flex',gap:10}}>
            <div style={{position:'relative'}}>
              <Search style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',width:12,height:12,color:'rgba(141,92,246,0.5)'}}/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar..."
                style={{padding:'7px 10px 7px 24px',borderRadius:10,border:'0.5px solid rgba(255,255,255,0.09)',background:'white',color:'#111827',fontSize:12,outline:'none',width:160,fontFamily:'inherit'}}/>
            </div>
            <button onClick={()=>loadTab(tab)}
              style={{display:'flex',alignItems:'center',gap:4,padding:'7px 12px',borderRadius:10,border:'0.5px solid rgba(255,255,255,0.09)',background:'white',color:'#6b7280',fontSize:12,cursor:'pointer',fontFamily:'inherit'}}>
              {loading?<Loader2 style={{width:12,height:12,animation:'spin 1s linear infinite'}}/>:<RefreshCw style={{width:12,height:12}}/>} Atualizar
            </button>
          </div>
        </div>

        <div style={{padding:'24px'}}>

          {/* ══ ANALYTICS ══ */}
          {tab==='analytics'&&analytics&&(
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:12,marginBottom:20}}>
                <StatCard label="Mini-sites" value={analytics.totalSites} icon={Globe} color={A}/>
                <StatCard label="Publicados" value={analytics.publishedSites} icon={Eye} color="#10b981"/>
                <StatCard label="Vídeos" value={analytics.totalVideos} icon={Video} color="#f59e0b"/>
                <StatCard label="Com paywall" value={analytics.paywallVideos} icon={Lock} color="#ec4899"/>
                <StatCard label="Slugs premium" value={analytics.totalSlugs} icon={Crown} color="#f59e0b"/>
                <StatCard label="Slugs vendidos" value={analytics.soldSlugs} icon={CheckCircle} color="#10b981"/>
                <StatCard label="Receita slugs" value={`$${analytics.slugRevenue.toLocaleString()}`} icon={DollarSign} color="#06b6d4"/>
                <StatCard label="Receita ads" value={`$${analytics.adsRevenue.toLocaleString()}`} icon={Megaphone} color="#8b5cf6"/>
              </div>
            </div>
          )}

          {/* ══ MINI-SITES ══ */}
          {tab==='minisites'&&(
            <div>
              <p style={{fontSize:12,color:'#9ca3af',marginBottom:14}}>{fs(sites,'site_name','slug').length} sites</p>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                  <thead>
                    <tr style={{borderBottom:'1px solid #e5e7eb'}}>
                      {['Nome','Slug','Tema','$/mês','CV','Status','Publicado','Ações'].map(h=>(
                        <th key={h} style={{padding:'8px 10px',textAlign:'left',color:'#9ca3af',fontWeight:600,whiteSpace:'nowrap'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {fs(sites,'site_name','slug').map((s:any)=>(
                      <tr key={s.id} style={{borderBottom:'0.5px solid rgba(255,255,255,0.05)',opacity:s.blocked?0.5:1}}>
                        <td style={{padding:'8px 10px',color:'#111827',fontWeight:500,maxWidth:140,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.site_name||'—'}</td>
                        <td style={{padding:'8px 10px',fontFamily:'monospace',color:A}}>@{s.slug}</td>
                        <td style={{padding:'8px 10px',color:'#9ca3af'}}>{s.bg_style||s.theme||'—'}</td>
                        <td style={{padding:'8px 10px'}}>
                          {editingSiteId===s.id?(
                            <div style={{display:'flex',gap:5}}>
                              <input type="number" value={editSitePrice} onChange={e=>setEditSitePrice(e.target.value)} style={{width:60,padding:'4px 6px',borderRadius:7,border:'0.5px solid rgba(255,255,255,0.12)',background:'white',color:'#111827',fontSize:11,fontFamily:'monospace',outline:'none'}}/>
                              <button onClick={()=>saveSitePrice(s.id)} style={{fontSize:11,color:'#10b981',background:'none',border:'none',cursor:'pointer',fontWeight:700}}>OK</button>
                              <button onClick={()=>setEditingSiteId(null)} style={{fontSize:11,color:'#9ca3af',background:'none',border:'none',cursor:'pointer'}}>X</button>
                            </div>
                          ):(
                            <button onClick={()=>{setEditingSiteId(s.id);setEditSitePrice(String(s.monthly_price||0));}} style={{display:'flex',alignItems:'center',gap:3,color:'rgba(241,245,249,0.6)',background:'none',border:'none',cursor:'pointer',fontSize:12,fontFamily:'monospace'}}>
                              <DollarSign style={{width:11,height:11}}/>{(s.monthly_price||0).toFixed(2)}
                            </button>
                          )}
                        </td>
                        <td style={{padding:'8px 10px',textAlign:'center'}}>
                          <span style={{fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:20,background:s.show_cv?`${A}15`:'rgba(255,255,255,0.05)',color:s.show_cv?A:'#9ca3af'}}>{s.show_cv?'ON':'OFF'}</span>
                        </td>
                        <td style={{padding:'8px 10px',textAlign:'center'}}>
                          <button onClick={()=>toggleSite(s.id,'blocked',s.blocked||false)} style={{background:'none',border:'none',cursor:'pointer',color:s.blocked?'#ef4444':'#10b981'}}>
                            {s.blocked?<Ban style={{width:14,height:14}}/>:<CheckCircle style={{width:14,height:14}}/>}
                          </button>
                        </td>
                        <td style={{padding:'8px 10px',textAlign:'center'}}>
                          <button onClick={()=>toggleSite(s.id,'published',s.published||false)} style={{background:'none',border:'none',cursor:'pointer',color:s.published?A:'#9ca3af'}}>
                            {s.published?<Eye style={{width:14,height:14}}/>:<EyeOff style={{width:14,height:14}}/>}
                          </button>
                        </td>
                        <td style={{padding:'8px 10px'}}>
                          <div style={{display:'flex',gap:6}}>
                            <a href={`/${s.slug}`} target="_blank" rel="noopener noreferrer" style={{color:A,display:'flex'}}><Eye style={{width:13,height:13}}/></a>
                            <button onClick={()=>deleteSite(s.id,s.site_name||s.slug)} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(239,68,68,0.6)'}}><Trash2 style={{width:13,height:13}}/></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ PREMIUM SLUGS ══ */}
          {tab==='slugs'&&(
            <div style={{display:'flex',flexDirection:'column',gap:14}}>
              {/* Stats */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                {[
                  {l:'Total',v:(premiumSlugs||[]).length,c:'rgba(241,245,249,0.6)'},
                  {l:'Ativos',v:(premiumSlugs||[]).filter((s:any)=>s.active&&!s.sold).length,c:'#10b981'},
                  {l:'Vendidos',v:(premiumSlugs||[]).filter((s:any)=>s.sold).length,c:'#ef4444'},
                ].map(s=>(
                  <div key={s.l} style={{textAlign:'center',padding:'14px',borderRadius:14,background:'white',border:'1px solid #e5e7eb)'}}>
                    <p style={{fontSize:22,fontWeight:800,color:s.c,margin:0}}>{s.v}</p>
                    <p style={{fontSize:11,color:'#9ca3af',margin:0}}>{s.l}</p>
                  </div>
                ))}
              </div>

              {/* Preços padrão por tamanho */}
              <GCard>
                <p style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:10}}>Preços padrão · trustbank.xyz/@</p>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {Object.entries(DEFAULT_PRICES).map(([len,price])=>(
                    <div key={len} style={{textAlign:'center',padding:'8px 12px',borderRadius:10,background:'white',border:'1px solid #e5e7eb)'}}>
                      <p style={{fontSize:11,fontWeight:700,color:'rgba(241,245,249,0.6)',margin:0}}>{len}L</p>
                      <p style={{fontSize:13,fontWeight:800,color:'#f59e0b',fontFamily:'monospace',margin:0}}>${price}</p>
                    </div>
                  ))}
                </div>
              </GCard>

              {/* Bulk price controls */}
              <GCard>
                <p style={{fontSize:11,fontWeight:700,color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:12}}>Preço em lote</p>
                <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap',marginBottom:12}}>
                  <label style={{display:'flex',alignItems:'center',gap:6,fontSize:12,color:'#6b7280',cursor:'pointer'}}>
                    <input type="checkbox"
                      checked={selectedSlugIds.size>0&&selectedSlugIds.size===(premiumSlugs||[]).filter((s:any)=>s.active&&!s.sold).length}
                      onChange={()=>{
                        const all=(premiumSlugs||[]).filter((s:any)=>s.active&&!s.sold).map((s:any)=>s.id);
                        setSelectedSlugIds(selectedSlugIds.size>=all.length?new Set():new Set(all));
                      }}/>
                    Selecionar todos ativos
                  </label>
                  {selectedSlugIds.size>0&&<span style={{fontSize:11,color:A}}>{selectedSlugIds.size} selecionados</span>}
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <input type="number" value={bulkPrice} onChange={e=>setBulkPrice(e.target.value)} placeholder="Preço $"
                      style={{width:80,padding:'7px 10px',borderRadius:10,border:'0.5px solid rgba(255,255,255,0.12)',background:'white',color:'#111827',fontSize:12,outline:'none',fontFamily:'monospace'}}/>
                    <Btn onClick={applyBulkPrice}>Aplicar</Btn>
                  </div>
                </div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  <span style={{fontSize:11,color:'#9ca3af',alignSelf:'center'}}>Por tamanho:</span>
                  {[1,2,3,4,5,6].map(len=>(
                    <button key={len} onClick={()=>applyLenPrice(len)}
                      style={{padding:'5px 10px',borderRadius:8,border:'0.5px solid rgba(255,255,255,0.10)',background:'white',color:'rgba(241,245,249,0.6)',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>
                      {len}L → ${DEFAULT_PRICES[len]}
                    </button>
                  ))}
                </div>
              </GCard>

              {/* Filter by length */}
              <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
                <Filter style={{width:13,height:13,color:'#9ca3af'}}/>
                <span style={{fontSize:11,color:'#9ca3af'}}>Tamanho:</span>
                {LENGTH_FILTERS.map(f=>(
                  <button key={f.value} onClick={()=>setLenFilter(f.value)}
                    style={{padding:'4px 10px',borderRadius:8,border:`0.5px solid ${lenFilter===f.value?A+'50':'rgba(255,255,255,0.08)'}`,background:lenFilter===f.value?`${A}12`:'rgba(255,255,255,0.03)',color:lenFilter===f.value?A:'#9ca3af',fontSize:11,cursor:'pointer',fontFamily:'inherit',fontWeight:lenFilter===f.value?700:400}}>
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Bulk import */}
              <GCard>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <p style={{fontSize:12,fontWeight:700,color:'#111827',margin:0,display:'flex',alignItems:'center',gap:6}}>
                    <Upload style={{width:14,height:14,color:A}}/> Importação em massa
                  </p>
                  <button onClick={()=>setBulkMode(!bulkMode)} style={{fontSize:11,color:A,background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>{bulkMode?'Fechar':'Abrir'}</button>
                </div>
                {bulkMode&&(
                  <div>
                    <p style={{fontSize:11,color:'#9ca3af',marginBottom:10}}>
                      Um slug por linha. Formato: <code style={{background:'rgba(255,255,255,0.08)',padding:'1px 6px',borderRadius:4}}>slug:preco</code> ou só <code style={{background:'rgba(255,255,255,0.08)',padding:'1px 6px',borderRadius:4}}>slug</code> (usa preço padrão)
                    </p>
                    <div style={{display:'flex',gap:10}}>
                      <textarea value={bulkText} onChange={e=>setBulkText(e.target.value)}
                        placeholder={"doctor:2000\nlawyer:1500\ncrypto:1800\ndesigner\nphotographer:600"} rows={7}
                        style={{flex:1,padding:'10px 12px',borderRadius:12,border:'0.5px solid rgba(255,255,255,0.12)',background:'white',color:'#111827',fontSize:12,fontFamily:'monospace',outline:'none',resize:'vertical'}}/>
                      <div style={{display:'flex',flexDirection:'column',gap:8}}>
                        <div>
                          <label style={{display:'block',fontSize:10,color:'#9ca3af',marginBottom:4}}>Categoria</label>
                          <select value={bulkCat} onChange={e=>setBulkCat(e.target.value)}
                            style={{padding:'7px 10px',borderRadius:10,border:'0.5px solid rgba(255,255,255,0.12)',background:'rgba(20,20,30,1)',color:'#111827',fontSize:11,fontFamily:'inherit',outline:'none',width:110}}>
                            {SLUG_CATS.map(c=><option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <Btn onClick={handleBulkSlugs} disabled={!bulkText.trim()}>
                          <Plus style={{width:13,height:13}}/> Importar
                        </Btn>
                      </div>
                    </div>
                  </div>
                )}
              </GCard>

              {/* Add single */}
              <GCard>
                <SectionTitle icon={Plus} title="Adicionar slug"/>
                <div style={{display:'flex',gap:10,alignItems:'flex-end',flexWrap:'wrap'}}>
                  <div style={{flex:2,minWidth:130}}>
                    <label style={{display:'block',fontSize:10,color:'#9ca3af',marginBottom:5}}>Slug</label>
                    <input value={newSlug} onChange={e=>{setNewSlug(normalizeSlug(e.target.value));const c=normalizeSlug(e.target.value);if(c.length>0&&c.length<=7)setNewSlugPrice(String(DEFAULT_PRICES[Math.min(c.length,7)]||50));}}
                      placeholder="doctor" style={{width:'100%',padding:'8px 10px',borderRadius:10,border:'0.5px solid rgba(255,255,255,0.12)',background:'white',color:'#111827',fontSize:12,fontFamily:'monospace',outline:'none',boxSizing:'border-box' as const}}/>
                    {newSlug&&<p style={{fontSize:10,color:'rgba(141,92,246,0.7)',marginTop:3,fontFamily:'monospace'}}>trustbank.xyz/@{normalizeSlug(newSlug)}</p>}
                  </div>
                  <div style={{flex:1,minWidth:100}}>
                    <label style={{display:'block',fontSize:10,color:'#9ca3af',marginBottom:5}}>Preço USDC</label>
                    <input type="number" value={newSlugPrice} onChange={e=>setNewSlugPrice(e.target.value)} style={{width:'100%',padding:'8px 10px',borderRadius:10,border:'0.5px solid rgba(255,255,255,0.12)',background:'white',color:'#f59e0b',fontSize:13,fontFamily:'monospace',fontWeight:700,outline:'none',boxSizing:'border-box' as const}}/>
                  </div>
                  <div style={{flex:1,minWidth:110}}>
                    <label style={{display:'block',fontSize:10,color:'#9ca3af',marginBottom:5}}>Categoria</label>
                    <select value={newSlugCat} onChange={e=>setNewSlugCat(e.target.value)} style={{width:'100%',padding:'8px 10px',borderRadius:10,border:'0.5px solid rgba(255,255,255,0.12)',background:'rgba(20,20,30,1)',color:'#111827',fontSize:12,fontFamily:'inherit',outline:'none',boxSizing:'border-box' as const}}>
                      {SLUG_CATS.map(c=><option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <Btn onClick={handleAddSlug} disabled={!newSlug.trim()}>
                    <Plus style={{width:13,height:13}}/> Adicionar
                  </Btn>
                </div>
              </GCard>

              {/* Slug list grouped by category */}
              {loading&&<div style={{textAlign:'center',padding:'40px 0'}}><Loader2 style={{width:28,height:28,color:A,animation:'spin 1s linear infinite',margin:'0 auto'}}/></div>}
              {slugsByCat.map(({cat,items})=>(
                <div key={cat}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                    <Tag style={{width:12,height:12,color:A}}/>
                    <p style={{fontSize:12,fontWeight:700,color:A,textTransform:'uppercase',margin:0}}>{cat}</p>
                    <span style={{fontSize:11,color:'#9ca3af'}}>({items.length})</span>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:8}}>
                    {items.map((s:any)=>(
                      <div key={s.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 12px',borderRadius:12,border:`0.5px solid ${s.sold?'rgba(239,68,68,0.15)':s.active?'rgba(255,255,255,0.09)':'rgba(255,255,255,0.05)'}`,background:s.sold?'rgba(239,68,68,0.04)':'rgba(255,255,255,0.03)',opacity:!s.active?0.5:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,minWidth:0,flex:1}}>
                          {!s.sold&&(
                            <input type="checkbox" checked={selectedSlugIds.has(s.id)} onChange={()=>setSelectedSlugIds(p=>{const n=new Set(p);n.has(s.id)?n.delete(s.id):n.add(s.id);return n;})}
                              style={{flexShrink:0}}/>
                          )}
                          <span style={{fontFamily:'monospace',fontWeight:800,fontSize:14,color:'#111827',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>@{s.slug}</span>
                          {s.sold&&<span style={{fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:20,background:'rgba(239,68,68,0.15)',color:'#ef4444',flexShrink:0}}>VENDIDO</span>}
                          {!s.active&&!s.sold&&<span style={{fontSize:9,padding:'1px 5px',borderRadius:20,background:'white',color:'#9ca3af',flexShrink:0}}>INATIVO</span>}
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                          {/* Transfer inline */}
                          {transferSlugId===s.id?(
                            <div style={{display:'flex',gap:4}}>
                              <input value={transferEmail} onChange={e=>setTransferEmail(e.target.value)} placeholder="email/nome"
                                style={{width:90,padding:'4px 6px',borderRadius:7,border:'0.5px solid rgba(255,255,255,0.12)',background:'white',color:'#111827',fontSize:10,outline:'none',fontFamily:'inherit'}}/>
                              <button onClick={()=>handleTransfer(s.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#10b981'}}><Send style={{width:12,height:12}}/></button>
                              <button onClick={()=>setTransferSlugId(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#9ca3af'}}><X style={{width:11,height:11}}/></button>
                            </div>
                          ):(
                            <button onClick={()=>{setTransferSlugId(s.id);setTransferEmail('');}} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(241,245,249,0.35)'}} title="Transferir"><Send style={{width:12,height:12}}/></button>
                          )}
                          <button onClick={()=>toggleSlugActive(s.id,s.active)} style={{background:'none',border:'none',cursor:'pointer',color:s.active?A:'#9ca3af'}}><Power style={{width:12,height:12}}/></button>
                          {/* Price edit */}
                          {editingSlugId===s.id?(
                            <>
                              <input type="number" value={editSlugPrice} onChange={e=>setEditSlugPrice(e.target.value)}
                                style={{width:60,padding:'4px 6px',borderRadius:7,border:'0.5px solid rgba(255,255,255,0.12)',background:'white',color:'#f59e0b',fontSize:11,fontFamily:'monospace',outline:'none'}}/>
                              <button onClick={async()=>{await supabase.from('premium_slugs').update({price:parseFloat(editSlugPrice)||0}).eq('id',s.id);setEditingSlugId(null);loadSlugs();showToast('Preço atualizado');}} style={{background:'none',border:'none',cursor:'pointer',color:'#10b981',fontSize:11,fontWeight:700}}>OK</button>
                              <button onClick={()=>setEditingSlugId(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#9ca3af',fontSize:11}}>X</button>
                            </>
                          ):(
                            <button onClick={()=>{setEditingSlugId(s.id);setEditSlugPrice(String(s.price));}} style={{display:'flex',alignItems:'center',gap:2,background:'none',border:'none',cursor:'pointer',color:'#f59e0b',fontSize:12,fontFamily:'monospace',fontWeight:700}}>
                              ${Number(s.price).toLocaleString()}
                            </button>
                          )}
                          <button onClick={()=>deleteSlug(s.id,s.slug)} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(239,68,68,0.5)'}}><Trash2 style={{width:12,height:12}}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {filteredSlugs.length===0&&!loading&&<p style={{textAlign:'center',color:'#9ca3af',padding:'40px 0',fontSize:13}}>Nenhum slug premium. Adicione acima.</p>}
            </div>
          )}

          {/* ══ LEILÕES ══ */}
          {tab==='auctions'&&(
            <div>
              {/* Create auction */}
              <GCard style={{marginBottom:16}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <SectionTitle icon={Gavel} title="Criar leilão de slug"/>
                  <button onClick={()=>setAuctionMode(!auctionMode)} style={{fontSize:11,color:A,background:'none',border:'none',cursor:'pointer',fontFamily:'inherit'}}>{auctionMode?'Fechar':'Abrir'}</button>
                </div>
                {auctionMode&&(
                  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10}}>
                    <div>
                      <label style={{display:'block',fontSize:10,color:'#9ca3af',marginBottom:5}}>Slug</label>
                      <input value={auctionSlug} onChange={e=>setAuctionSlug(normalizeSlug(e.target.value))} placeholder="crypto"
                        style={{width:'100%',padding:'8px 10px',borderRadius:10,border:'0.5px solid rgba(255,255,255,0.12)',background:'white',color:'#111827',fontSize:12,fontFamily:'monospace',outline:'none',boxSizing:'border-box' as const}}/>
                    </div>
                    <div>
                      <label style={{display:'block',fontSize:10,color:'#9ca3af',marginBottom:5}}>Lance mín. ($)</label>
                      <input type="number" value={auctionMin} onChange={e=>setAuctionMin(e.target.value)} placeholder="100"
                        style={{width:'100%',padding:'8px 10px',borderRadius:10,border:'0.5px solid rgba(255,255,255,0.12)',background:'white',color:'#111827',fontSize:12,outline:'none',boxSizing:'border-box' as const}}/>
                    </div>
                    <div>
                      <label style={{display:'block',fontSize:10,color:'#9ca3af',marginBottom:5}}>Incremento mín.</label>
                      <input type="number" value={auctionIncrement} onChange={e=>setAuctionIncrement(e.target.value)} placeholder="10"
                        style={{width:'100%',padding:'8px 10px',borderRadius:10,border:'0.5px solid rgba(255,255,255,0.12)',background:'white',color:'#111827',fontSize:12,outline:'none',boxSizing:'border-box' as const}}/>
                    </div>
                    <div>
                      <label style={{display:'block',fontSize:10,color:'#9ca3af',marginBottom:5}}>Duração (dias)</label>
                      <input type="number" value={auctionDays} onChange={e=>setAuctionDays(e.target.value)} placeholder="7"
                        style={{width:'100%',padding:'8px 10px',borderRadius:10,border:'0.5px solid rgba(255,255,255,0.12)',background:'white',color:'#111827',fontSize:12,outline:'none',boxSizing:'border-box' as const}}/>
                    </div>
                    <div style={{display:'flex',alignItems:'flex-end',gap:8}}>
                      <Btn onClick={createAuction} disabled={!auctionSlug.trim()}>
                        <Gavel style={{width:13,height:13}}/> Criar leilão
                      </Btn>
                    </div>
                  </div>
                )}
              </GCard>

              {/* Auction list */}
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {slugAuctions.length===0&&<p style={{textAlign:'center',color:'#9ca3af',padding:'40px 0'}}>Nenhum leilão criado ainda</p>}
                {slugAuctions.map((a:any)=>{
                  const endsAt=new Date(a.ends_at); const expired=endsAt<new Date();
                  return (
                    <GCard key={a.id} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 18px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8,flex:1,minWidth:0}}>
                        <Gavel style={{width:14,height:14,color:A,flexShrink:0}}/>
                        <span style={{fontSize:15,fontWeight:800,color:'#111827',fontFamily:'monospace'}}>@{a.keyword||a.slug}</span>
                        <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:a.status==='active'&&!expired?`${A}15`:'rgba(255,255,255,0.06)',color:a.status==='active'&&!expired?A:'#9ca3af',fontWeight:600}}>{expired?'Expirado':a.status}</span>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:16,fontSize:12,flexShrink:0}}>
                        <div style={{textAlign:'right'}}>
                          <p style={{fontSize:10,color:'#9ca3af',margin:0}}>Lance atual</p>
                          <p style={{fontSize:16,fontWeight:800,color:'#f59e0b',margin:0,fontFamily:'monospace'}}>${(a.current_bid||a.starting_price).toLocaleString()}</p>
                        </div>
                        <div style={{textAlign:'right'}}>
                          <p style={{fontSize:10,color:'#9ca3af',margin:0}}>Encerra</p>
                          <p style={{fontSize:11,color:'rgba(241,245,249,0.6)',margin:0}}>{endsAt.toLocaleDateString('pt-BR')}</p>
                        </div>
                        {a.status==='active'&&<button onClick={()=>closeAuction(a.id)} style={{padding:'6px 12px',borderRadius:10,border:'0.5px solid rgba(239,68,68,0.25)',background:'rgba(239,68,68,0.06)',color:'#ef4444',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>Encerrar</button>}
                      </div>
                    </GCard>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ BADGES ══ */}
          {tab==='badges'&&(
            <div>
              <GCard style={{marginBottom:16}}>
                <SectionTitle icon={BadgeCheck} title="Conceder badge"/>
                <div style={{display:'flex',gap:10,alignItems:'flex-end',flexWrap:'wrap'}}>
                  <div style={{flex:1,minWidth:160}}>
                    <label style={{display:'block',fontSize:11,color:'#9ca3af',marginBottom:6}}>Slug do mini-site</label>
                    <input value={grantSlug} onChange={e=>setGrantSlug(e.target.value)} placeholder="lawyer"
                      style={{width:'100%',padding:'9px 12px',borderRadius:10,border:'0.5px solid rgba(255,255,255,0.12)',background:'white',color:'#111827',fontSize:13,fontFamily:'monospace',outline:'none',boxSizing:'border-box' as const}}/>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    {([['blue','🔵 Blue','#3b82f6'],['gold','🥇 Gold','#f59e0b']] as const).map(([id,l,c])=>(
                      <button key={id} onClick={()=>setGrantType(id as any)}
                        style={{padding:'9px 14px',borderRadius:10,border:`0.5px solid ${grantType===id?c+'50':'rgba(255,255,255,0.09)'}`,background:grantType===id?`${c}12`:'rgba(255,255,255,0.03)',color:grantType===id?c:'#9ca3af',fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>
                        {l}
                      </button>
                    ))}
                  </div>
                  <Btn onClick={grantBadge} disabled={!grantSlug.trim()}>
                    <BadgeCheck style={{width:13,height:13}}/> Conceder
                  </Btn>
                </div>
              </GCard>
              <p style={{fontSize:12,color:'#9ca3af',marginBottom:12}}>{badges.length} badges ativos</p>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {badges.map((b:any)=>(
                  <GCard key={b.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 16px'}}>
                    {b.avatar_url?<img src={b.avatar_url} alt="" style={{width:32,height:32,borderRadius:'50%',objectFit:'cover',flexShrink:0}}/>
                      :<div style={{width:32,height:32,borderRadius:'50%',background:`${A}15`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:A,fontWeight:700,flexShrink:0}}>{(b.site_name||'?').charAt(0)}</div>}
                    <div style={{flex:1}}><p style={{fontSize:13,fontWeight:600,color:'#111827',margin:0}}>{b.site_name}</p><p style={{fontSize:11,fontFamily:'monospace',color:A,margin:0}}>@{b.slug}</p></div>
                    <span style={{fontSize:11,padding:'2px 10px',borderRadius:20,background:b.badge==='blue'?'rgba(59,130,246,0.15)':'rgba(245,158,11,0.15)',color:b.badge==='blue'?'#3b82f6':'#f59e0b',border:`0.5px solid ${b.badge==='blue'?'rgba(59,130,246,0.3)':'rgba(245,158,11,0.3)'}`,fontWeight:600}}>
                      {b.badge==='blue'?'🔵 Blue':'🥇 Gold'}
                    </span>
                    <Btn onClick={()=>revokeBadge(b.id)} danger ghost style={{padding:'5px 10px',fontSize:11}}>Revogar</Btn>
                  </GCard>
                ))}
              </div>
            </div>
          )}

          {/* ══ VÍDEOS ══ */}
          {tab==='videos'&&(
            <div>
              <p style={{fontSize:12,color:'#9ca3af',marginBottom:14}}>{fs(videos,'title').length} vídeos</p>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {fs(videos,'title').map((v:any)=>(
                  <GCard key={v.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px'}}>
                    {v.thumbnail_url?<img src={v.thumbnail_url} alt="" style={{width:60,height:38,borderRadius:8,objectFit:'cover',flexShrink:0}}/>
                      :<div style={{width:60,height:38,borderRadius:8,background:'white',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Video style={{width:18,height:18,color:`${A}40`}}/></div>}
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:13,fontWeight:500,color:'#111827',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.title}</p>
                      <p style={{fontSize:11,color:'rgba(241,245,249,0.35)',margin:0}}>{v.paywall_enabled?`💰 Paywall $${v.paywall_price}`:'🆓 Grátis'} · {new Date(v.created_at).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </GCard>
                ))}
              </div>
            </div>
          )}

          {/* ══ ANÚNCIOS ══ */}
          {tab==='ads'&&(
            <div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:16}}>
                {[{l:'Pendentes',v:ads.filter(a=>a.status==='pending').length,c:'#f59e0b'},{l:'Ativos',v:ads.filter(a=>a.status==='active').length,c:'#10b981'},{l:'Rejeitados',v:ads.filter(a=>a.status==='rejected').length,c:'#ef4444'}].map(s=>(
                  <div key={s.l} style={{textAlign:'center',padding:'12px',borderRadius:12,background:'white',border:'1px solid #e5e7eb)'}}>
                    <p style={{fontSize:18,fontWeight:800,color:s.c,margin:0}}>{s.v}</p>
                    <p style={{fontSize:11,color:'#9ca3af',margin:0}}>{s.l}</p>
                  </div>
                ))}
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:8}}>
                {fs(ads,'title').map((ad:any)=>(
                  <GCard key={ad.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px'}}>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:13,fontWeight:600,color:'#111827',margin:0}}>{ad.title}</p>
                      <p style={{fontSize:11,color:'rgba(241,245,249,0.35)',margin:0}}>{ad.placement} · {(ad.platforms||[]).join(', ')} · <span style={{color:'#10b981',fontWeight:600}}>${ad.amount_usdc} USDC</span></p>
                    </div>
                    <span style={{fontSize:11,padding:'2px 10px',borderRadius:20,background:ad.status==='active'?'rgba(16,185,129,0.12)':ad.status==='rejected'?'rgba(239,68,68,0.12)':'rgba(245,158,11,0.12)',color:ad.status==='active'?'#10b981':ad.status==='rejected'?'#ef4444':'#f59e0b',fontWeight:600,flexShrink:0}}>
                      {ad.status}
                    </span>
                    {ad.status==='pending'&&(
                      <div style={{display:'flex',gap:6,flexShrink:0}}>
                        <button onClick={()=>setAdStatus(ad.id,'active')} style={{padding:'5px 10px',borderRadius:8,border:'0.5px solid rgba(16,185,129,0.3)',background:'rgba(16,185,129,0.07)',color:'#10b981',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>Aprovar</button>
                        <button onClick={()=>setAdStatus(ad.id,'rejected')} style={{padding:'5px 10px',borderRadius:8,border:'0.5px solid rgba(239,68,68,0.25)',background:'rgba(239,68,68,0.05)',color:'#ef4444',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>Rejeitar</button>
                      </div>
                    )}
                  </GCard>
                ))}
                {fs(ads,'title').length===0&&<p style={{textAlign:'center',color:'#9ca3af',padding:'40px 0'}}>Nenhuma campanha</p>}
              </div>
            </div>
          )}

          {/* ══ REVENUE SPLITS ══ */}
          {tab==='revenue'&&(
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:14}}>
              {[
                { title:'NFT Launch', icon:Coins, color:'#f59e0b', fields:[
                  {k:'nft_launch_fee',l:'Taxa de lançamento ($)'},
                  {k:'nft_creator_pct',l:'Creator share (%)'},
                  {k:'nft_platform_pct',l:'Platform share (%)'},
                ]},
                { title:'Paywall de vídeo', icon:Video, color:'#ec4899', fields:[
                  {k:'paywall_creator_pct',l:'Creator share (%)'},
                  {k:'paywall_platform_pct',l:'Platform share (%)'},
                  {k:'paywall_expires_hours',l:'Acesso (horas)'},
                  {k:'paywall_min_embed',l:'Preço mín. embed ($)'},
                ]},
                { title:'View Recharge', icon:RefreshCw, color:'#06b6d4', fields:[
                  {k:'recharge_creator_pct',l:'Creator share (%)'},
                  {k:'recharge_platform_pct',l:'Platform share (%)'},
                ]},
                { title:'Marketplace Resale', icon:ShoppingBag, color:'#10b981', fields:[
                  {k:'marketplace_fee_pct',l:'Fee total (%)'},
                  {k:'marketplace_creator_pct',l:'Royalty creator (%)'},
                  {k:'marketplace_platform_pct',l:'Platform fee (%)'},
                ]},
                { title:'CV Contact Unlock', icon:FileText, color:A, fields:[
                  {k:'cv_unlock_price',l:'Preço unlock ($)'},
                  {k:'cv_creator_pct',l:'Creator share (%)'},
                  {k:'cv_platform_pct',l:'Platform share (%)'},
                ]},
                { title:'Exchange & Ads', icon:Percent, color:'#f59e0b', fields:[
                  {k:'commission_shares',l:'Comissão shares (%)'},
                  {k:'commission_ads',l:'Comissão ads (%)'},
                  {k:'brokerage_fee_pct',l:'Corretagem (%)'},
                ]},
                { title:'Assinaturas mensais', icon:DollarSign, color:'#10b981', fields:[
                  {k:'monthly_price_jobinlink',l:'TrustBank ($)'},
                  {k:'monthly_price_trustbank',l:'TrustBank ($)'},
                  {k:'monthly_price_hashpo',l:'Hashpo ($)'},
                  {k:'monthly_price_mybik',l:'MyBik ($)'},
                ]},
                { title:'Boost & Slugs', icon:TrendingUp, color:'#f59e0b', fields:[
                  {k:'boost_price_per_position',l:'Boost por posição ($)'},
                  {k:'boost_top_price',l:'Boost #1 por 7 dias ($)'},
                  {k:'slug_fee_pct',l:'Taxa venda slug (%)'},
                  {k:'slug_registration_fee',l:'Registro slug ($)'},
                  {k:'slug_renewal_fee',l:'Renovação slug ($)'},
                ]},
              ].map(group=>(
                <GCard key={group.title}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
                    <group.icon style={{width:15,height:15,color:group.color}}/>
                    <p style={{fontSize:12,fontWeight:700,color:group.color,textTransform:'uppercase',letterSpacing:'0.08em',margin:0}}>{group.title}</p>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:12}}>
                    {group.fields.map(f=>(
                      <NumInput key={f.k} label={f.l} value={settings[f.k]||0} onSave={v=>saveSetting(f.k,v)}/>
                    ))}
                  </div>
                </GCard>
              ))}

              {/* Blockchain addresses */}
              <GCard>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
                  <Hexagon style={{width:15,height:15,color:'#8b5cf6'}}/>
                  <p style={{fontSize:12,fontWeight:700,color:'#8b5cf6',textTransform:'uppercase',letterSpacing:'0.08em',margin:0}}>Polygon Blockchain</p>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:12}}>
                  <TxtInput label="Contract Address" value={settings.polygon_contract_address} onSave={v=>saveSetting('polygon_contract_address',v)} placeholder="0x..."/>
                  <TxtInput label="Receiver Wallet" value={settings.polygon_receiver_address} onSave={v=>saveSetting('polygon_receiver_address',v)} placeholder="0x..."/>
                </div>
              </GCard>

              {/* Summary table */}
              <div style={{gridColumn:'1/-1'}}>
                <GCard>
                  <p style={{fontSize:12,fontWeight:700,color:'rgba(241,245,249,0.6)',textTransform:'uppercase',letterSpacing:'0.08em',marginBottom:14}}>Resumo do modelo de receita</p>
                  <div style={{overflowX:'auto'}}>
                    <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                      <thead>
                        <tr style={{borderBottom:'1px solid #e5e7eb'}}>
                          {['Fonte','Fee/Preço','Creator','Plataforma'].map(h=><th key={h} style={{padding:'8px 12px',textAlign:'left',color:'#9ca3af',fontWeight:600}}>{h}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          {l:'NFT Launch',f:`$${settings.nft_launch_fee||300}`,c:`${settings.nft_creator_pct||70}%`,p:`${settings.nft_platform_pct||30}%`},
                          {l:'Paywall vídeo',f:'Variável',c:`${settings.paywall_creator_pct||60}%`,p:`${settings.paywall_platform_pct||40}%`},
                          {l:'CV Unlock',f:`$${settings.cv_unlock_price||20}`,c:`${settings.cv_creator_pct||50}%`,p:`${settings.cv_platform_pct||50}%`},
                          {l:'NFT Resale',f:`${settings.marketplace_fee_pct||5}%`,c:`${settings.marketplace_creator_pct||2}%`,p:`${settings.marketplace_platform_pct||3}%`},
                          {l:'Recharge',f:'Variável',c:`${settings.recharge_creator_pct||50}%`,p:`${settings.recharge_platform_pct||50}%`},
                        ].map(row=>(
                          <tr key={row.l} style={{borderBottom:'0.5px solid rgba(255,255,255,0.05)'}}>
                            <td style={{padding:'8px 12px',color:'#111827',fontWeight:500}}>{row.l}</td>
                            <td style={{padding:'8px 12px',fontFamily:'monospace',color:'rgba(241,245,249,0.6)'}}>{row.f}</td>
                            <td style={{padding:'8px 12px',fontFamily:'monospace',fontWeight:700,color:'#10b981'}}>{row.c}</td>
                            <td style={{padding:'8px 12px',fontFamily:'monospace',fontWeight:700,color:A}}>{row.p}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GCard>
              </div>
            </div>
          )}

          {/* ══ PLATAFORMA / SETTINGS ══ */}
          {tab==='settings'&&(
            <div style={{maxWidth:600}}>
              <GCard style={{marginBottom:14}}>
                <SectionTitle icon={Key} title="Chaves & config"/>
                <TxtInput label="NEXT_PUBLIC_SUPABASE_URL" value={''} onSave={()=>{}} placeholder="https://xxx.supabase.co"/>
                <div style={{height:12}}/>
                <TxtInput label="Polygon receiver wallet" value={settings.polygon_receiver_address} onSave={v=>saveSetting('polygon_receiver_address',v)} placeholder="0x..."/>
              </GCard>
              <GCard>
                <SectionTitle icon={Settings} title="Sessão admin"/>
                {[['Email',user.email||''],['User ID',user.id],['Plataforma','TrustBank — all sites']].map(([l,v])=>(
                  <div key={l} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #e5e7eb',fontSize:12}}>
                    <span style={{color:'#9ca3af'}}>{l}</span>
                    <span style={{color:'#111827',fontFamily:'monospace',fontSize:11,overflow:'hidden',textOverflow:'ellipsis',maxWidth:'60%',textAlign:'right'}}>{v}</span>
                  </div>
                ))}
              </GCard>
            </div>
          )}

        </div>
      </main>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
