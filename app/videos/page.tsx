'use client';
import { Navbar } from '@/components/layout/Navbar';
export default function Page() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '80px 24px', textAlign: 'center', color: '#f1f5f9' }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🚧</div>
        <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8, textTransform: 'capitalize' }}>videos</h1>
        <p style={{ color: 'rgba(241,245,249,0.4)' }}>Coming soon — this section is under construction.</p>
      </div>
    </div>
  );
}
