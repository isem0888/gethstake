'use client';
import Link from 'next/link';

export default function Terms() {
  return (
    <main style={{ maxWidth: 780, margin: '0 auto', padding: '80px 24px', color: '#eaf3ea', fontFamily: 'Inter, sans-serif', lineHeight: 1.7 }}>
      <Link href="/" style={{ color: '#9bfd4e', fontSize: 13, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 40 }}>
        ← Back to gethstake.com
      </Link>
      <h1 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 28, marginBottom: 8 }}>Terms of Use</h1>
      <p style={{ color: '#5f7062', fontSize: 13, marginBottom: 40 }}>Last updated: June 2026</p>

      <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 16, color: '#9bfd4e', marginBottom: 12, marginTop: 36 }}>1. Acceptance of Terms</h2>
      <p style={{ color: '#8a9b8c', marginBottom: 16 }}>By accessing and using gethstake.com you accept and agree to be bound by these Terms of Use. If you do not agree, please do not use the platform.</p>

      <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 16, color: '#9bfd4e', marginBottom: 12, marginTop: 36 }}>2. Eligibility</h2>
      <p style={{ color: '#8a9b8c', marginBottom: 16 }}>You must be at least 18 years old to use this platform. By participating, you represent that you have the legal capacity to enter into a binding agreement and that staking digital assets is lawful in your jurisdiction.</p>

      <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 16, color: '#9bfd4e', marginBottom: 12, marginTop: 36 }}>3. Nature of the Service</h2>
      <p style={{ color: '#8a9b8c', marginBottom: 16 }}>gethstake.com is a pooled Ethereum staking platform. The platform pools participant deposits of 8 ETH each into 32 ETH Ethereum validators and distributes staking rewards proportionally. This is not a savings account, bank deposit, or guaranteed return product.</p>

      <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 16, color: '#9bfd4e', marginBottom: 12, marginTop: 36 }}>4. Risks</h2>
      <p style={{ color: '#8a9b8c', marginBottom: 16 }}>Participation involves significant risks including but not limited to: (a) slashing penalties if validators malfunction or act dishonestly; (b) validator entry and exit queue delays; (c) smart contract vulnerabilities; (d) ETH price volatility; (e) regulatory changes. APR figures are target benchmarks based on current network conditions and are not guaranteed.</p>

      <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 16, color: '#9bfd4e', marginBottom: 12, marginTop: 36 }}>5. No Financial Advice</h2>
      <p style={{ color: '#8a9b8c', marginBottom: 16 }}>Nothing on this platform constitutes financial, investment, legal, or tax advice. You are solely responsible for your investment decisions. Consult a qualified professional before participating.</p>

      <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 16, color: '#9bfd4e', marginBottom: 12, marginTop: 36 }}>6. Lock Periods and Withdrawals</h2>
      <p style={{ color: '#8a9b8c', marginBottom: 16 }}>By selecting a staking plan you agree to lock your ETH for the stated period. Early withdrawal returns your principal but forfeits accrued yield. Withdrawal processing times depend on Ethereum network exit queue conditions and may take 1–5 business days.</p>

      <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 16, color: '#9bfd4e', marginBottom: 12, marginTop: 36 }}>7. Platform Fees</h2>
      <p style={{ color: '#8a9b8c', marginBottom: 16 }}>The platform charges a fee deducted from validator rewards. All APR figures shown are net of platform fees. Fees are subject to change with notice.</p>

      <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 16, color: '#9bfd4e', marginBottom: 12, marginTop: 36 }}>8. Limitation of Liability</h2>
      <p style={{ color: '#8a9b8c', marginBottom: 16 }}>To the maximum extent permitted by law, gethstake.com is not liable for any indirect, incidental, or consequential losses arising from your use of the platform, including losses due to network failures, slashing events, or market movements.</p>

      <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 16, color: '#9bfd4e', marginBottom: 12, marginTop: 36 }}>9. Modifications</h2>
      <p style={{ color: '#8a9b8c', marginBottom: 16 }}>We reserve the right to modify these Terms at any time. Continued use of the platform after changes constitutes acceptance of the updated Terms.</p>

      <h2 style={{ fontFamily: "'Chakra Petch', sans-serif", fontSize: 16, color: '#9bfd4e', marginBottom: 12, marginTop: 36 }}>10. Contact</h2>
      <p style={{ color: '#8a9b8c', marginBottom: 16 }}>For questions about these Terms: <span style={{ color: '#9bfd4e' }}>legal@gethstake.com</span></p>
    </main>
  );
}
