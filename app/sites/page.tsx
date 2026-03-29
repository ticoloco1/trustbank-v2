'use client';
import { useLang } from '@/hooks/useLang';
import { Navbar } from '@/components/layout/Navbar';
import { useDirectorySites } from '@/hooks/useMiniSite';
import Link from 'next/link';
import { Globe, TrendingUp } from 'lucide-react';

const A = '#818cf8';

export default function SitesPage() {
  const { t } = useLang();
  const { sites, loading } = useDirectorySites('trustbank');

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#f1f5f9', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
            <Globe size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 10, color: A }} />
            {t.sites}
          </h1>
          <p style={{ color: 'rgba(241,245,249,0.4)', fontSize: 15 }}>Discover professionals and creators on TrustBank</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'rgba(241,245,249,0.3)' }}>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {sites.map((site: any) => (
              <Link key={site.id} href={`/s/${site.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', transition: 'all 0.2s', cursor: 'pointer' }}>
                  {site.avatar_url ? (
                    <img src={site.avatar_url} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', marginBottom: 12 }} />
                  ) : (
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${A}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12, fontSize: 22, fontWeight: 900, color: A }}>
                      {(site.site_name || '?')[0].toUpperCase()}
                    </div>
                  )}
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', marginBottom: 4 }}>{site.site_name || site.slug}</div>
                  {site.bio && <div style={{ fontSize: 12, color: 'rgba(241,245,249,0.4)', lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>{site.bio}</div>}
                  <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(241,245,249,0.3)', fontFamily: 'monospace' }}>{site.slug}.trustbank.xyz</div>
                  {site.badge && <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 8px', borderRadius: 100, background: site.badge === 'gold' ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.15)', color: site.badge === 'gold' ? '#f59e0b' : '#60a5fa', fontSize: 10, fontWeight: 700 }}>{'✓ Verified'}</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
