'use client';
import { useState, useEffect } from 'react';
import { useLang } from '@/hooks/useLang';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { Navbar } from '@/components/layout/Navbar';
import { supabase } from '@/lib/supabase';
import { normalizeSlug, slugPrice, slugTier } from '@/lib/slug';
import { Search, ShoppingCart, Gavel, Tag, Crown, TrendingUp, Check, X, Loader2, ChevronRight } from 'lucide-react';

const A = '#818cf8';

const PRICE_TIERS = [
  { chars: '1', price: '$5,000', label: 'Ultra Rare', color: '#f59e0b' },
  { chars: '2', price: '$3,500', label: 'Legendary', color: '#ef4444' },
  { chars: '3', price: '$3,000', label: 'Premium', color: A },
  { chars: '4', price: '$1,500', label: 'Premium', color: A },
  { chars: '5', price: '$500', label: 'Popular', color: '#10b981' },
  { chars: '6', price: '$150', label: 'Standard', color: '#6b7280' },
  { chars: '7+', price: '$12/yr', label: 'Free tier', color: '#4b5563' },
];

export function SlugMarketplace() {
  const { t } = useLang();
  const { user } = useAuth();
  const { add, open: openCart } = useCart();

  const [search, setSearch] = useState('');
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean|null>(null);
  const [activeTab, setActiveTab] = useState<'premium'|'auctions'|'market'>('premium');
  const [premiumSlugs, setPremiumSlugs] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [forSale, setForSale] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    supabase.from('premium_slugs' as any).select('*').eq('active', true).is('sold_to', null)
      .order('price', { ascending: false }).limit(48)
      .then(({ data }) => setPremiumSlugs(data || []));
    (supabase as any).from('slug_auctions').select('*').eq('status', 'active')
      .gt('ends_at', new Date().toISOString()).order('ends_at', { ascending: true }).limit(20)
      .then(({ data }: any) => setAuctions(data || []));
    (supabase as any).from('slug_registrations').select('*')
      .eq('for_sale', true).eq('status', 'active').order('sale_price', { ascending: true }).limit(48)
      .then(({ data }: any) => setForSale(data || []));
  }, []);

  useEffect(() => {
    if (!user) { setIsAdmin(false); return; }
    (supabase as any).from('user_roles').select('role').eq('user_id', user.id).eq('role', 'admin').maybeSingle()
      .then(({ data }: any) => setIsAdmin(!!data));
  }, [user]);

  // Check availability
  useEffect(() => {
    const clean = normalizeSlug(search);
    if (!clean || clean.length < 1) { setAvailable(null); return; }
    const timer = setTimeout(async () => {
      setChecking(true);
      const [{ data: site }, { data: reg }] = await Promise.all([
        supabase.from('mini_sites').select('id').eq('slug', clean).maybeSingle(),
        (supabase as any).from('slug_registrations').select('id').eq('slug', clean).eq('status', 'active').maybeSingle(),
      ]);
      setAvailable(!site && !reg);
      setChecking(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const clean = normalizeSlug(search);
  const price = clean ? slugPrice(clean) : 0;
  const tier = clean ? slugTier(clean) : '';

  const handleRegister = async () => {
    if (!user) { window.location.href = '/login'; return; }
    if (!clean) return;
    if (isAdmin) {
      setRegistering(true);
      const { data: ex } = await (supabase as any).from('slug_registrations').select('id').eq('slug', clean).maybeSingle();
      if (!ex) {
        await (supabase as any).from('slug_registrations').insert({
          user_id: user.id, slug: clean, status: 'active',
          expires_at: new Date(Date.now() + 365*86400000).toISOString(), for_sale: false,
        });
        setAvailable(false);
      }
      setRegistering(false);
      return;
    }
    add({ id: `slug_${clean}`, label: `${clean}.trustbank.xyz`, price, type: 'slug' });
    openCart();
  };

  const handleBuyPremium = (slug: any) => {
    if (!user) { window.location.href = '/login'; return; }
    add({ id: `slug_prem_${slug.id}`, label: `${slug.slug}.trustbank.xyz (Premium)`, price: slug.price, type: 'slug' });
    openCart();
  };

  const handleBuyMarket = (slug: any) => {
    if (!user) { window.location.href = '/login'; return; }
    add({ id: `slug_mkt_${slug.id}`, label: `${slug.slug}.trustbank.xyz`, price: slug.sale_price, type: 'slug' });
    openCart();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', borderRadius: 100, background: `${A}12`, border: `0.5px solid ${A}25`, marginBottom: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: A }}>🔥 Slugs are unique digital assets</span>
          </div>
          <h1 style={{ fontSize: 'clamp(28px,5vw,52px)', fontWeight: 900, marginBottom: 12, letterSpacing: '-0.02em' }}>
            {t.slugMarketplace}
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(241,245,249,0.5)', maxWidth: 500, margin: '0 auto' }}>
            {t.slugSubtitle}
          </p>
        </div>

        {/* Search & Register */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 24, marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(241,245,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{t.checkAvailability}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                value={search}
                onChange={e => setSearch(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                placeholder={t.yourSlug}
                style={{
                  width: '100%', padding: '14px 16px 14px 44px',
                  borderRadius: 12, border: `0.5px solid ${available === true ? '#4ade80' : available === false ? '#ef4444' : 'rgba(255,255,255,0.12)'}`,
                  background: 'white', color: '#111827', fontSize: 16,
                  fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
                {checking ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              </div>
              {clean && (
                <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, fontWeight: 700, color: '#6b7280' }}>
                  .trustbank.xyz
                </div>
              )}
            </div>
            <button
              onClick={handleRegister}
              disabled={!clean || available === false || registering}
              style={{
                padding: '14px 24px', borderRadius: 12, border: 'none',
                background: available === true ? 'linear-gradient(135deg, #4ade80, #22c55e)' : `linear-gradient(135deg, ${A}, #6366f1)`,
                color: '#fff', fontSize: 14, fontWeight: 800, cursor: !clean || available === false ? 'not-allowed' : 'pointer',
                opacity: !clean || available === false ? 0.5 : 1, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
              }}>
              {registering ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} />}
              {isAdmin ? 'Register Free' : t.register}
            </button>
          </div>

          {/* Availability status */}
          {clean && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {available === true && <span style={{ fontSize: 14, fontWeight: 700, color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4 }}><Check size={16} /> {t.available}</span>}
              {available === false && <span style={{ fontSize: 14, fontWeight: 700, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4 }}><X size={16} /> {t.taken}</span>}
              {clean && available !== false && (
                <span style={{ fontSize: 13, color: 'rgba(241,245,249,0.5)' }}>
                  {clean}.trustbank.xyz · {tier} ·
                  <span style={{ color: price > 12 ? '#f59e0b' : '#4ade80', fontWeight: 700 }}> ${price.toLocaleString()}{price === 12 ? '/yr' : ' USDC'}</span>
                  {isAdmin && <span style={{ color: A, fontWeight: 700 }}> · Admin: FREE</span>}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Price table */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 20, marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(241,245,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>{t.priceTable}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 8 }}>
            {PRICE_TIERS.map(tier => (
              <div key={tier.chars} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: `0.5px solid ${tier.color}25` }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: tier.color }}>{tier.chars} char{tier.chars !== '1' && tier.chars !== '7+' ? 's' : ''}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#f1f5f9', margin: '4px 0' }}>{tier.price}</div>
                <div style={{ fontSize: 10, color: 'rgba(241,245,249,0.4)', fontWeight: 600 }}>{tier.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 24, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4, border: '0.5px solid rgba(255,255,255,0.06)' }}>
          {([
            { id: 'premium', label: `👑 ${t.premium}`, count: premiumSlugs.length },
            { id: 'auctions', label: `⚡ ${t.auctions}`, count: auctions.length },
            { id: 'market', label: `🏷️ ${t.market}`, count: forSale.length },
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '10px 12px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: activeTab === tab.id ? A : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'rgba(241,245,249,0.5)',
              fontSize: 13, fontWeight: 700, transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
              {tab.label}
              <span style={{
                padding: '2px 7px', borderRadius: 100, fontSize: 11,
                background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)',
              }}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Premium slugs */}
        {activeTab === 'premium' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {premiumSlugs.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'rgba(241,245,249,0.3)' }}>No premium slugs listed yet</div>
            )}
            {premiumSlugs.map(slug => (
              <div key={slug.id} style={{
                padding: 20, borderRadius: 16, cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)',
                transition: 'all 0.2s',
              }}>
                {slug.category && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: A, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 8 }}>
                    {slug.category === 'hot' ? '🔥 Hot' : slug.category}
                  </span>
                )}
                <div style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9', marginBottom: 4, fontFamily: "'JetBrains Mono', monospace" }}>
                  {slug.slug}
                </div>
                <div style={{ fontSize: 12, color: 'rgba(241,245,249,0.4)', marginBottom: 16 }}>
                  {slug.slug?.length} chars · {slugTier(slug.slug || '')}
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#4ade80', marginBottom: 14 }}>
                  ${(slug.price || 0).toLocaleString()} USDC
                </div>
                <button onClick={() => handleBuyPremium(slug)} style={{
                  width: '100%', padding: '10px', borderRadius: 10, border: 'none',
                  background: `linear-gradient(135deg, ${A}, #6366f1)`,
                  color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <ShoppingCart size={14} /> {t.buy}
                </button>
                {isAdmin && (
                  <button onClick={async () => {
                    if (!confirm('Remove from marketplace?')) return;
                    await (supabase as any).from('premium_slugs').update({ active: false }).eq('id', slug.id);
                    setPremiumSlugs(prev => prev.filter((s: any) => s.id !== slug.id));
                  }} style={{ width: '100%', marginTop: 6, padding: '7px', borderRadius: 9, border: '0.5px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)', color: '#ef4444', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    ✕ Remove from marketplace
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Auctions */}
        {activeTab === 'auctions' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
            {auctions.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'rgba(241,245,249,0.3)' }}>No active auctions</div>
            )}
            {auctions.map(a => (
              <div key={a.id} style={{ padding: 20, borderRadius: 16, background: 'rgba(245,158,11,0.05)', border: '0.5px solid rgba(245,158,11,0.2)' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>⚡ {t.auction}</span>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9', margin: '8px 0 4px', fontFamily: "'JetBrains Mono', monospace" }}>{a.slug}</div>
                <div style={{ fontSize: 12, color: 'rgba(241,245,249,0.4)', marginBottom: 12 }}>
                  Ends: {new Date(a.ends_at).toLocaleDateString()}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'rgba(241,245,249,0.4)' }}>Current bid</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#4ade80' }}>${(a.current_bid || a.min_bid || 0).toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 10, color: 'rgba(241,245,249,0.4)' }}>Min increment</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>+${(a.min_increment || 10).toLocaleString()}</div>
                  </div>
                </div>
                <button onClick={() => {
                  if (!user) { window.location.href = '/login'; return; }
                  const bid = (a.current_bid || a.min_bid || 0) + (a.min_increment || 10);
                  add({ id: `slug_bid_${a.id}`, label: `Bid: ${a.slug}.trustbank.xyz ($${bid})`, price: bid, type: 'slug' });
                  openCart();
                }} style={{
                  width: '100%', padding: '10px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <Gavel size={14} /> {t.bid}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Market */}
        {activeTab === 'market' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {forSale.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: 'rgba(241,245,249,0.3)' }}>No slugs for sale from users yet</div>
            )}
            {forSale.map(s => (
              <div key={s.id} style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)' }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.08em' }}>🏷️ User listing</span>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#f1f5f9', margin: '8px 0 4px', fontFamily: "'JetBrains Mono', monospace" }}>{s.slug}</div>
                <div style={{ fontSize: 12, color: 'rgba(241,245,249,0.4)', marginBottom: 12 }}>{s.slug?.length} chars</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#4ade80', marginBottom: 14 }}>
                  ${(s.sale_price || 0).toLocaleString()} USDC
                </div>
                <button onClick={() => handleBuyMarket(s)} style={{
                  width: '100%', padding: '10px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  <ShoppingCart size={14} /> {t.buy}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
