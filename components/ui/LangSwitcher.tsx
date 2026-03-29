'use client';
import { useState, useRef, useEffect } from 'react';
import { useLang } from '@/hooks/useLang';
import { ChevronDown } from 'lucide-react';

export function LangSwitcher() {
  const { lang, setLang, languages } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = languages.find(l => l.code === lang) || languages[0];

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '7px 10px', borderRadius: 8,
        background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)',
        color: 'rgba(241,245,249,0.7)', cursor: 'pointer', fontSize: 13, fontWeight: 600,
      }}>
        <span style={{ fontSize: 15 }}>{current.flag}</span>
        <span>{current.label}</span>
        <ChevronDown size={11} />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, marginTop: 6,
          background: '#161b22', border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: 14, padding: 6, minWidth: 170,
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)', zIndex: 200,
          maxHeight: 320, overflowY: 'auto',
        }}>
          {languages.map(l => (
            <button key={l.code} onClick={() => { setLang(l.code); setOpen(false); }} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', padding: '8px 12px', borderRadius: 8,
              background: lang === l.code ? 'rgba(129,140,248,0.12)' : 'transparent',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              color: lang === l.code ? 'var(--accent)' : '#f1f5f9',
              fontSize: 13, fontWeight: lang === l.code ? 700 : 400,
            }}>
              <span style={{ fontSize: 16 }}>{l.flag}</span>
              <span style={{ flex: 1 }}>{l.name}</span>
              {lang === l.code && <span style={{ fontSize: 11, color: 'var(--accent)' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
