'use client';
import { useState, useEffect } from 'react';
import {
  Shield, Activity, Users, Globe, Crown, Gavel, DollarSign,
  Settings, Loader2, Search, Trash2, Check, X, Plus, TrendingUp,
  RefreshCw, Tag, BarChart3, Lock, Power, AlertTriangle, Edit2
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { normalizeSlug, slugPrice } from '@/lib/slug';
import { Navbar } from '@/components/layout/Navbar';

const A = '#818cf8';
const ADMIN_EMAILS = ['arytcfme@gmail.com', 'arytcf@gmail.com'];

// ─── UI helpers ──────────────────────────────────────────────
function Card({ children, style }: any) {
  return <div style={{ background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.08)', borderRadius:16, padding:20, ...style }}>{children}</div>;
}

function Btn({ children, onClick, disabled, danger, ghost, style }: any) {
  const bg = danger ? 'rgba(239,68,68,0.1)' : ghost ? 'transparent' : A;
  const col = danger ? '#ef4444' : ghost ? 'rgba(241,245,249,0.6)' : '#fff';
  const bdr = danger ? '0.5px solid rgba(239,68,68,0.3)' : ghost ? '0.5px solid rgba(255,255,255,0.1)' : 'none';
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:'inline-flex', alignItems:'center', gap:6, padding:'8px 14px',
      borderRadius:10, border:bdr, background:bg, color:col, fontSize:12,
      fontWeight:600, cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.4:1,
      transition:'all 0.15s', fontFamily:'inherit', ...style,
    }}>{children}</button>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <Card style={{ display:'flex', alignItems:'center', gap:14 }}>
      <div style={{ width:40, height:40, borderRadius:10, background:`${color}15`, border:`0.5px solid ${color}25`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <Icon size={18} color={color} />
      </div>
      <div>
        <p style={{ fontSize:22, fontWeight:900, color:'#f1f5f9', margin:0 }}>{value}</p>
        <p style={{ fontSize:11, color:'rgba(241,245,249,0.4)', margin:0 }}>{label}</p>
      </div>
    </Card>
  );
}

const TABS = [
  { id:'analytics', label:'Analytics', icon:Activity },
  { id:'slugs',     label:'Slugs',     icon:Crown },
  { id:'sites',     label:'Mini Sites', icon:Globe },
  { id:'pricing',   label:'Pricing',   icon:DollarSign },
  { id:'settings',  label:'Settings',  icon:Settings },
];

export function AdminClient() {
  const { user } = useAuth();
  const [tab, setTab] = useState('analytics');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{msg:string;ok:boolean}|null>(null);

  // Analytics
  const [stats, setStats] = useState<any>({});

  // Premium slugs
  const [premiumSlugs, setPremiumSlugs] = useState<any[]>([]);
  const [newSlug, setNewSlug] = useState('');
  const [newPrice, setNewPrice] = useState('500');
  const [newCat, setNewCat] = useState('general');
  const [bulkText, setBulkText] = useState('');
  const [bulkMode, setBulkMode] = useState(false);

  // All registered slugs
  const [allSlugs, setAllSlugs] = useState<any[]>([]);
  const [slugSearch, setSlugSearch] = useState('');
  const [allLoaded, setAllLoaded] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string|null>(null);
  const [editPrice, setEditPrice] = useState('');

  // Sites
  const [sites, setSites] = useState<any[]>([]);
  const [siteSearch, setSiteSearch] = useState('');

  // Auction
  const [auctionSlug, setAuctionSlug] = useState('');
  const [auctionMin, setAuctionMin] = useState('100');
  const [auctionDays, setAuctionDays] = useState('7');

  const showToast = (msg: string, ok = true) => { setToast({msg,ok}); setTimeout(() => setToast(null), 3500); };
  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email || '');

  useEffect(() => {
    if (!isAdmin) return;
    loadTab(tab);
  }, [tab, isAdmin]);

  const loadTab = async (t: string) => {
    setLoading(true);
    if (t === 'analytics') await loadAnalytics();
    else if (t === 'slugs') await loadPremiumSlugs();
    else if (t === 'sites') { const { data } = await supabase.from('mini_sites').select('*').order('created_at',{ascending:false}).limit(200); setSites(data||[]); }
    setLoading(false);
  };

  const loadAnalytics = async () => {
    const [{ count: sitesCount }, { count: slugsCount }, { count: postsCount }] = await Promise.all([
      supabase.from('mini_sites').select('*', { count:'exact', head:true }),
      (supabase as any).from('slug_registrations').select('*', { count:'exact', head:true }),
      supabase.from('feed_posts').select('*', { count:'exact', head:true }),
    ]);
    setStats({ sites: sitesCount||0, slugs: slugsCount||0, posts: postsCount||0 });
  };

  const loadPremiumSlugs = async () => {
    const { data } = await (supabase as any).from('premium_slugs').select('*').order('created_at',{ascending:false}).limit(200);
    setPremiumSlugs(data||[]);
  };

  const loadAllSlugs = async (search = '') => {
    setAllLoaded(true);
    setLoading(true);
    let q = (supabase as any).from('slug_registrations').select('*, mini_sites(site_name, slug)').order('created_at',{ascending:false}).limit(300);
    if (search) q = q.ilike('slug', `%${search}%`);
    const { data } = await q;
    setAllSlugs(data||[]);
    setLoading(false);
  };

  const addPremiumSlug = async () => {
    const clean = normalizeSlug(newSlug);
    if (!clean) return;
    const price = parseFloat(newPrice) || slugPrice(clean);
    const { error } = await (supabase as any).from('premium_slugs').insert({ slug:clean, price, category:newCat, active:true });
    if (!error) { showToast(`✅ ${clean}.trustbank.xyz added at $${price}`); setNewSlug(''); loadPremiumSlugs(); }
    else showToast(error.message, false);
  };

  const addBulkPremium = async () => {
    const list = bulkText.split(/[\n,]/).map((s: string) => {
      const [slug, price] = s.trim().split(':');
      return { slug: normalizeSlug(slug||''), price: parseFloat(price||'0') || 0 };
    }).filter(({ slug }) => slug.length > 0);
    if (!list.length) return;
    setLoading(true);
    let ok = 0;
    for (const { slug, price } of list) {
      const p = price || slugPrice(slug);
      const { error } = await (supabase as any).from('premium_slugs').insert({ slug, price:p, category:newCat, active:true });
      if (!error) ok++;
    }
    showToast(`✅ ${ok}/${list.length} slugs added`);
    setBulkText(''); setBulkMode(false);
    loadPremiumSlugs();
    setLoading(false);
  };

  const toggleActive = async (id: string, active: boolean) => {
    await (supabase as any).from('premium_slugs').update({ active: !active }).eq('id', id);
    loadPremiumSlugs();
  };

  const deletePremiumSlug = async (id: string) => {
    if (!confirm('Delete this slug?')) return;
    await (supabase as any).from('premium_slugs').delete().eq('id', id);
    loadPremiumSlugs();
    showToast('Deleted');
  };

  const updateRegisteredSlug = async (id: string, patch: any) => {
    await (supabase as any).from('slug_registrations').update(patch).eq('id', id);
    loadAllSlugs(slugSearch);
    showToast('✅ Updated');
    setEditingSlug(null);
  };

  const deleteRegisteredSlug = async (id: string, slug: string) => {
    if (!confirm(`Delete ${slug}.trustbank.xyz?`)) return;
    await (supabase as any).from('slug_registrations').delete().eq('id', id);
    setAllSlugs(prev => prev.filter(s => s.id !== id));
    showToast('Deleted');
  };

  const registerFreeSlug = async (slug: string, userId?: string) => {
    const clean = normalizeSlug(slug);
    if (!clean) return;
    const uid = userId || user?.id;
    const { data: ex } = await (supabase as any).from('slug_registrations').select('id').eq('slug', clean).maybeSingle();
    if (ex) { showToast(`⚠️ ${clean} already exists`, false); return; }
    await (supabase as any).from('slug_registrations').insert({
      user_id: uid, slug: clean, status: 'active',
      expires_at: new Date(Date.now() + 365*86400000).toISOString(), for_sale: false,
    });
    showToast(`✅ ${clean}.trustbank.xyz registered!`);
    if (allLoaded) loadAllSlugs(slugSearch);
  };

  const createAuction = async () => {
    const clean = normalizeSlug(auctionSlug);
    if (!clean) return;
    const ends = new Date(Date.now() + parseInt(auctionDays)*86400000).toISOString();
    await (supabase as any).from('slug_auctions').insert({ slug:clean, min_bid:parseFloat(auctionMin), min_increment:10, status:'active', ends_at:ends });
    showToast(`✅ Auction created for ${clean}.trustbank.xyz`);
    setAuctionSlug('');
  };

  if (!isAdmin) return (
    <div style={{ minHeight:'100vh', background:'#0d1117', fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth:500, margin:'100px auto', textAlign:'center', padding:24 }}>
        <Lock size={48} color={A} style={{ margin:'0 auto 16px' }} />
        <h2 style={{ fontSize:24, fontWeight:800, color:'#f1f5f9', marginBottom:8 }}>Admin Access Required</h2>
        <p style={{ color:'rgba(241,245,249,0.4)' }}>You must be an admin to access this page.</p>
      </div>
    </div>
  );

  const inp = { width:'100%', padding:'9px 12px', borderRadius:10, border:'0.5px solid rgba(255,255,255,0.12)', background:'white', color:'#111827', fontSize:13, outline:'none', fontFamily:'inherit', boxSizing:'border-box' as const };

  return (
    <div style={{ minHeight:'100vh', background:'#0d1117', color:'#f1f5f9', fontFamily:"'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <Navbar />
      {toast && (
        <div style={{ position:'fixed', top:80, right:20, zIndex:300, padding:'12px 20px', borderRadius:12, background:toast.ok?'rgba(74,222,128,0.1)':'rgba(239,68,68,0.1)', border:`0.5px solid ${toast.ok?'rgba(74,222,128,0.3)':'rgba(239,68,68,0.3)'}`, color:toast.ok?'#4ade80':'#ef4444', fontWeight:700, fontSize:13 }}>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <Shield size={24} color={A} />
          <div>
            <h1 style={{ fontSize:22, fontWeight:900, color:'#f1f5f9', margin:0 }}>Admin Panel</h1>
            <p style={{ fontSize:12, color:'rgba(241,245,249,0.4)', margin:0 }}>TrustBank · {user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:24, background:'rgba(255,255,255,0.03)', borderRadius:12, padding:4, border:'0.5px solid rgba(255,255,255,0.06)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex:1, padding:'9px', borderRadius:8, border:'none', cursor:'pointer',
              background:tab===t.id?A:'transparent',
              color:tab===t.id?'#fff':'rgba(241,245,249,0.5)',
              fontSize:12, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:5,
            }}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>

        {loading && tab !== 'slugs' && <div style={{ textAlign:'center', padding:40 }}><Loader2 size={28} color={A} className="animate-spin" /></div>}

        {/* ANALYTICS */}
        {tab === 'analytics' && !loading && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12, marginBottom:24 }}>
              <StatCard label="Mini Sites" value={stats.sites?.toLocaleString()||'0'} icon={Globe} color={A} />
              <StatCard label="Registered Slugs" value={stats.slugs?.toLocaleString()||'0'} icon={Crown} color="#f59e0b" />
              <StatCard label="Feed Posts" value={stats.posts?.toLocaleString()||'0'} icon={Activity} color="#10b981" />
            </div>
            <Card>
              <p style={{ fontSize:14, fontWeight:700, color:'#f1f5f9', marginBottom:8 }}>Quick Actions</p>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <Btn onClick={() => setTab('slugs')}><Crown size={13} /> Manage Slugs</Btn>
                <Btn onClick={() => setTab('sites')}><Globe size={13} /> View Sites</Btn>
                <Btn ghost onClick={() => loadAnalytics()}><RefreshCw size={13} /> Refresh</Btn>
              </div>
            </Card>
          </div>
        )}

        {/* SLUGS */}
        {tab === 'slugs' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {/* Left: Add premium slug */}
            <div>
              <Card style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <p style={{ fontSize:14, fontWeight:800, color:'#f1f5f9', margin:0 }}>➕ Add Premium Slug</p>
                  <button onClick={() => setBulkMode(m => !m)} style={{ fontSize:11, color:A, background:'none', border:'none', cursor:'pointer', fontWeight:700 }}>
                    {bulkMode ? 'Single' : 'Bulk'}
                  </button>
                </div>
                {!bulkMode ? (
                  <>
                    <label style={{ fontSize:10, fontWeight:700, color:'rgba(241,245,249,0.4)', textTransform:'uppercase' as const, letterSpacing:'0.06em', display:'block', marginBottom:5 }}>Slug</label>
                    <input value={newSlug} onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,''))} placeholder="ceo" style={{ ...inp, marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }} />
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                      <div>
                        <label style={{ fontSize:10, fontWeight:700, color:'rgba(241,245,249,0.4)', textTransform:'uppercase' as const, letterSpacing:'0.06em', display:'block', marginBottom:5 }}>Price (USDC)</label>
                        <input value={newPrice} onChange={e => setNewPrice(e.target.value)} type="number" style={inp} />
                      </div>
                      <div>
                        <label style={{ fontSize:10, fontWeight:700, color:'rgba(241,245,249,0.4)', textTransform:'uppercase' as const, letterSpacing:'0.06em', display:'block', marginBottom:5 }}>Category</label>
                        <select value={newCat} onChange={e => setNewCat(e.target.value)} style={{ ...inp }}>
                          {['general','profession','tech','finance','lifestyle','creative'].map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    {newSlug && <p style={{ fontSize:11, color:A, marginBottom:12 }}>{newSlug}.trustbank.xyz · Auto price: ${slugPrice(newSlug).toLocaleString()}</p>}
                    <Btn onClick={addPremiumSlug} disabled={!newSlug}><Plus size={13} /> Add to Marketplace</Btn>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize:11, color:'rgba(241,245,249,0.4)', marginBottom:8 }}>Format: <code style={{ color:A }}>slug:price</code> or just <code style={{ color:A }}>slug</code> (auto price)</p>
                    <textarea value={bulkText} onChange={e => setBulkText(e.target.value)}
                      style={{ ...inp, resize:'vertical', minHeight:120, fontFamily:"'JetBrains Mono',monospace", marginBottom:10 }}
                      placeholder={"ceo:18000\ndev:2900\nai:4400\nnft:1800\ntech"} />
                    <Btn onClick={addBulkPremium} disabled={!bulkText.trim()}>
                      <Plus size={13} /> Add {bulkText.split('\n').filter(l => l.trim()).length} Slugs
                    </Btn>
                  </>
                )}
              </Card>

              {/* Register free slug */}
              <Card style={{ marginBottom:12 }}>
                <p style={{ fontSize:13, fontWeight:800, color:'#f1f5f9', marginBottom:12 }}>🔑 Register Free (Admin)</p>
                <div style={{ display:'flex', gap:8 }}>
                  <input value={newSlug} onChange={e => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,''))}
                    placeholder="slug" style={{ ...inp, flex:1, fontFamily:"'JetBrains Mono',monospace" }} />
                  <Btn onClick={() => registerFreeSlug(newSlug)}><Check size={13} /> Register</Btn>
                </div>
              </Card>

              {/* Create auction */}
              <Card>
                <p style={{ fontSize:13, fontWeight:800, color:'#f1f5f9', marginBottom:12 }}>⚡ Create Auction</p>
                <label style={{ fontSize:10, fontWeight:700, color:'rgba(241,245,249,0.4)', textTransform:'uppercase' as const, letterSpacing:'0.06em', display:'block', marginBottom:5 }}>Slug</label>
                <input value={auctionSlug} onChange={e => setAuctionSlug(normalizeSlug(e.target.value))} placeholder="slug" style={{ ...inp, marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }} />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
                  <div>
                    <label style={{ fontSize:10, fontWeight:700, color:'rgba(241,245,249,0.4)', textTransform:'uppercase' as const, letterSpacing:'0.06em', display:'block', marginBottom:5 }}>Min Bid</label>
                    <input value={auctionMin} onChange={e => setAuctionMin(e.target.value)} type="number" style={inp} />
                  </div>
                  <div>
                    <label style={{ fontSize:10, fontWeight:700, color:'rgba(241,245,249,0.4)', textTransform:'uppercase' as const, letterSpacing:'0.06em', display:'block', marginBottom:5 }}>Days</label>
                    <input value={auctionDays} onChange={e => setAuctionDays(e.target.value)} type="number" style={inp} />
                  </div>
                </div>
                <Btn onClick={createAuction} disabled={!auctionSlug}><Gavel size={13} /> Create Auction</Btn>
              </Card>
            </div>

            {/* Right: Manage slugs */}
            <div>
              {/* Premium slugs list */}
              <Card style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <p style={{ fontSize:13, fontWeight:800, color:'#f1f5f9', margin:0 }}>Premium Slugs ({premiumSlugs.length})</p>
                  <button onClick={loadPremiumSlugs} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(241,245,249,0.4)' }}><RefreshCw size={14} /></button>
                </div>
                <div style={{ maxHeight:200, overflowY:'auto', display:'flex', flexDirection:'column', gap:6 }}>
                  {premiumSlugs.map(s => (
                    <div key={s.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:700, color:'#f1f5f9', flex:1 }}>{s.slug}</span>
                      {editingSlug === s.id ? (
                        <>
                          <input value={editPrice} onChange={e => setEditPrice(e.target.value)} type="number"
                            style={{ width:80, padding:'4px 8px', borderRadius:6, border:'0.5px solid rgba(255,255,255,0.2)', background:'white', color:'#111827', fontSize:12, outline:'none' }} />
                          <button onClick={async () => { await (supabase as any).from('premium_slugs').update({price:parseFloat(editPrice)}).eq('id',s.id); setEditingSlug(null); loadPremiumSlugs(); }} style={{ background:'none', border:'none', cursor:'pointer', color:'#4ade80' }}><Check size={13} /></button>
                          <button onClick={() => setEditingSlug(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(241,245,249,0.4)' }}><X size={13} /></button>
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize:12, color:'#4ade80', fontWeight:700 }}>${(s.price||0).toLocaleString()}</span>
                          <button onClick={() => { setEditingSlug(s.id); setEditPrice(String(s.price)); }} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(241,245,249,0.4)' }}><Edit2 size={12} /></button>
                        </>
                      )}
                      <button onClick={() => toggleActive(s.id, s.active)} style={{ padding:'3px 8px', borderRadius:5, border:'none', background:s.active?'rgba(74,222,128,0.1)':'rgba(239,68,68,0.1)', color:s.active?'#4ade80':'#ef4444', cursor:'pointer', fontSize:10, fontWeight:700 }}>
                        {s.active?'Live':'Off'}
                      </button>
                      <button onClick={() => deletePremiumSlug(s.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.5)' }}><Trash2 size={13} /></button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* All registered slugs */}
              <Card>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <p style={{ fontSize:13, fontWeight:800, color:'#f1f5f9', margin:0 }}>🔍 All Registered Slugs</p>
                  <Btn ghost onClick={() => loadAllSlugs(slugSearch)} style={{ padding:'4px 10px', fontSize:11 }}>Load</Btn>
                </div>
                <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                  <input value={slugSearch} onChange={e => setSlugSearch(e.target.value)} onKeyDown={e => e.key==='Enter'&&loadAllSlugs(slugSearch)}
                    placeholder="Search slug..." style={{ ...inp, flex:1 }} />
                  <Btn onClick={() => loadAllSlugs(slugSearch)}><Search size={13} /></Btn>
                </div>
                {!allLoaded && <p style={{ fontSize:12, color:'rgba(241,245,249,0.3)', textAlign:'center', padding:'16px 0' }}>Click Load to see all registered slugs</p>}
                <div style={{ maxHeight:250, overflowY:'auto', display:'flex', flexDirection:'column', gap:4 }}>
                  {allSlugs.map(s => (
                    <div key={s.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:8, background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.06)' }}>
                      <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:'#f1f5f9', flex:1 }}>{s.slug}</span>
                      <span style={{ fontSize:10, color: s.for_sale?'#f59e0b':'rgba(241,245,249,0.3)' }}>
                        {s.for_sale ? `💰 $${s.sale_price?.toLocaleString()}` : s.status}
                      </span>
                      <button onClick={async () => {
                        const price = prompt(`Sale price for ${s.slug} (USDC):`, s.sale_price||'100');
                        if (!price) return;
                        await updateRegisteredSlug(s.id, { for_sale:true, sale_price:parseFloat(price), status:'for_sale' });
                      }} style={{ background:'none', border:'none', cursor:'pointer', color:A, fontSize:10, fontWeight:700 }}>
                        {s.for_sale?'Edit':'Sell'}
                      </button>
                      {s.for_sale && <button onClick={() => updateRegisteredSlug(s.id, { for_sale:false, sale_price:null, status:'active' })} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(241,245,249,0.5)', fontSize:10 }}>✕</button>}
                      <button onClick={() => deleteRegisteredSlug(s.id, s.slug)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.5)' }}><Trash2 size={11} /></button>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* SITES */}
        {tab === 'sites' && !loading && (
          <div>
            <div style={{ display:'flex', gap:8, marginBottom:16 }}>
              <input value={siteSearch} onChange={e => setSiteSearch(e.target.value)} placeholder="Search sites..." style={{ ...inp, flex:1, maxWidth:300 }} />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:10 }}>
              {sites.filter(s => !siteSearch || s.site_name?.toLowerCase().includes(siteSearch.toLowerCase()) || s.slug?.includes(siteSearch)).map(s => (
                <Card key={s.id} style={{ padding:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                    {s.avatar_url ? <img src={s.avatar_url} style={{ width:36, height:36, borderRadius:'50%', objectFit:'cover' }} /> : <div style={{ width:36, height:36, borderRadius:'50%', background:`${A}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, fontWeight:900, color:A }}>{(s.site_name||'?')[0]}</div>}
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.site_name||s.slug}</p>
                      <p style={{ fontSize:11, color:'rgba(241,245,249,0.4)', margin:0, fontFamily:'monospace' }}>{s.slug}.trustbank.xyz</p>
                    </div>
                    <span style={{ fontSize:9, padding:'2px 7px', borderRadius:100, background:s.published?'rgba(74,222,128,0.1)':'rgba(255,255,255,0.05)', color:s.published?'#4ade80':'rgba(241,245,249,0.3)', fontWeight:700 }}>
                      {s.published?'Live':'Draft'}
                    </span>
                  </div>
                  <Link href={`/s/${s.slug}`} target="_blank" style={{ fontSize:11, color:A, textDecoration:'none' }}>View site →</Link>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* PRICING */}
        {tab === 'pricing' && (
          <Card>
            <p style={{ fontSize:16, fontWeight:800, color:'#f1f5f9', marginBottom:20 }}>Slug Pricing</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:12 }}>
              {[
                { chars:'1 char', price:'$5,000', tier:'Ultra Rare' },
                { chars:'2 chars', price:'$3,500', tier:'Legendary' },
                { chars:'3 chars', price:'$3,000', tier:'Premium' },
                { chars:'4 chars', price:'$1,500', tier:'Premium' },
                { chars:'5 chars', price:'$500', tier:'Popular' },
                { chars:'6 chars', price:'$150', tier:'Standard' },
                { chars:'7+ chars', price:'$12/yr', tier:'Free tier' },
              ].map(t => (
                <div key={t.chars} style={{ padding:16, borderRadius:12, background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.08)', textAlign:'center' }}>
                  <p style={{ fontSize:16, fontWeight:900, color:'#f1f5f9', margin:'0 0 4px' }}>{t.chars}</p>
                  <p style={{ fontSize:20, fontWeight:900, color:'#4ade80', margin:'0 0 4px' }}>{t.price}</p>
                  <p style={{ fontSize:10, color:'rgba(241,245,249,0.4)', margin:0 }}>{t.tier}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* SETTINGS */}
        {tab === 'settings' && (
          <Card>
            <p style={{ fontSize:16, fontWeight:800, color:'#f1f5f9', marginBottom:16 }}>Platform Settings</p>
            <p style={{ fontSize:13, color:'rgba(241,245,249,0.5)' }}>Platform wallet, fee settings and more coming soon.</p>
            <div style={{ marginTop:16, padding:14, borderRadius:10, background:'rgba(129,140,248,0.06)', border:'0.5px solid rgba(129,140,248,0.2)' }}>
              <p style={{ fontSize:12, color:A, margin:0, fontWeight:700 }}>Admin: {user?.email}</p>
              <p style={{ fontSize:11, color:'rgba(241,245,249,0.4)', margin:'4px 0 0' }}>TrustBank v2 · trustbank.xyz</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
