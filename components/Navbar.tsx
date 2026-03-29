'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Hash, ChevronDown, ShoppingCart, X, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/hooks/useLang';
import { LANGUAGES } from '@/lib/i18n/translations';

const A = '#6d28d9';

// Cart item type (passed from pages that have a cart)
export interface CartItem {
  slug: string;
  price: number;
  type: 'standard' | 'premium' | 'user_listing';
  listingId?: string;
}

interface NavbarProps {
  cart?: CartItem[];
  onRemoveFromCart?: (slug: string) => void;
  onCheckout?: () => void;
  checkoutLoading?: boolean;
}

export default function Navbar({ cart = [], onRemoveFromCart, onCheckout, checkoutLoading }: NavbarProps) {
  const { user } = useAuth();
  const { lang, setLang, t } = useLang();
  const pathname = usePathname();
  const [langOpen, setLangOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const total = cart.reduce((s, i) => s + i.price, 0);

  const NAV = [
    { href: '/',              label: t.home },
    { href: '/directory',     label: t.directory },
    { href: '/slugs',         label: t.slugs },
    { href: '/classificados', label: t.classifieds },
    { href: '/ads',           label: t.advertise },
  ];

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <header style={{ background: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64, gap: 12 }}>

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: A, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Hash style={{ width: 18, height: 18, color: 'white' }} />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: A }}>jobinlink</span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, justifyContent: 'center' }}>
          {NAV.map(l => (
            <Link key={l.href} href={l.href} style={{
              padding: '7px 13px', borderRadius: 9, textDecoration: 'none', fontSize: 14, fontWeight: 500,
              color: pathname === l.href ? A : '#374151',
              background: pathname === l.href ? '#ede9fe' : 'transparent',
              transition: 'all 0.15s', whiteSpace: 'nowrap'
            }}>
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right: lang + cart + auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>

          {/* Language switcher */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => { setLangOpen(!langOpen); setCartOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 10px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              <span>{currentLang.flag}</span>
              <span>{currentLang.label}</span>
              <ChevronDown style={{ width: 13, height: 13, color: '#9ca3af', transform: langOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>

            {langOpen && (
              <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', width: 200, background: 'white', borderRadius: 14, boxShadow: '0 8px 40px rgba(0,0,0,0.12)', border: '1px solid #e5e7eb', zIndex: 200, overflow: 'hidden', animation: 'slideDown 0.15s ease' }}>
                <div style={{ padding: '8px', maxHeight: 360, overflowY: 'auto' }}>
                  {LANGUAGES.map(l => (
                    <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, border: 'none', background: lang === l.code ? '#ede9fe' : 'transparent', color: lang === l.code ? A : '#374151', fontSize: 13, fontWeight: lang === l.code ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'background 0.1s' }}>
                      <span style={{ fontSize: 16 }}>{l.flag}</span>
                      <span style={{ flex: 1 }}>{l.name}</span>
                      {lang === l.code && <Check style={{ width: 13, height: 13, color: A }} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cart button (only shown when cart prop is provided) */}
          {onRemoveFromCart && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => { setCartOpen(!cartOpen); setLangOpen(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 12, border: `2px solid ${cart.length ? A : '#e5e7eb'}`, background: cart.length ? A : 'white', color: cart.length ? 'white' : '#374151', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}>
                <ShoppingCart style={{ width: 15, height: 15 }} />
                {t.cart}
                {cart.length > 0 && (
                  <span style={{ background: 'white', color: A, borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800 }}>
                    {cart.length}
                  </span>
                )}
              </button>

              {cartOpen && (
                <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 6px)', width: 340, background: 'white', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e5e7eb', zIndex: 200, overflow: 'hidden', animation: 'slideDown 0.15s ease' }}>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>{t.cartTitle} ({cart.length})</p>
                    <button onClick={() => setCartOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
                      <X style={{ width: 16, height: 16 }} />
                    </button>
                  </div>

                  {cart.length === 0 ? (
                    <div style={{ padding: '32px 18px', textAlign: 'center', color: '#9ca3af' }}>
                      <ShoppingCart style={{ width: 32, height: 32, margin: '0 auto 10px', opacity: 0.3 }} />
                      <p style={{ fontSize: 14 }}>{t.cartEmpty}</p>
                    </div>
                  ) : (
                    <>
                      <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {cart.map(item => (
                          <div key={item.slug} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 18px', borderBottom: '1px solid #f9fafb', gap: 10 }}>
                            <div style={{ flex: 1 }}>
                              <p style={{ fontSize: 15, fontWeight: 800, color: '#111827', margin: '0 0 4px', fontFamily: 'monospace' }}>/{item.slug}</p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: item.type === 'premium' ? '#fef3c7' : item.type === 'user_listing' ? '#e0f2fe' : '#f3f4f6', color: item.type === 'premium' ? '#92400e' : item.type === 'user_listing' ? '#0369a1' : '#6b7280', fontWeight: 600 }}>
                                  {item.type === 'premium' ? t.premiumType : item.type === 'user_listing' ? t.userListing : t.standard}
                                </span>
                                {/* Slug tier badge */}
                                {item.slug.length <= 1 && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: '#fef3c7', color: '#b45309', fontWeight: 700 }}>1L 👑</span>}
                                {item.slug.length === 2 && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: '#ede9fe', color: A, fontWeight: 700 }}>2L 💎</span>}
                                {item.slug.length === 3 && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: '#e0f2fe', color: '#0369a1', fontWeight: 700 }}>3L ⭐</span>}
                                {item.slug.length === 4 && <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: '#d1fae5', color: '#047857', fontWeight: 700 }}>4L</span>}
                              </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                              {/* Show REAL price */}
                              <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: 18, fontWeight: 800, color: A, margin: 0 }}>${item.price.toLocaleString()}</p>
                                {item.type === 'standard' && <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>/year</p>}
                              </div>
                              <button onClick={() => onRemoveFromCart(item.slug)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 4, borderRadius: 6, display: 'flex' }}>
                                <X style={{ width: 14, height: 14 }} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ padding: '14px 18px', borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <p style={{ fontSize: 15, fontWeight: 600, color: '#374151', margin: 0 }}>{t.total}</p>
                          <p style={{ fontSize: 24, fontWeight: 800, color: A, margin: 0 }}>${total.toLocaleString()} USDC</p>
                        </div>
                        <button onClick={() => { onCheckout?.(); setCartOpen(false); }} disabled={checkoutLoading}
                          style={{ width: '100%', padding: '13px', borderRadius: 12, border: 'none', background: A, color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: checkoutLoading ? 0.7 : 1 }}>
                          <ShoppingCart style={{ width: 16, height: 16 }} />
                          {checkoutLoading ? '...' : t.checkout}
                        </button>
                        <p style={{ textAlign: 'center', fontSize: 11, color: '#9ca3af', marginTop: 8 }}>{t.payWith}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Auth */}
          {user ? (
            <Link href="/dashboard" style={{ padding: '8px 16px', borderRadius: 10, background: '#f3f4f6', color: '#374151', textDecoration: 'none', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>
              {t.dashboard}
            </Link>
          ) : (
            <Link href="/login" style={{ padding: '9px 18px', borderRadius: 12, background: A, color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' }}>
              {t.signIn}
            </Link>
          )}
        </div>
      </div>

      {/* Close dropdowns on outside click */}
      {(langOpen || cartOpen) && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => { setLangOpen(false); setCartOpen(false); }} />
      )}
    </header>
  );
}
