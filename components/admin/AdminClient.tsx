'use client';
import { useState, useEffect } from 'react';
import {
  Shield, Activity, Globe, Crown, Gavel, DollarSign,
  Settings, Loader2, Search, Trash2, Check, X, Plus,
  RefreshCw, Edit2, Eye, EyeOff, Tag, Package,
  ToggleLeft, ToggleRight, ChevronDown, ChevronUp, Hash
} from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { normalizeSlug, slugPrice, slugTier } from '@/lib/slug';
import { Navbar } from '@/components/layout/Navbar';

const A = '#818cf8';
const ADMIN_EMAILS = ['arytcfme@gmail.com', 'arytcf@gmail.com'];

// ─── Helpers ──────────────────────────────────────────────────
const inp: any = {
  padding:'8px 12px', borderRadius:8, border:'0.5px solid rgba(255,255,255,0.12)',
  background:'white', color:'#111827', fontSize:13, outline:'none',
  fontFamily:'inherit', boxSizing:'border-box',
};
const Card = ({ children, style }: any) => (
  <div style={{ background:'rgba(255,255,255,0.03)', border:'0.5px solid rgba(255,255,255,0.09)', borderRadius:16, padding:20, ...style }}>
    {children}
  </div>
);
const Btn = ({ children, onClick, disabled, danger, ghost, green, sm, style }: any) => {
  const bg = danger?'rgba(239,68,68,0.1)':green?'rgba(74,222,128,0.1)':ghost?'transparent':A;
  const col = danger?'#ef4444':green?'#4ade80':ghost?'rgba(241,245,249,0.6)':'#fff';
  const bdr = danger?'0.5px solid rgba(239,68,68,0.3)':green?'0.5px solid rgba(74,222,128,0.3)':ghost?'0.5px solid rgba(255,255,255,0.1)':'none';
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:sm?'5px 10px':'8px 14px', borderRadius:8, border:bdr,
      background:bg, color:col, fontSize:sm?11:12, fontWeight:600,
      cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.4:1,
      transition:'all 0.15s', fontFamily:'inherit', flexShrink:0, ...style,
    }}>{children}</button>
  );
};
const Label = ({ children }: any) => (
  <p style={{ fontSize:10, fontWeight:700, color:'rgba(241,245,249,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:6, marginTop:0 }}>{children}</p>
);
const Stat = ({ label, value, color }: any) => (
  <Card style={{ textAlign:'center', padding:16 }}>
    <p style={{ fontSize:28, fontWeight:900, color, margin:0 }}>{value ?? '…'}</p>
    <p style={{ fontSize:11, color:'rgba(241,245,249,0.4)', margin:'4px 0 0' }}>{label}</p>
  </Card>
);

const TABS = [
  { id:'analytics', label:'📊 Analytics' },
  { id:'marketplace', label:'🏪 Marketplace' },
  { id:'bulk', label:'📋 Bulk Register' },
  { id:'registered', label:'🔍 Registrados' },
  { id:'auctions', label:'⚡ Leilões' },
  { id:'sites', label:'🌐 Sites' },
  { id:'settings', label:'⚙️ Config' },
];

export function AdminClient() {
  const { user } = useAuth();
  const isAdmin = !!user && ADMIN_EMAILS.includes(user.email || '');

  const [tab, setTab] = useState('analytics');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{msg:string;ok:boolean}|null>(null);
  const showToast = (msg:string, ok=true) => { setToast({msg,ok}); setTimeout(()=>setToast(null),4000); };

  // ── Analytics ──────────────────────────────────────────────
  const [stats, setStats] = useState<any>({});

  // ── Marketplace (premium_slugs) ─────────────────────────────
  const [market, setMarket] = useState<any[]>([]);
  const [mSearch, setMSearch] = useState('');
  const [editingId, setEditingId] = useState<string|null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editCat, setEditCat] = useState('general');

  // Add single slug
  const [newSlug, setNewSlug] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newCat, setNewCat] = useState('general');

  // ── Bulk register ───────────────────────────────────────────
  const [bulkText, setBulkText] = useState('');
  const [bulkTarget, setBulkTarget] = useState<'marketplace'|'vault'>('marketplace');
  const [bulkCat, setBulkCat] = useState('general');
  const [bulkResults, setBulkResults] = useState<string[]>([]);
  const [bulkRunning, setBulkRunning] = useState(false);

  // ── All registered slugs ────────────────────────────────────
  const [allSlugs, setAllSlugs] = useState<any[]>([]);
  const [slugSearch, setSlugSearch] = useState('');
  const [slugLoaded, setSlugLoaded] = useState(false);

  // ── Auctions ────────────────────────────────────────────────
  const [auctions, setAuctions] = useState<any[]>([]);
  const [aSlug, setASlug] = useState('');
  const [aMin, setAMin] = useState('100');
  const [aDays, setADays] = useState('7');
  const [aInc, setAInc] = useState('10');

  // ── Sites ───────────────────────────────────────────────────
  const [sites, setSites] = useState<any[]>([]);
  const [siteSearch, setSiteSearch] = useState('');

  // ── Load on tab change ──────────────────────────────────────
  useEffect(() => {
    if (!isAdmin) return;
    if (tab === 'analytics') loadAnalytics();
    else if (tab === 'marketplace') loadMarket();
    else if (tab === 'auctions') loadAuctions();
    else if (tab === 'sites') loadSites();
  }, [tab, isAdmin]);

  const loadAnalytics = async () => {
    setLoading(true);
    const [a,b,c,d] = await Promise.all([
      supabase.from('mini_sites').select('*',{count:'exact',head:true}),
      (supabase as any).from('slug_registrations').select('*',{count:'exact',head:true}),
      (supabase as any).from('premium_slugs').select('*',{count:'exact',head:true}).eq('active',true),
      supabase.from('feed_posts').select('*',{count:'exact',head:true}),
    ]);
    setStats({ sites:a.count||0, regs:b.count||0, market:c.count||0, posts:d.count||0 });
    setLoading(false);
  };

  const loadMarket = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from('premium_slugs').select('*').order('created_at',{ascending:false}).limit(500);
    setMarket(data||[]);
    setLoading(false);
  };

  const loadAuctions = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from('slug_auctions').select('*').order('created_at',{ascending:false}).limit(100);
    setAuctions(data||[]);
    setLoading(false);
  };

  const loadSites = async () => {
    setLoading(true);
    const { data } = await supabase.from('mini_sites').select('*').order('created_at',{ascending:false}).limit(300);
    setSites(data||[]);
    setLoading(false);
  };

  const loadAllSlugs = async (q = '') => {
    setLoading(true); setSlugLoaded(true);
    let query = (supabase as any).from('slug_registrations').select('*, mini_sites(site_name)').order('created_at',{ascending:false}).limit(400);
    if (q) query = query.ilike('slug',`%${q}%`);
    const { data } = await query;
    setAllSlugs(data||[]);
    setLoading(false);
  };

  // ── Marketplace CRUD ────────────────────────────────────────
  const addToMarket = async () => {
    const clean = normalizeSlug(newSlug);
    if (!clean) return;
    const price = parseFloat(newPrice) || slugPrice(clean);
    const { error } = await (supabase as any).from('premium_slugs').upsert({ slug:clean, price, category:newCat, active:true }, { onConflict:'slug' });
    if (!error) { showToast(`✅ ${clean} adicionado ao marketplace`); setNewSlug(''); setNewPrice(''); loadMarket(); }
    else showToast(error.message, false);
  };

  const updateMarketSlug = async (id:string, patch:any) => {
    await (supabase as any).from('premium_slugs').update(patch).eq('id',id);
    setMarket(prev => prev.map(s => s.id===id ? {...s,...patch} : s));
    setEditingId(null);
    showToast('✅ Atualizado');
  };

  const deleteFromMarket = async (id:string, slug:string) => {
    if (!confirm(`Remover ${slug} do marketplace?`)) return;
    await (supabase as any).from('premium_slugs').delete().eq('id',id);
    setMarket(prev => prev.filter(s => s.id!==id));
    showToast('Removido');
  };

  // ── Bulk register ───────────────────────────────────────────
  const runBulk = async () => {
    const list = bulkText.split(/[\n,]/).map((s:string) => {
      const [slug, price] = s.trim().split(':');
      const clean = normalizeSlug(slug||'');
      return { slug:clean, price:parseFloat(price||'0')||0 };
    }).filter(x => x.slug.length > 0);

    if (!list.length) return;
    setBulkRunning(true);
    const results: string[] = [];

    for (const { slug, price } of list) {
      const p = price || slugPrice(slug);
      try {
        if (bulkTarget === 'marketplace') {
          const { error } = await (supabase as any).from('premium_slugs')
            .upsert({ slug, price:p, category:bulkCat, active:true }, { onConflict:'slug' });
          results.push(error ? `❌ ${slug} — ${error.message}` : `✅ ${slug} → marketplace $${p}`);
        } else {
          // vault (slug_registrations for admin user)
          const { data:ex } = await (supabase as any).from('slug_registrations').select('id').eq('slug',slug).maybeSingle();
          if (ex) { results.push(`⚠️ ${slug} — já existe`); continue; }
          const { error } = await (supabase as any).from('slug_registrations').insert({
            user_id: user!.id, slug, status:'active',
            expires_at: new Date(Date.now()+365*86400000).toISOString(), for_sale:false,
          });
          results.push(error ? `❌ ${slug} — ${error.message}` : `✅ ${slug} → vault`);
        }
      } catch(e:any) { results.push(`❌ ${slug} — ${e.message}`); }
    }

    setBulkResults(results);
    setBulkRunning(false);
    const ok = results.filter(r=>r.startsWith('✅')).length;
    showToast(`${ok}/${list.length} slugs processados`);
    if (tab === 'marketplace') loadMarket();
  };

  // ── Registered slugs CRUD ───────────────────────────────────
  const updateReg = async (id:string, patch:any) => {
    await (supabase as any).from('slug_registrations').update(patch).eq('id',id);
    setAllSlugs(prev => prev.map(s => s.id===id ? {...s,...patch} : s));
    showToast('✅ Atualizado');
  };

  const deleteReg = async (id:string, slug:string) => {
    if (!confirm(`Deletar ${slug}.trustbank.xyz?`)) return;
    await (supabase as any).from('slug_registrations').delete().eq('id',id);
    setAllSlugs(prev => prev.filter(s => s.id!==id));
    showToast('Deletado');
  };

  const registerFree = async (slug:string) => {
    const clean = normalizeSlug(slug);
    if (!clean) return;
    const { data:ex } = await (supabase as any).from('slug_registrations').select('id').eq('slug',clean).maybeSingle();
    if (ex) { showToast(`⚠️ ${clean} já existe`,false); return; }
    await (supabase as any).from('slug_registrations').insert({
      user_id:user!.id, slug:clean, status:'active',
      expires_at:new Date(Date.now()+365*86400000).toISOString(), for_sale:false,
    });
    showToast(`✅ ${clean}.trustbank.xyz registrado`);
    if (slugLoaded) loadAllSlugs(slugSearch);
  };

  // ── Auctions ────────────────────────────────────────────────
  const createAuction = async () => {
    const clean = normalizeSlug(aSlug);
    if (!clean) return;
    const ends = new Date(Date.now()+parseInt(aDays)*86400000).toISOString();
    const { error } = await (supabase as any).from('slug_auctions').insert({
      slug:clean, min_bid:parseFloat(aMin), min_increment:parseFloat(aInc),
      status:'active', ends_at:ends,
    });
    if (!error) { showToast(`✅ Leilão criado para ${clean}`); setASlug(''); loadAuctions(); }
    else showToast(error.message,false);
  };

  // ── Guard ────────────────────────────────────────────────────
  if (!isAdmin) return (
    <div style={{ minHeight:'100vh', background:'#0d1117', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <Navbar/>
      <div style={{ maxWidth:480, margin:'120px auto', textAlign:'center', padding:24 }}>
        <Shield size={48} color={A} style={{ margin:'0 auto 16px' }}/>
        <h2 style={{ fontSize:24, fontWeight:800, color:'#f1f5f9', marginBottom:8 }}>Acesso restrito</h2>
        <p style={{ color:'rgba(241,245,249,0.4)' }}>Somente admins podem acessar esta página.</p>
      </div>
    </div>
  );

  const mFiltered = market.filter(s => !mSearch || s.slug?.includes(mSearch));

  return (
    <div style={{ minHeight:'100vh', background:'#0d1117', color:'#f1f5f9', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <Navbar/>

      {/* Toast */}
      {toast && (
        <div style={{ position:'fixed', top:80, right:20, zIndex:500, padding:'12px 20px', borderRadius:12,
          background:toast.ok?'rgba(74,222,128,0.12)':'rgba(239,68,68,0.12)',
          border:`0.5px solid ${toast.ok?'rgba(74,222,128,0.4)':'rgba(239,68,68,0.4)'}`,
          color:toast.ok?'#4ade80':'#ef4444', fontWeight:700, fontSize:13, maxWidth:400 }}>
          {toast.msg}
        </div>
      )}

      <div style={{ maxWidth:1200, margin:'0 auto', padding:'24px 20px' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:24 }}>
          <Shield size={22} color={A}/>
          <div>
            <h1 style={{ fontSize:20, fontWeight:900, color:'#f1f5f9', margin:0 }}>Admin Panel</h1>
            <p style={{ fontSize:11, color:'rgba(241,245,249,0.4)', margin:0 }}>{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:4, marginBottom:24, flexWrap:'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:'8px 14px', borderRadius:8, border:'none', cursor:'pointer',
              background:tab===t.id?A:'rgba(255,255,255,0.05)',
              color:tab===t.id?'#fff':'rgba(241,245,249,0.5)',
              fontSize:12, fontWeight:700, transition:'all 0.15s',
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── ANALYTICS ── */}
        {tab==='analytics' && (
          <div>
            {loading ? <div style={{textAlign:'center',padding:40}}><Loader2 size={28} color={A} className="animate-spin"/></div> : (
              <div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:12, marginBottom:20 }}>
                  <Stat label="Mini Sites" value={stats.sites} color={A}/>
                  <Stat label="Slugs Registrados" value={stats.regs} color="#f59e0b"/>
                  <Stat label="No Marketplace" value={stats.market} color="#10b981"/>
                  <Stat label="Feed Posts" value={stats.posts} color="#f43f5e"/>
                </div>
                <Card>
                  <p style={{ fontSize:13, fontWeight:700, color:'#f1f5f9', marginBottom:12 }}>Ações rápidas</p>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                    <Btn onClick={()=>setTab('bulk')}><Package size={13}/> Bulk Register</Btn>
                    <Btn onClick={()=>setTab('marketplace')}><Crown size={13}/> Gerenciar Marketplace</Btn>
                    <Btn onClick={()=>setTab('registered')}><Search size={13}/> Ver Slugs</Btn>
                    <Btn ghost onClick={loadAnalytics}><RefreshCw size={13}/> Refresh</Btn>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ── MARKETPLACE ── */}
        {tab==='marketplace' && (
          <div style={{ display:'grid', gridTemplateColumns:'340px 1fr', gap:16, alignItems:'start' }}>
            {/* Left: Add slug */}
            <div>
              <Card style={{ marginBottom:12 }}>
                <p style={{ fontSize:13, fontWeight:800, color:'#f1f5f9', marginBottom:14 }}>➕ Adicionar ao Marketplace</p>
                <Label>Slug</Label>
                <input value={newSlug} onChange={e=>setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,''))}
                  placeholder="ceo" style={{ ...inp, width:'100%', marginBottom:8, fontFamily:"'JetBrains Mono',monospace" }}/>
                {newSlug && <p style={{ fontSize:11, color:A, marginBottom:8 }}>
                  Auto-preço: ${slugPrice(normalizeSlug(newSlug)).toLocaleString()} · {slugTier(normalizeSlug(newSlug))}
                </p>}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                  <div>
                    <Label>Preço (USDC)</Label>
                    <input value={newPrice} onChange={e=>setNewPrice(e.target.value)} type="number"
                      placeholder={newSlug?String(slugPrice(normalizeSlug(newSlug))):'500'}
                      style={{ ...inp, width:'100%' }}/>
                  </div>
                  <div>
                    <Label>Categoria</Label>
                    <select value={newCat} onChange={e=>setNewCat(e.target.value)} style={{ ...inp, width:'100%' }}>
                      {['general','profession','tech','finance','lifestyle','creative','media'].map(c=>(
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Btn onClick={addToMarket} disabled={!newSlug} style={{ width:'100%', justifyContent:'center' }}>
                  <Plus size={13}/> Adicionar
                </Btn>
              </Card>

              <Card>
                <p style={{ fontSize:13, fontWeight:800, color:'#f1f5f9', marginBottom:10 }}>🔑 Registrar Grátis (Vault)</p>
                <div style={{ display:'flex', gap:8 }}>
                  <input value={newSlug} onChange={e=>setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,''))}
                    placeholder="slug" style={{ ...inp, flex:1, fontFamily:"'JetBrains Mono',monospace" }}/>
                  <Btn onClick={()=>registerFree(newSlug)} disabled={!newSlug}><Check size={13}/> OK</Btn>
                </div>
              </Card>
            </div>

            {/* Right: Manage marketplace */}
            <Card>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
                <p style={{ fontSize:13, fontWeight:800, color:'#f1f5f9', margin:0 }}>
                  Marketplace ({mFiltered.length}) <span style={{ fontSize:11, color:'rgba(241,245,249,0.3)' }}>total: {market.length}</span>
                </p>
                <div style={{ display:'flex', gap:8 }}>
                  <input value={mSearch} onChange={e=>setMSearch(e.target.value)} placeholder="buscar slug…"
                    style={{ ...inp, width:140 }}/>
                  <Btn ghost onClick={loadMarket} sm><RefreshCw size={12}/></Btn>
                </div>
              </div>

              {loading && <div style={{textAlign:'center',padding:20}}><Loader2 size={20} color={A} className="animate-spin"/></div>}

              <div style={{ maxHeight:580, overflowY:'auto', display:'flex', flexDirection:'column', gap:4 }}>
                {mFiltered.map(s => (
                  <div key={s.id} style={{
                    display:'flex', alignItems:'center', gap:8, padding:'9px 12px',
                    borderRadius:10, background:'rgba(255,255,255,0.03)',
                    border:`0.5px solid ${s.active?'rgba(255,255,255,0.07)':'rgba(239,68,68,0.2)'}`,
                  }}>
                    {/* Slug */}
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:700, color:'#f1f5f9', flex:1, minWidth:80 }}>
                      {s.slug}
                    </span>
                    <span style={{ fontSize:10, color:'rgba(241,245,249,0.35)', minWidth:60 }}>
                      {s.category||'general'}
                    </span>

                    {/* Price edit */}
                    {editingId===s.id ? (
                      <>
                        <input value={editPrice} onChange={e=>setEditPrice(e.target.value)} type="number"
                          style={{ ...inp, width:80, padding:'4px 8px' }}/>
                        <select value={editCat} onChange={e=>setEditCat(e.target.value)} style={{ ...inp, width:100, padding:'4px 8px' }}>
                          {['general','profession','tech','finance','lifestyle','creative','media'].map(c=>(
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                        <button onClick={()=>updateMarketSlug(s.id,{price:parseFloat(editPrice),category:editCat})}
                          style={{ background:'none', border:'none', cursor:'pointer', color:'#4ade80' }}><Check size={14}/></button>
                        <button onClick={()=>setEditingId(null)}
                          style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(241,245,249,0.4)' }}><X size={14}/></button>
                      </>
                    ) : (
                      <>
                        <span style={{ fontSize:13, color:'#4ade80', fontWeight:700, minWidth:70, textAlign:'right' }}>
                          ${(s.price||0).toLocaleString()}
                        </span>
                        <button onClick={()=>{ setEditingId(s.id); setEditPrice(String(s.price)); setEditCat(s.category||'general'); }}
                          style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(241,245,249,0.4)' }}><Edit2 size={12}/></button>
                      </>
                    )}

                    {/* Active toggle */}
                    <button onClick={()=>updateMarketSlug(s.id,{active:!s.active})} style={{
                      padding:'3px 8px', borderRadius:5, border:'none', cursor:'pointer', fontSize:10, fontWeight:700,
                      background:s.active?'rgba(74,222,128,0.1)':'rgba(239,68,68,0.1)',
                      color:s.active?'#4ade80':'#ef4444',
                    }}>
                      {s.active?'Live':'Off'}
                    </button>

                    {/* Delete */}
                    <button onClick={()=>deleteFromMarket(s.id,s.slug)}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.5)' }}>
                      <Trash2 size={13}/>
                    </button>
                  </div>
                ))}
                {mFiltered.length===0 && !loading && (
                  <p style={{ textAlign:'center', padding:'30px 0', color:'rgba(241,245,249,0.3)', fontSize:13 }}>
                    {market.length===0 ? 'Marketplace vazio. Adicione slugs ao lado.' : 'Nenhum resultado para "'+mSearch+'"'}
                  </p>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* ── BULK REGISTER ── */}
        {tab==='bulk' && (
          <div style={{ maxWidth:720 }}>
            <Card>
              <p style={{ fontSize:15, fontWeight:800, color:'#f1f5f9', marginBottom:6 }}>📋 Registro em Massa</p>
              <p style={{ fontSize:12, color:'rgba(241,245,249,0.4)', marginBottom:20 }}>
                Um slug por linha. Formato: <code style={{ color:A }}>slug</code> ou <code style={{ color:A }}>slug:preco</code>
              </p>

              {/* Target */}
              <Label>Destino</Label>
              <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                <button onClick={()=>setBulkTarget('marketplace')} style={{
                  flex:1, padding:'10px', borderRadius:10, border:`0.5px solid ${bulkTarget==='marketplace'?A:'rgba(255,255,255,0.1)'}`,
                  background:bulkTarget==='marketplace'?`${A}15`:'transparent',
                  color:bulkTarget==='marketplace'?A:'rgba(241,245,249,0.5)', cursor:'pointer', fontWeight:700, fontSize:13,
                }}>
                  👑 Marketplace (para venda)
                </button>
                <button onClick={()=>setBulkTarget('vault')} style={{
                  flex:1, padding:'10px', borderRadius:10, border:`0.5px solid ${bulkTarget==='vault'?'#10b981':'rgba(255,255,255,0.1)'}`,
                  background:bulkTarget==='vault'?'rgba(16,185,129,0.12)':'transparent',
                  color:bulkTarget==='vault'?'#10b981':'rgba(241,245,249,0.5)', cursor:'pointer', fontWeight:700, fontSize:13,
                }}>
                  🔐 Vault (minha conta)
                </button>
              </div>

              {bulkTarget==='marketplace' && (
                <div style={{ marginBottom:12 }}>
                  <Label>Categoria padrão</Label>
                  <select value={bulkCat} onChange={e=>setBulkCat(e.target.value)} style={{ ...inp, width:200 }}>
                    {['general','profession','tech','finance','lifestyle','creative','media'].map(c=>(
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              <Label>Slugs</Label>
              <textarea value={bulkText} onChange={e=>setBulkText(e.target.value)}
                style={{ ...inp, width:'100%', minHeight:200, resize:'vertical', fontFamily:"'JetBrains Mono',monospace", fontSize:13, marginBottom:12 }}
                placeholder={'ceo:18000\ndev:2900\nai:4400\nnft:1800\ntech:800\nfoto\nblog\nshop'}
              />

              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <span style={{ fontSize:12, color:'rgba(241,245,249,0.4)' }}>
                  {bulkText.split('\n').filter(l=>l.trim()).length} slugs detectados
                </span>
                <Btn onClick={runBulk} disabled={bulkRunning||!bulkText.trim()}>
                  {bulkRunning ? <><Loader2 size={13} className="animate-spin"/> Processando…</> : <><Package size={13}/> Registrar Todos</>}
                </Btn>
              </div>

              {bulkResults.length>0 && (
                <div style={{ background:'rgba(0,0,0,0.3)', borderRadius:10, padding:14, maxHeight:240, overflowY:'auto' }}>
                  <p style={{ fontSize:10, fontWeight:700, color:'rgba(241,245,249,0.4)', marginBottom:8, textTransform:'uppercase' }}>
                    Resultados ({bulkResults.filter(r=>r.startsWith('✅')).length} ok / {bulkResults.filter(r=>r.startsWith('❌')).length} erros)
                  </p>
                  {bulkResults.map((r,i)=>(
                    <p key={i} style={{ fontSize:12, fontFamily:'monospace', color:r.startsWith('✅')?'#4ade80':r.startsWith('⚠️')?'#f59e0b':'#ef4444', margin:'2px 0' }}>{r}</p>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ── REGISTERED SLUGS ── */}
        {tab==='registered' && (
          <div>
            <Card style={{ marginBottom:12 }}>
              <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                <input value={slugSearch} onChange={e=>setSlugSearch(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&loadAllSlugs(slugSearch)}
                  placeholder="Buscar slug…" style={{ ...inp, flex:1, maxWidth:280 }}/>
                <Btn onClick={()=>loadAllSlugs(slugSearch)}><Search size={13}/> Buscar</Btn>
                <Btn ghost onClick={()=>loadAllSlugs('')}><RefreshCw size={13}/> Todos</Btn>
                {!slugLoaded && <p style={{ fontSize:12, color:'rgba(241,245,249,0.4)', margin:0 }}>Clique "Todos" para carregar</p>}
              </div>
            </Card>

            {loading && <div style={{textAlign:'center',padding:30}}><Loader2 size={24} color={A} className="animate-spin"/></div>}

            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {allSlugs.map(s => (
                <div key={s.id} style={{
                  display:'flex', alignItems:'center', gap:10, padding:'9px 14px',
                  borderRadius:10, background:'rgba(255,255,255,0.03)',
                  border:`0.5px solid ${s.for_sale?'rgba(245,158,11,0.3)':'rgba(255,255,255,0.07)'}`,
                }}>
                  <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:700, color:'#f1f5f9', flex:1 }}>{s.slug}</span>
                  <span style={{ fontSize:11, color:'rgba(241,245,249,0.35)', minWidth:120 }}>
                    {s.mini_sites?.site_name || 'sem site'} · {s.status}
                  </span>
                  {s.for_sale && <span style={{ fontSize:11, color:'#f59e0b', fontWeight:700 }}>💰 ${(s.sale_price||0).toLocaleString()}</span>}
                  <span style={{ fontSize:10, color:'rgba(241,245,249,0.3)' }}>
                    {s.expires_at ? new Date(s.expires_at).toLocaleDateString('pt-BR') : '∞'}
                  </span>
                  <Btn sm ghost onClick={async()=>{
                    const price = prompt(`Preço de venda para ${s.slug} (USDC):`, s.sale_price||'100');
                    if (!price) return;
                    await updateReg(s.id, { for_sale:true, sale_price:parseFloat(price), status:'for_sale' });
                  }}><Tag size={11}/> {s.for_sale?'Editar':'Vender'}</Btn>
                  {s.for_sale && <Btn sm ghost onClick={()=>updateReg(s.id,{for_sale:false,sale_price:null,status:'active'})}><X size={11}/></Btn>}
                  <Btn sm ghost onClick={async()=>{
                    // send to marketplace
                    await (supabase as any).from('premium_slugs').upsert({slug:s.slug,price:s.sale_price||slugPrice(s.slug),category:'general',active:true},{onConflict:'slug'});
                    showToast(`✅ ${s.slug} enviado ao marketplace`);
                  }}><Crown size={11}/> Market</Btn>
                  <button onClick={()=>deleteReg(s.id,s.slug)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.5)' }}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              ))}
              {slugLoaded && allSlugs.length===0 && !loading && (
                <p style={{ textAlign:'center', padding:'30px 0', color:'rgba(241,245,249,0.3)', fontSize:13 }}>Nenhum slug encontrado</p>
              )}
            </div>
          </div>
        )}

        {/* ── AUCTIONS ── */}
        {tab==='auctions' && (
          <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:16, alignItems:'start' }}>
            <Card>
              <p style={{ fontSize:13, fontWeight:800, color:'#f1f5f9', marginBottom:14 }}>⚡ Criar Leilão</p>
              <Label>Slug</Label>
              <input value={aSlug} onChange={e=>setASlug(normalizeSlug(e.target.value))}
                placeholder="ceo" style={{ ...inp, width:'100%', marginBottom:10, fontFamily:"'JetBrains Mono',monospace" }}/>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                <div><Label>Lance mínimo</Label><input value={aMin} onChange={e=>setAMin(e.target.value)} type="number" style={{ ...inp, width:'100%' }}/></div>
                <div><Label>Incremento</Label><input value={aInc} onChange={e=>setAInc(e.target.value)} type="number" style={{ ...inp, width:'100%' }}/></div>
              </div>
              <Label>Duração (dias)</Label>
              <input value={aDays} onChange={e=>setADays(e.target.value)} type="number" style={{ ...inp, width:'100%', marginBottom:12 }}/>
              <Btn onClick={createAuction} disabled={!aSlug} style={{ width:'100%', justifyContent:'center' }}>
                <Gavel size={13}/> Criar Leilão
              </Btn>
            </Card>

            <Card>
              <p style={{ fontSize:13, fontWeight:800, color:'#f1f5f9', marginBottom:12 }}>Leilões ({auctions.length})</p>
              {loading && <div style={{textAlign:'center',padding:20}}><Loader2 size={20} color={A} className="animate-spin"/></div>}
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {auctions.map(a=>(
                  <div key={a.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:`0.5px solid ${a.status==='active'?'rgba(245,158,11,0.3)':'rgba(255,255,255,0.07)'}` }}>
                    <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:13, fontWeight:700, color:'#f1f5f9', flex:1 }}>{a.slug}</span>
                    <span style={{ fontSize:11, color:'#4ade80', fontWeight:700 }}>Lance atual: ${(a.current_bid||a.min_bid||0).toLocaleString()}</span>
                    <span style={{ fontSize:10, color:'rgba(241,245,249,0.4)' }}>até {new Date(a.ends_at).toLocaleDateString('pt-BR')}</span>
                    <span style={{ fontSize:10, padding:'2px 8px', borderRadius:100, background:a.status==='active'?'rgba(245,158,11,0.12)':'rgba(128,128,128,0.1)', color:a.status==='active'?'#f59e0b':'#6b7280', fontWeight:700 }}>
                      {a.status}
                    </span>
                    <button onClick={async()=>{
                      if (!confirm('Encerrar leilão?')) return;
                      await (supabase as any).from('slug_auctions').update({status:'ended'}).eq('id',a.id);
                      loadAuctions();
                    }} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.5)', fontSize:11, fontWeight:700 }}>
                      Encerrar
                    </button>
                  </div>
                ))}
                {auctions.length===0&&!loading&&<p style={{ textAlign:'center', padding:'24px 0', color:'rgba(241,245,249,0.3)', fontSize:13 }}>Nenhum leilão</p>}
              </div>
            </Card>
          </div>
        )}

        {/* ── SITES ── */}
        {tab==='sites' && (
          <div>
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              <input value={siteSearch} onChange={e=>setSiteSearch(e.target.value)}
                placeholder="Buscar sites…" style={{ ...inp, width:280 }}/>
              <Btn ghost onClick={loadSites}><RefreshCw size={13}/></Btn>
            </div>
            {loading && <div style={{textAlign:'center',padding:30}}><Loader2 size={24} color={A} className="animate-spin"/></div>}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:10 }}>
              {sites.filter(s=>!siteSearch||s.site_name?.toLowerCase().includes(siteSearch.toLowerCase())||s.slug?.includes(siteSearch)).map(s=>(
                <Card key={s.id} style={{ padding:14 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8 }}>
                    {s.avatar_url
                      ?<img src={s.avatar_url} style={{ width:36,height:36,borderRadius:'50%',objectFit:'cover',flexShrink:0 }}/>
                      :<div style={{ width:36,height:36,borderRadius:'50%',background:`${A}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,fontWeight:900,color:A,flexShrink:0 }}>{(s.site_name||'?')[0]}</div>
                    }
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontSize:13,fontWeight:700,color:'#f1f5f9',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{s.site_name||s.slug}</p>
                      <p style={{ fontSize:10,color:'rgba(241,245,249,0.4)',margin:0,fontFamily:'monospace' }}>{s.slug}.trustbank.xyz</p>
                    </div>
                    <span style={{ fontSize:9,padding:'2px 7px',borderRadius:100,background:s.published?'rgba(74,222,128,0.1)':'rgba(255,255,255,0.05)',color:s.published?'#4ade80':'rgba(241,245,249,0.3)',fontWeight:700 }}>
                      {s.published?'Live':'Draft'}
                    </span>
                  </div>
                  <Link href={`/s/${s.slug}`} target="_blank" style={{ fontSize:11,color:A,textDecoration:'none' }}>Ver site →</Link>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── SETTINGS ── */}
        {tab==='settings' && (
          <div style={{ maxWidth:600 }}>
            <Card style={{ marginBottom:12 }}>
              <p style={{ fontSize:15,fontWeight:800,color:'#f1f5f9',marginBottom:16 }}>⚙️ Configurações</p>
              <div style={{ padding:'14px',borderRadius:10,background:'rgba(129,140,248,0.07)',border:`0.5px solid ${A}25`,marginBottom:12 }}>
                <p style={{ fontSize:12,color:A,margin:0,fontWeight:700 }}>Admin: {user?.email}</p>
                <p style={{ fontSize:11,color:'rgba(241,245,249,0.4)',margin:'4px 0 0' }}>TrustBank v2 · trustbank.xyz</p>
              </div>
              <p style={{ fontSize:12,color:'rgba(241,245,249,0.5)',marginBottom:16 }}>
                Para dar admin a outro usuário:<br/>
                <code style={{ color:A,fontSize:11 }}>INSERT INTO user_roles (user_id, role) VALUES ('id', 'admin');</code>
              </p>
            </Card>

            <Card>
              <p style={{ fontSize:13,fontWeight:800,color:'#f1f5f9',marginBottom:12 }}>📊 Tabela de Preços</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(140px,1fr))', gap:8 }}>
                {[['1 char','$5,000','Ultra Rare'],['2 chars','$3,500','Legendary'],['3 chars','$3,000','Premium'],['4 chars','$1,500','Premium'],['5 chars','$500','Popular'],['6 chars','$150','Standard'],['7+ chars','$12/yr','Free']].map(([c,p,t])=>(
                  <div key={c} style={{ padding:'12px',borderRadius:10,background:'rgba(255,255,255,0.03)',border:'0.5px solid rgba(255,255,255,0.07)',textAlign:'center' }}>
                    <p style={{ fontSize:14,fontWeight:900,color:'#f1f5f9',margin:'0 0 2px' }}>{c}</p>
                    <p style={{ fontSize:16,fontWeight:900,color:'#4ade80',margin:'0 0 2px' }}>{p}</p>
                    <p style={{ fontSize:10,color:'rgba(241,245,249,0.4)',margin:0 }}>{t}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
