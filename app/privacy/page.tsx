'use client';
import Link from 'next/link';

export default function Privacy() {
  return (
    <main style={{ maxWidth: 780, margin: '0 auto', padding: '80px 24px', color: '#eaf3ea', fontFamily: 'Inter, sans-serif', lineHeight: 1.7 }}>
      <Link href="/" style={{ color: '#9bfd4e', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
        ← Back to gethstake.com
      </Link>
      <h1 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 28, marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: '#5f7062', fontSize: 13, marginBottom: 40 }}>Last updated: June 2026</p>

      <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 16, color: '#9bfd4e', marginBottom: 12, marginTop: 36 }}>1. Information We Collect</h2>
      <p style={{ color: '#8a9b8c', marginBottom: 16 }}>We collect only the information necessary to provide the staking service. When you connect your wallet, we record your public Ethereum wallet address. We do not collect names, email addresses, or identity documents unless you voluntarily provide them.</p>

      <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 16, color: '#9bfd4e', marginBottom: 12, marginTop: 36 }}>2. How We Use Your Information</h2>
      <p style={{ color: '#8a9b8c', marginBottom: 16 }}>Your wallet address is used solely to track your staking positions, calculate yield, and display your dashboard. We do not sell, rent, or share your data with third parties for marketing purposes.</p>

      <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 16, color: '#9bfd4e', marginBottom: 12, marginTop: 36 }}>3. Blockchain Data</h2>
      <p style={{ color: '#8a9b8c', marginBottom: 16 }}>All on-chain transactions are public by nature of the Ethereum blockchain. We have no control over blockchain data visibility. Your wallet address and transaction history are publicly accessible on the Ethereum network.</p>

      <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 16, color: '#9bfd4e', marginBottom: 12, marginTop: 36 }}>4. Cookies and Analytics</h2>
      <p style={{ color: '#8a9b8c', marginBottom: 16 }}>We use minimal session data necessary for platform functionality. We do not use tracking cookies or behavioral advertising technology.</p>

      <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 16, color: '#9bfd4e', marginBottom: 12, marginTop: 36 }}>5. Data Security</h2>
      <p style={{ color: '#8a9b8c', marginBottom: 16 }}>We implement industry-standard security measures including encrypted connections (HTTPS) and access controls. Private keys are never stored or transmitted through our platform — your wallet remains under your sole control.</p>

      <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 16, color: '#9bfd4e', marginBottom: 12, marginTop: 36 }}>6. Third-Party Services</h2>
      <p style={{ color: '#8a9b8c', marginBottom: 16 }}>The platform integrates with Ethereum infrastructure providers (Everstake), wallet providers (MetaMask, Trust Wallet), and custody partners (Zodia Custody). Each has their own privacy policy governing data they independently process.</p>

      <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 16, color: '#9bfd4e', marginBottom: 12, marginTop: 36 }}>7. Your Rights</h2>
      <p style={{ color: '#8a9b8c', marginBottom: 16 }}>You may request deletion of your off-chain account data at any time by contacting us. On-chain data cannot be deleted as it is part of the immutable Ethereum ledger.</p>

      <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 16, color: '#9bfd4e', marginBottom: 12, marginTop: 36 }}>8. Contact</h2>
      <p style={{ color: '#8a9b8c', marginBottom: 16 }}>For privacy-related inquiries, contact us at: <span style={{ color: '#9bfd4e' }}>legal@gethstake.com</span></p>
    </main>
  );
}
