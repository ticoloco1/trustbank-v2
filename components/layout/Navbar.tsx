'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/hooks/useLang';
import { useCart } from '@/hooks/useCart';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { LangSwitcher } from '@/components/ui/LangSwitcher';
import { TrendingUp, ShoppingCart, User, Hash } from 'lucide-react';

export function Navbar() {
  const { user } = useAuth();
  const { t } = useLang();
  const { items, open } = useCart();
  const path = usePathname();

  // Hide on minisite public pages
  if (path?.match(/^\/s\//)) return null;

  const navLinks = [
    { href: '/slugs', label: t.slugs },
    { href: '/sites', label: t.sites },
    { href: '/videos', label: t.videos },
    { href: '/cv', label: t.cvs },
    { href: '/jackpot', label: t.jackpot },
  ];

  return (
    <>
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(13,17,23,0.92)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
        height: 60,
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '0 24px',
          height: '100%', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginRight: 16, flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'linear-gradient(135deg, #818cf8, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <TrendingUp size={16} color="#fff" strokeWidth={2.5} />
            </div>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.02em' }}>TrustBank</div>
              <div style={{ fontSize: 8, color: 'rgba(241,245,249,0.35)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>MINI SITES · USDC</div>
            </div>
          </Link>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: 2, flex: 1 }}>
            {navLinks.map(nav => (
              <Link key={nav.href} href={nav.href} style={{
                padding: '6px 12px', borderRadius: 8,
                fontSize: 13, fontWeight: 600,
                color: path === nav.href ? 'var(--accent)' : 'rgba(241,245,249,0.5)',
                textDecoration: 'none', transition: 'all 0.15s',
                background: path === nav.href ? 'rgba(129,140,248,0.1)' : 'transparent',
              }}>
                {nav.label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <LangSwitcher />
            <button onClick={open} style={{
              position: 'relative', background: 'rgba(255,255,255,0.05)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: 8, cursor: 'pointer', padding: '7px 10px',
              color: 'rgba(241,245,249,0.6)',
              display: 'flex', alignItems: 'center',
            }}>
              <ShoppingCart size={16} />
              {items.length > 0 && (
                <span style={{
                  position: 'absolute', top: -4, right: -4,
                  width: 16, height: 16, borderRadius: '50%',
                  background: 'var(--accent)', color: '#fff',
                  fontSize: 10, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{items.length}</span>
              )}
            </button>

            {user ? (
              <Link href="/dashboard" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8,
                background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.1)',
                color: '#f1f5f9', textDecoration: 'none', fontSize: 13, fontWeight: 600,
              }}>
                <User size={13} />
                {user.email?.split('@')[0]}
              </Link>
            ) : (
              <Link href="/login" style={{
                padding: '7px 16px', borderRadius: 8,
                background: 'linear-gradient(135deg, #818cf8, #6366f1)',
                color: '#fff', textDecoration: 'none', fontSize: 13, fontWeight: 700,
              }}>
                {t.signIn}
              </Link>
            )}
          </div>
        </div>
      </nav>
      <CartDrawer />
    </>
  );
}
