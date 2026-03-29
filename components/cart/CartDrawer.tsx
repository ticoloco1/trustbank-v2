'use client';
import { useCart } from '@/hooks/useCart';
import { useLang } from '@/hooks/useLang';
import { X, ShoppingCart } from 'lucide-react';

export function CartDrawer() {
  const { items, remove, total, isOpen, close } = useCart();
  const { t } = useLang();
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
      <div onClick={close} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 360,
        background: '#0d1117', borderLeft: '0.5px solid rgba(255,255,255,0.1)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '20px 24px', borderBottom: '0.5px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ShoppingCart size={18} color="var(--accent)" />
            <span style={{ fontWeight: 800, fontSize: 16, color: '#f1f5f9' }}>{t.cart}</span>
          </div>
          <button onClick={close} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(241,245,249,0.5)' }}><X size={18} /></button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(241,245,249,0.4)' }}>
              <ShoppingCart size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
              <p>{t.cartEmpty}</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.id} style={{
                padding: '14px 16px', borderRadius: 12, marginBottom: 8,
                background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14, margin: 0 }}>{item.label}</p>
                  <p style={{ color: '#4ade80', fontSize: 13, fontWeight: 700, margin: '2px 0 0' }}>${item.price.toLocaleString()} USDC</p>
                </div>
                <button onClick={() => remove(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(239,68,68,0.7)', padding: 4 }}><X size={16} /></button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div style={{ padding: '16px 24px', borderTop: '0.5px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <span style={{ color: 'rgba(241,245,249,0.6)', fontSize: 14 }}>{t.total}</span>
              <span style={{ color: '#4ade80', fontWeight: 800, fontSize: 18 }}>${total.toLocaleString()} USDC</span>
            </div>
            <button style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, #818cf8, #6366f1)',
              color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer',
            }}>
              {t.checkout} — ${total.toLocaleString()} USDC
            </button>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(241,245,249,0.3)', marginTop: 8 }}>
              Paid in USDC · Polygon Network · Helio
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
