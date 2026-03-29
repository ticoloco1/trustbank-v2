'use client';
import Link from 'next/link';
import { useLang } from '@/hooks/useLang';
import { Navbar } from '@/components/layout/Navbar';
import { TrendingUp, Zap, Shield, DollarSign, Globe, Hash, Play, Lock, ChevronRight } from 'lucide-react';

const A = '#818cf8';

const TICKER = [
  { slug:'ceo', price:'$18,000', hot:true },
  { slug:'ai', price:'$4,400', hot:true },
  { slug:'dev', price:'$2,900', hot:false },
  { slug:'crypto', price:'$3,200', hot:true },
  { slug:'doctor', price:'$25,000', hot:true },
  { slug:'nft', price:'$1,800', hot:false },
  { slug:'x', price:'$5,900', hot:true },
  { slug:'tech', price:'$800', hot:false },
  { slug:'shop', price:'$300', hot:false },
  { slug:'pay', price:'$2,200', hot:true },
];

const FEATURES = [
  { icon: Globe, title: 'Beautiful Mini Sites', desc: 'Glass morphism UI. 30+ themes. Custom pages, links, videos, CV. Your professional identity on one URL.' },
  { icon: Hash, title: 'Slug Marketplace', desc: 'Own yourname.trustbank.xyz. Buy, sell, auction. Premium slugs from 1 char ($5,000) to 7+ chars ($12/yr).' },
  { icon: DollarSign, title: 'Get Paid in USDC', desc: 'CV unlock paywall, video paywall, feed posts. 100% goes to your Polygon wallet instantly.' },
  { icon: Play, title: 'Video Paywall', desc: 'Upload YouTube videos. Set a price. Fans pay USDC to watch. You keep 70%.' },
  { icon: Zap, title: 'Boost Your Ranking', desc: '$0.50 per position in the directory. Anyone can boost you — fans, friends, companies.' },
  { icon: Shield, title: 'Verified Profiles', desc: 'YouTube verification. Blue and gold badges. Trustworthy professional presence.' },
];

const PLANS = [
  { name: 'Free', price: '$0', features: ['1 mini site', '1 free slug (7+ chars)', '10 links', 'Feed posts', 'Basic themes'], color: '#6b7280' },
  { name: 'Pro', price: '$19.90', period: '/mo', features: ['Unlimited links', '3 site pages', 'Video paywall', 'CV paywall', 'Premium themes', '1 free premium slug'], color: A, popular: true },
  { name: 'Elite', price: '$49.90', period: '/mo', features: ['Everything in Pro', '10 pages', 'Custom domain', 'Priority support', '3 free premium slugs'], color: '#f59e0b' },
];

export default function Home() {
  const { t } = useLang();

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", overflowX: 'hidden' }}>
      <Navbar />

      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: -400, left: '50%', transform: 'translateX(-50%)', width: 900, height: 900, borderRadius: '50%', background: `${A}08`, filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Slug ticker */}
      <div style={{ background: 'rgba(129,140,248,0.06)', borderBottom: '0.5px solid rgba(129,140,248,0.15)', padding: '8px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 32, animation: 'ticker 20s linear infinite', whiteSpace: 'nowrap' }}>
          {[...TICKER, ...TICKER].map((s, i) => (
            <span key={i} style={{ fontSize: 12, fontWeight: 700, color: s.hot ? A : 'rgba(241,245,249,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
              {s.hot && <span style={{ color: '#f59e0b' }}>🔥</span>}
              {s.slug}.trustbank.xyz
              <span style={{ color: '#4ade80', marginLeft: 2 }}>{s.price}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 100, background: `${A}12`, border: `0.5px solid ${A}30`, marginBottom: 28 }}>
          <TrendingUp size={13} color={A} />
          <span style={{ fontSize: 12, fontWeight: 700, color: A, letterSpacing: '0.05em' }}>MINI SITES · USDC PAYMENTS ON POLYGON</span>
        </div>

        <h1 style={{ fontSize: 'clamp(36px,7vw,80px)', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-0.03em', margin: '0 0 20px' }}>
          {t.hero.split('.')[0]}.<br />
          <span style={{ background: `linear-gradient(135deg, ${A}, #06b6d4)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {t.hero.split('.')[1]}.
          </span>
        </h1>

        <p style={{ fontSize: 'clamp(15px,2vw,20px)', color: 'rgba(241,245,249,0.55)', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.6 }}>
          {t.heroSub}
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/login" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px', borderRadius: 12,
            background: `linear-gradient(135deg, ${A}, #6366f1)`,
            color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 800,
            boxShadow: `0 8px 32px ${A}40`,
          }}>
            {t.getStarted} <ChevronRight size={18} />
          </Link>
          <Link href="/slugs" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '14px 28px', borderRadius: 12,
            background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.12)',
            color: '#f1f5f9', textDecoration: 'none', fontSize: 15, fontWeight: 700,
          }}>
            {t.browseSlugs}
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 60, flexWrap: 'wrap' }}>
          {[
            { v: '12+', l: 'Languages' },
            { v: '$12/yr', l: 'Standard slugs' },
            { v: 'USDC', l: 'Polygon payments' },
            { v: '100%', l: 'To your wallet' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(20px,3vw,32px)', fontWeight: 900, color: A }}>{s.v}</div>
              <div style={{ fontSize: 12, color: 'rgba(241,245,249,0.4)', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 900, marginBottom: 48, color: '#f1f5f9' }}>
          Everything you need
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              padding: 24, borderRadius: 20,
              background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)',
              transition: 'all 0.2s',
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${A}15`, border: `0.5px solid ${A}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <f.icon size={20} color={A} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(241,245,249,0.5)', lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px 100px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px,4vw,40px)', fontWeight: 900, marginBottom: 48, color: '#f1f5f9' }}>Simple pricing</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {PLANS.map(p => (
            <div key={p.name} style={{
              padding: 28, borderRadius: 20, position: 'relative',
              background: p.popular ? `linear-gradient(135deg, ${A}15, rgba(99,102,241,0.1))` : 'rgba(255,255,255,0.03)',
              border: `0.5px solid ${p.popular ? A + '50' : 'rgba(255,255,255,0.07)'}`,
              boxShadow: p.popular ? `0 0 40px ${A}15` : 'none',
            }}>
              {p.popular && (
                <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', padding: '4px 14px', borderRadius: 100, background: A, color: '#fff', fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap' }}>
                  Most Popular
                </div>
              )}
              <div style={{ fontSize: 14, fontWeight: 700, color: p.color, marginBottom: 8 }}>{p.name}</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#f1f5f9', lineHeight: 1 }}>
                {p.price}<span style={{ fontSize: 14, color: 'rgba(241,245,249,0.4)', fontWeight: 400 }}>{p.period || ''}</span>
              </div>
              <ul style={{ listStyle: 'none', marginTop: 20, marginBottom: 24 }}>
                {p.features.map(f => (
                  <li key={f} style={{ fontSize: 13, color: 'rgba(241,245,249,0.7)', padding: '6px 0', borderBottom: '0.5px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#4ade80', fontSize: 12 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" style={{
                display: 'block', textAlign: 'center', padding: '12px',
                borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 700,
                background: p.popular ? `linear-gradient(135deg, ${A}, #6366f1)` : 'rgba(255,255,255,0.08)',
                color: '#fff', border: p.popular ? 'none' : '0.5px solid rgba(255,255,255,0.1)',
              }}>
                {p.price === '$0' ? 'Start free' : 'Get started'}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: 'rgba(241,245,249,0.3)', display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</Link>
          <Link href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</Link>
          <span>© 2026 TrustBank · USDC payments on Polygon</span>
        </div>
      </footer>

      <style>{`
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}
