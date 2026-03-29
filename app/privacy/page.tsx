'use client';
import { Navbar } from '@/components/layout/Navbar';
export default function Page() {
  return (
    <div style={{ minHeight:'100vh', background:'#0d1117', color:'#f1f5f9', fontFamily:"'Plus Jakarta Sans',system-ui,sans-serif" }}>
      <Navbar />
      <div style={{ maxWidth:800, margin:'0 auto', padding:'60px 24px' }}>
        <h1 style={{ fontSize:32, fontWeight:900, marginBottom:24 }}>Terms & Privacy</h1>
        <p style={{ color:'rgba(241,245,249,0.6)', lineHeight:1.8 }}>TrustBank is a decentralized content platform. All transactions are peer-to-peer on the Polygon blockchain using USDC. Users are responsible for their content and transactions. USDC payments are final and non-refundable.</p>
      </div>
    </div>
  );
}
