'use client';
import { useState, useEffect } from 'react';
import { useLang } from '@/hooks/useLang';
import { useAuth } from '@/hooks/useAuth';
import { Navbar } from '@/components/layout/Navbar';
import { supabase } from '@/lib/supabase';
import { slugPrice, slugTier } from '@/lib/slug';
import { Lock, TrendingUp, Tag, Gavel, ArrowRightLeft, Globe, Edit2, X, Loader2, Plus } from 'lucide-react';
import Link from 'next/link';

const A = '#818cf8';

export function VaultClient() {
  const { t } = useLang();
  const { user, loading } = useAuth();
  const [slugs, setSlugs] = useState<any[]>([]);
  const [siteSlug, setSiteSlug] = useState('');
  const [mySite, setMySite] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Record<string, string>>({});
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [toast, setToast] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [bulkSlugs, setBulkSlugs] = useState('');
  const [bulkRegistering, setBulkRegistering] = useState(false);
  const [bulkResults, setBulkResults] = useState<string[]>([]);
  const [showBulk, setShowBulk] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    if (!user) return;
    (supabase as any).from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle()
      .then(({ data }: any) => setIsAdmin(!!data));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      (supabase as any).from('slug_registrations').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('mini_sites').select('id,slug,site_name').eq('user_id', user.id).maybeSingle(),
    ]).then(([{ data: slugData }, { data: site }]) => {
      setSlugs(slugData || []);
      if (site) { setMySite(site); setSiteSlug((site as any).slug || ''); }
    });
  }, [user]);

  const update = async (id: string, patch: any) => {
    setBusy(true);
    await (supabase as any).from('slug_registrations').update(patch).eq('id', id);
    setSlugs(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    setMode(m => ({ ...m, [id]: '' }));
    showToast('✅ Done!');
    setBusy(false);
  };

  const applySlug = async (slug: string) => {
    if (!mySite?.id) { showToast('⚠️ Create your mini site first at /dashboard'); return; }
    setBusy(true);
    await supabase.from('mini_sites').update({ slug }).eq('id', mySite.id);
    setSiteSlug(slug);
    showToast(`✅ ${slug}.trustbank.xyz is now active!`);
    setBusy(false);
  };

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Loader2 size={32} color={A} className="animate-spin" />
    </div>
  );

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#0d1117', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: 500, margin: '100px auto', textAlign: 'center', padding: 24 }}>
        <Lock size={48} color={A} style={{ margin: '0 auto 16px' }} />
        <h2 style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>Sign in to view your vault</h2>
        <Link href="/login" style={{ display: 'inline-block', padding: '12px 24px', borderRadius: 12, background: `linear-gradient(135deg, ${A}, #6366f1)`, color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
          Sign In
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <Navbar />
      {toast && (
        <div style={{ position: 'fixed', top: 80, right: 20, zIndex: 300, padding: '12px 20px', borderRadius: 12, background: '#161b22', border: '0.5px solid rgba(74,222,128,0.4)', color: '#4ade80', fontWeight: 700, fontSize: 14 }}>{toast}</div>
      )}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: '#f1f5f9', marginBottom: 4 }}>🔐 {t.vaultTitle}</h1>
            <p style={{ fontSize: 14, color: 'rgba(241,245,249,0.4)' }}>{t.vaultSub}</p>
          </div>
          <Link href="/slugs" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 10, background: `${A}15`, border: `0.5px solid ${A}30`, color: A, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
            <Plus size={15} /> Get more slugs
          </Link>
        </div>

        {/* Admin: Bulk register */}
        {isAdmin && (
          <div style={{ marginBottom:16 }}>
            <button onClick={() => setShowBulk(b => !b)} style={{
              padding:'8px 16px', borderRadius:8, border:`0.5px solid ${A}30`,
              background:`${A}10`, color:A, cursor:'pointer', fontSize:12, fontWeight:700,
              marginBottom:8,
            }}>
              📋 {showBulk ? 'Hide' : 'Bulk Register (Admin)'}
            </button>
            {showBulk && (
              <div style={{ padding:16, borderRadius:14, background:'rgba(129,140,248,0.06)', border:`0.5px solid ${A}20` }}>
                <p style={{ fontSize:11, color:'rgba(241,245,249,0.5)', marginBottom:8 }}>One slug per line or comma separated</p>
                <textarea value={bulkSlugs} onChange={e => setBulkSlugs(e.target.value)}
                  style={{ width:'100%', minHeight:80, padding:'10px 12px', borderRadius:10, border:'0.5px solid rgba(255,255,255,0.12)', background:'white', color:'#111827', fontSize:13, fontFamily:"'JetBrains Mono',monospace", outline:'none', resize:'vertical', boxSizing:'border-box' as const, marginBottom:10 }}
                  placeholder={"ceo\ndev\ntech\nai"} />
                <button onClick={registerBulk} disabled={bulkRegistering || !bulkSlugs.trim()} style={{
                  padding:'10px 20px', borderRadius:10, border:'none', background:A,
                  color:'#fff', fontWeight:700, fontSize:13, cursor:'pointer', marginBottom:8,
                  opacity:!bulkSlugs.trim()?0.5:1,
                }}>
                  {bulkRegistering ? '⏳ Registering...' : `📋 Register ${bulkSlugs.split(/[\n,]/).filter((s:string)=>s.trim()).length} slugs FREE`}
                </button>
                {bulkResults.length > 0 && (
                  <div style={{ maxHeight:120, overflowY:'auto' }}>
                    {bulkResults.map((r, i) => <p key={i} style={{ fontSize:11, fontFamily:'monospace', color:'rgba(241,245,249,0.7)', margin:'2px 0' }}>{r}</p>)}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {siteSlug && (
          <div style={{ padding: '14px 18px', borderRadius: 12, background: 'rgba(74,222,128,0.06)', border: '0.5px solid rgba(74,222,128,0.2)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Globe size={16} color="#4ade80" />
            <span style={{ fontSize: 14, color: '#4ade80', fontWeight: 700 }}>Active: {siteSlug}.trustbank.xyz</span>
            <Link href={`/s/${siteSlug}`} target="_blank" style={{ marginLeft: 'auto', fontSize: 12, color: A, textDecoration: 'none', fontWeight: 600 }}>View site →</Link>
          </div>
        )}

        {slugs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 20 }}>
            <Lock size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p style={{ color: 'rgba(241,245,249,0.4)', fontSize: 16, marginBottom: 20 }}>No slugs in your vault yet</p>
            <Link href="/slugs" style={{ padding: '12px 24px', borderRadius: 10, background: `linear-gradient(135deg, ${A}, #6366f1)`, color: '#fff', textDecoration: 'none', fontWeight: 700 }}>
              Get your first slug
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {slugs.map(s => {
              const m = mode[s.id] || '';
              const daysLeft = s.expires_at ? Math.max(0, Math.ceil((new Date(s.expires_at).getTime() - Date.now()) / 86400000)) : 365;
              const tier = slugTier(s.slug);
              const isActive = siteSlug === s.slug;

              return (
                <div key={s.id} style={{ borderRadius: 16, background: isActive ? 'rgba(74,222,128,0.04)' : 'rgba(255,255,255,0.03)', border: `0.5px solid ${isActive ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.08)'}`, overflow: 'hidden' }}>
                  <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    {/* Slug info */}
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18, fontWeight: 900, color: '#f1f5f9', fontFamily: "'JetBrains Mono', monospace" }}>{s.slug}</span>
                        {isActive && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(74,222,128,0.15)', color: '#4ade80', fontWeight: 700 }}>ACTIVE</span>}
                        {s.for_sale && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', fontWeight: 700 }}>FOR SALE</span>}
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(241,245,249,0.35)', marginTop: 2 }}>
                        .trustbank.xyz · {tier} · {daysLeft} {t.daysLeft}
                        {s.for_sale && s.sale_price && <span style={{ color: '#4ade80', marginLeft: 4 }}> · ${s.sale_price.toLocaleString()} USDC</span>}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {!isActive && (
                        <button onClick={() => applySlug(s.slug)} disabled={busy} style={{ padding: '7px 12px', borderRadius: 8, border: `0.5px solid ${A}40`, background: `${A}12`, color: A, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Globe size={12} /> {t.useOnSite}
                        </button>
                      )}
                      <button onClick={() => setMode(m => ({ ...m, [s.id]: m[s.id] === 'sell' ? '' : 'sell' }))} style={{ padding: '7px 12px', borderRadius: 8, border: '0.5px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(241,245,249,0.6)', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Tag size={12} /> {t.sell}
                      </button>
                      <button onClick={() => setMode(m => ({ ...m, [s.id]: m[s.id] === 'auction' ? '' : 'auction' }))} style={{ padding: '7px 12px', borderRadius: 8, border: '0.5px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(241,245,249,0.6)', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Gavel size={12} /> {t.auction}
                      </button>
                      <button onClick={() => setMode(m => ({ ...m, [s.id]: m[s.id] === 'transfer' ? '' : 'transfer' }))} style={{ padding: '7px 12px', borderRadius: 8, border: '0.5px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(241,245,249,0.6)', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ArrowRightLeft size={12} /> {t.transfer}
                      </button>
                      {s.for_sale && (
                        <>
                          <button onClick={() => setMode(m => ({ ...m, [s.id]: 'sell' }))} style={{ padding: '7px 12px', borderRadius: 8, border: '0.5px solid rgba(129,140,248,0.3)', background: 'rgba(129,140,248,0.1)', color: A, cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <Edit2 size={12} /> {t.editPrice}
                          </button>
                          <button onClick={() => update(s.id, { for_sale: false, sale_price: null, status: 'active' })} style={{ padding: '7px 12px', borderRadius: 8, border: '0.5px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                            <X size={12} /> {t.removeFromSale}
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Sell panel */}
                  {m === 'sell' && (
                    <div style={{ margin: '0 16px 16px', padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, color: 'rgba(241,245,249,0.6)', flexShrink: 0 }}>Price (USDC):</span>
                      <input type="number" value={prices[s.id] || ''} onChange={e => setPrices(p => ({ ...p, [s.id]: e.target.value }))}
                        className="price-input" placeholder="e.g. 500" min="1"
                        style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '0.5px solid rgba(255,255,255,0.12)', background: 'white', color: '#111827', fontSize: 14, outline: 'none', fontFamily: 'monospace' }}
                      />
                      <button onClick={() => update(s.id, { for_sale: true, sale_price: parseFloat(prices[s.id] || '0'), status: 'for_sale' })} disabled={!prices[s.id]} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: A, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13, opacity: !prices[s.id] ? 0.5 : 1 }}>
                        List for sale
                      </button>
                      <button onClick={() => setMode(m => ({ ...m, [s.id]: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(241,245,249,0.4)' }}><X size={16} /></button>
                    </div>
                  )}

                  {/* Transfer panel */}
                  {m === 'transfer' && (
                    <div style={{ margin: '0 16px 16px', padding: 16, borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, color: 'rgba(241,245,249,0.6)', flexShrink: 0 }}>Transfer to email:</span>
                      <input type="email" value={prices[`transfer_${s.id}`] || ''} onChange={e => setPrices(p => ({ ...p, [`transfer_${s.id}`]: e.target.value }))}
                        placeholder="user@example.com"
                        style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '0.5px solid rgba(255,255,255,0.12)', background: 'white', color: '#111827', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                      />
                      <button onClick={async () => {
                        const email = prices[`transfer_${s.id}`];
                        if (!email) return;
                        const { data: target } = await supabase.from('mini_sites').select('user_id').eq('contact_email', email).maybeSingle();
                        if (target) {
                          await update(s.id, { user_id: (target as any).user_id });
                          setSlugs(prev => prev.filter(sl => sl.id !== s.id));
                        } else { showToast('⚠️ User not found'); }
                      }} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#f59e0b', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                        {t.transfer}
                      </button>
                      <button onClick={() => setMode(m => ({ ...m, [s.id]: '' }))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(241,245,249,0.4)' }}><X size={16} /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
