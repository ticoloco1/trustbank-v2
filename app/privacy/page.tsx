'use client';
import { Navbar } from '@/components/layout/Navbar';
export default function Page() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '60px 24px', color: '#f1f5f9' }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 24, textTransform: 'capitalize' }}>privacy</h1>
        <p style={{ color: 'rgba(241,245,249,0.5)', lineHeight: 1.8 }}>TrustBank · trustbank.xyz · USDC payments on Polygon. All transactions are peer-to-peer. TrustBank does not hold funds.</p>
      </div>
    </div>
  );
}
