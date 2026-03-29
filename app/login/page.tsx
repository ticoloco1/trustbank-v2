'use client';
import { useState } from 'react';
import { useLang } from '@/hooks/useLang';
import { supabase } from '@/lib/supabase';
import { TrendingUp, Mail, Chrome, Loader2 } from 'lucide-react';

const A = '#818cf8';

export default function LoginPage() {
  const { t } = useLang();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const sendMagicLink = async () => {
    if (!email) return;
    setSending(true);
    await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/auth/callback` } });
    setSent(true);
    setSending(false);
  };

  const signInGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/auth/callback` } });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ position: 'fixed', top: -300, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: `${A}08`, filter: 'blur(100px)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: `linear-gradient(135deg, ${A}, #6366f1)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <TrendingUp size={24} color="#fff" />
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#f1f5f9', marginBottom: 6 }}>{t.signInTitle}</h1>
          <p style={{ fontSize: 14, color: 'rgba(241,245,249,0.4)' }}>{t.signInSub}</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 28 }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>📬</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', marginBottom: 8 }}>{t.checkEmail}</h3>
              <p style={{ fontSize: 14, color: 'rgba(241,245,249,0.5)' }}>Magic link sent to <strong style={{ color: A }}>{email}</strong></p>
            </div>
          ) : (
            <>
              {/* Google */}
              <button onClick={signInGoogle} style={{
                width: '100%', padding: '13px 16px', borderRadius: 12,
                background: '#fff', border: 'none', cursor: 'pointer',
                color: '#111827', fontSize: 14, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                marginBottom: 16, transition: 'opacity 0.2s',
              }}>
                <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
                {t.continueGoogle}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
                <span style={{ fontSize: 12, color: 'rgba(241,245,249,0.3)' }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
              </div>

              {/* Email */}
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(241,245,249,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{t.emailLabel}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  value={email} onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMagicLink()}
                  type="email" placeholder="you@example.com"
                  style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: '0.5px solid rgba(255,255,255,0.12)', background: 'white', color: '#111827', fontSize: 14, outline: 'none', fontFamily: 'inherit' }}
                />
                <button onClick={sendMagicLink} disabled={!email || sending} style={{
                  padding: '12px 16px', borderRadius: 10, border: 'none',
                  background: `linear-gradient(135deg, ${A}, #6366f1)`,
                  color: '#fff', cursor: !email ? 'not-allowed' : 'pointer',
                  opacity: !email ? 0.5 : 1, flexShrink: 0,
                  display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700,
                }}>
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
                  {sending ? t.sending : t.sendLink}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
