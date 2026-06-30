'use client';

import { useState, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { EthLogo } from '@/components/EthLogo';
import { WalletButton } from '@/components/WalletButton';
import { StakeModal } from '@/components/StakeModal';

/* ── Constants ── */
const APR_MAP: Record<number, number> = { 30: 5.5, 90: 8.3, 180: 9.7 };
const TVL = 227936;
const PARTICIPANTS = 28492;

function getBonus(eth: number, days: number): number {
  if (eth >= 128) return days === 30 ? 1.1 : days === 90 ? 2.0 : 2.2;
  if (eth >= 96)  return days === 30 ? 1.0 : days === 90 ? 1.7 : 1.8;
  if (eth >= 64)  return days === 30 ? 0.8 : days === 90 ? 1.5 : 1.5;
  if (eth >= 32)  return days === 30 ? 0.4 : days === 90 ? 0.5 : 1.0;
  return 0;
}

function fmtEth(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}

function fmtBig(n: number) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toFixed(0);
}

/* ── Fake APR chart data (last 7 days) ── */
function aprChartData(basePlan: number) {
  const base = APR_MAP[basePlan];
  const seed = [0, 0.1, 0.2, -0.1, 0.3, 0.1, -0.05, 0.15];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    return { label, apr: +(base + seed[i]).toFixed(2) };
  });
}

/* ── Mini SVG line chart ── */
function AprChart({ days }: { days: number }) {
  const data = aprChartData(days);
  const min = Math.min(...data.map(d => d.apr)) - 0.2;
  const max = Math.max(...data.map(d => d.apr)) + 0.2;
  const W = 340, H = 70;
  const px = (i: number) => (i / (data.length - 1)) * (W - 24) + 12;
  const py = (v: number) => H - 10 - ((v - min) / (max - min)) * (H - 20);
  const points = data.map((d, i) => `${px(i)},${py(d.apr)}`).join(' ');
  const areaPoints = `12,${H - 10} ${points} ${px(data.length - 1)},${H - 10}`;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: 240, height: H }}>
        <defs>
          <linearGradient id="aprGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#aprGrad)" />
        <polyline points={points} fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {data.map((d, i) => (
          <circle key={i} cx={px(i)} cy={py(d.apr)} r="2.5" fill="#60a5fa" />
        ))}
        {data.map((d, i) => (
          <text key={i} x={px(i)} y={H - 1} textAnchor="middle" fill="#3a4566" fontSize="9">{d.label}</text>
        ))}
      </svg>
    </div>
  );
}

export default function StakePage() {
  const [days, setDays] = useState<30 | 90 | 180>(90);
  const [amount, setAmount] = useState(8);
  const [inputVal, setInputVal] = useState('8');
  const [showModal, setShowModal] = useState(false);
  const [stakedEth, setStakedEth] = useState(0);
  const [earnedEth, setEarnedEth] = useState(0);

  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { data: balanceData } = useBalance({ address, query: { enabled: isConnected } });

  const baseApr = APR_MAP[days];
  const bonus = getBonus(amount, days);
  const apr = baseApr + bonus;
  const bestApr = 9.7 + 2.2; // 180d + 128ETH
  const periodGain = amount * apr / 100 * days / 365;
  const total = amount + periodGain;

  useEffect(() => {
    if (!address) return;
    fetch(`/api/stakes?wallet=${address}`)
      .then(r => r.json())
      .then((stakes: any[]) => {
        if (!Array.isArray(stakes)) return;
        const now = Date.now();
        let staked = 0, earned = 0;
        for (const s of stakes) {
          if (s.status !== 'active') continue;
          staked += Number(s.amount_eth) || 0;
          const d = Math.max(0, (now - new Date(s.started_at).getTime()) / 86_400_000);
          const effApr = (APR_MAP[s.plan_days] ?? 8.3) + getBonus(Number(s.amount_eth), s.plan_days);
          earned += Number(s.amount_eth) * effApr / 100 * d / 365;
        }
        setStakedEth(staked);
        setEarnedEth(earned);
      })
      .catch(() => {});
  }, [address]);

  const handleInput = (v: string) => {
    setInputVal(v);
    const n = parseFloat(v);
    if (!isNaN(n) && n >= 8) setAmount(n);
  };
  const handleBlur = () => {
    const n = parseFloat(inputVal);
    const clamped = isNaN(n) || n < 8 ? 8 : n;
    setAmount(clamped);
    setInputVal(String(clamped));
  };

  const walletEth = balanceData ? parseFloat(parseFloat(balanceData.formatted).toFixed(4)) : 0;

  const plans = [
    { d: 30 as const,  apr: 5.5,  label: '30 days' },
    { d: 90 as const,  apr: 8.3,  label: '90 days', hot: true },
    { d: 180 as const, apr: 9.7,  label: '180 days' },
  ];

  /* ── Styles ── */
  const card: React.CSSProperties = {
    background: '#0d1121',
    border: '1px solid #1a2040',
    borderRadius: 16,
    padding: '16px 18px',
  };
  const statCard: React.CSSProperties = {
    background: '#080b14',
    border: '1px solid #1a2040',
    borderRadius: 12,
    padding: '14px 16px',
    flex: 1,
  };

  return (
    <div style={{ minHeight: '100vh', background: '#060710', color: '#e8eaf8', fontFamily: 'Inter, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: #0d1121; } ::-webkit-scrollbar-thumb { background: #1a2040; border-radius: 4px; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; }
        @keyframes pulse2 { 0%,100%{opacity:1} 50%{opacity:.5} }
      `}</style>

      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #1a2040', background: 'rgba(6,7,15,.95)', backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: 1, color: '#e8eaf8', textDecoration: 'none' }}>
            <span style={{ width: 28, height: 28, border: '2px solid #60a5fa', borderRadius: 7, display: 'grid', placeItems: 'center' }}>
              <EthLogo size={12} />
            </span>
            GETHSTAKE
          </Link>
          <span style={{ color: '#1a2040', fontSize: 20 }}>·</span>
          <span style={{ fontSize: 13, color: '#5a6480', fontFamily: "'Chakra Petch',sans-serif", textTransform: 'uppercase', letterSpacing: '.8px' }}>Staking</span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            {isConnected && (
              <Link href="/dashboard" style={{ fontSize: 12, color: '#60a5fa', fontFamily: "'Chakra Petch',sans-serif", textTransform: 'uppercase', letterSpacing: '.5px', textDecoration: 'none', border: '1px solid #60a5fa33', borderRadius: 8, padding: '7px 14px' }}>
                Dashboard
              </Link>
            )}
            <WalletButton />
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 520, margin: '0 auto', padding: '32px 16px 64px' }}>

        {/* ── Main widget ── */}
        <div style={{ ...card, padding: '24px 22px' }}>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, border: '2px solid #60a5fa', borderRadius: 9, display: 'grid', placeItems: 'center' }}>
                <EthLogo size={15} />
              </div>
              <div>
                <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: 16, letterSpacing: .5 }}>ETH Staking</div>
                <div style={{ fontSize: 11, color: '#5a6480', marginTop: 1 }}>{fmtBig(PARTICIPANTS)} participants · {fmtBig(TVL)} ETH locked</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.25)', borderRadius: 8, padding: '4px 10px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', animation: 'pulse2 2s infinite' }} />
              <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 600 }}>Live</span>
            </div>
          </div>

          {/* APR stat cards */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <div style={{ ...statCard }}>
              <div style={{ fontSize: 11, color: '#5a6480', marginBottom: 6 }}>Current APR</div>
              <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 22, fontWeight: 700, color: '#e8eaf8' }}>{apr.toFixed(2)}%</div>
              {bonus > 0 && <div style={{ fontSize: 10, color: '#60a5fa', marginTop: 3 }}>+{bonus}% volume bonus</div>}
            </div>
            <div style={{ ...statCard, background: 'rgba(96,165,250,.08)', border: '1px solid rgba(96,165,250,.35)', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 9, color: '#60a5fa', fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.5px', background: 'rgba(96,165,250,.15)', borderRadius: 5, padding: '2px 6px' }}>Best</div>
              <div style={{ fontSize: 11, color: '#8a93b8', marginBottom: 6 }}>Max APR</div>
              <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 22, fontWeight: 700, color: '#60a5fa' }}>{bestApr.toFixed(2)}%</div>
              <div style={{ fontSize: 10, color: '#5a6480', marginTop: 3 }}>180d · 128 ETH</div>
            </div>
            <div style={statCard}>
              <div style={{ fontSize: 11, color: '#5a6480', marginBottom: 6 }}>Total staked</div>
              <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 18, fontWeight: 700, color: '#e8eaf8' }}>{fmtBig(TVL)}</div>
              <div style={{ fontSize: 10, color: '#5a6480', marginTop: 3 }}>ETH</div>
            </div>
          </div>

          {/* APR Chart */}
          <div style={{ background: '#080b14', border: '1px solid #1a2040', borderRadius: 12, padding: '12px 14px', marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: '#5a6480', marginBottom: 8 }}>Avg APR · Last 7 Days</div>
            <AprChart days={days} />
          </div>

          {/* Balance cards (when connected) */}
          {isConnected && (
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {[
                { l: 'Wallet balance', v: walletEth > 0 ? `${walletEth} ETH` : '—', icon: '◈' },
                { l: 'Staked balance', v: stakedEth > 0 ? `${fmtEth(stakedEth)} ETH` : '—', icon: '◈' },
                { l: 'Earned', v: earnedEth > 0 ? `+${fmtEth(earnedEth)} ETH` : '0', icon: '◇' },
              ].map(b => (
                <div key={b.l} style={{ ...statCard, flex: 1 }}>
                  <div style={{ fontSize: 11, color: '#5a6480', marginBottom: 6 }}>{b.l}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ color: '#60a5fa', fontSize: 14 }}>{b.icon}</span>
                    <span style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 13, fontWeight: 700 }}>{b.v}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Plan tabs */}
          <div style={{ display: 'flex', background: '#080b14', border: '1px solid #1a2040', borderRadius: 12, padding: 4, gap: 4, marginBottom: 16 }}>
            {plans.map(p => (
              <button
                key={p.d}
                onClick={() => setDays(p.d)}
                style={{
                  flex: 1,
                  background: days === p.d ? '#1a2a4a' : 'transparent',
                  border: days === p.d ? '1px solid #60a5fa55' : '1px solid transparent',
                  borderRadius: 9,
                  padding: '8px 4px',
                  cursor: 'pointer',
                  transition: 'all .15s',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: 13, color: days === p.d ? '#60a5fa' : '#5a6480' }}>{p.label}</div>
                <div style={{ fontSize: 11, color: days === p.d ? '#a0b8f0' : '#3a4566', marginTop: 2 }}>{p.apr}% APR</div>
              </button>
            ))}
          </div>

          {/* Amount input */}
          <div style={{ background: '#080b14', border: '1px solid #1a2040', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 11, color: '#5a6480', textTransform: 'uppercase', letterSpacing: '.6px' }}>Deposit amount</span>
              <span style={{ fontSize: 11, color: '#3a4566' }}>Min: 8 ETH</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                type="number"
                value={inputVal}
                min={8}
                step={1}
                onChange={e => handleInput(e.target.value)}
                onBlur={handleBlur}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e8eaf8', fontFamily: "'Chakra Petch',sans-serif", fontSize: 28, fontWeight: 700, width: '100%' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1a2040', borderRadius: 8, padding: '6px 12px', flexShrink: 0 }}>
                <EthLogo size={14} />
                <span style={{ fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: 14, color: '#e8eaf8' }}>ETH</span>
              </div>
            </div>

            {/* Quick amounts */}
            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              {[8, 16, 32, 64, 96, 128].map(v => (
                <button
                  key={v}
                  onClick={() => { setAmount(v); setInputVal(String(v)); }}
                  style={{ background: amount === v ? 'rgba(96,165,250,.15)' : '#1a2040', border: `1px solid ${amount === v ? '#60a5fa55' : 'transparent'}`, borderRadius: 7, padding: '4px 10px', color: amount === v ? '#60a5fa' : '#5a6480', fontSize: 12, fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, cursor: 'pointer' }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Yield preview */}
          <div style={{ background: '#080b14', border: '1px solid #1a2040', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              {[
                { l: 'Period yield', v: `+${fmtEth(periodGain)} ETH`, green: true },
                { l: 'APR', v: `${apr.toFixed(1)}%`, blue: true },
                { l: 'Total payout', v: `${fmtEth(total)} ETH` },
              ].map(r => (
                <div key={r.l} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 14, fontWeight: 700, color: (r as any).green ? '#22c55e' : (r as any).blue ? '#60a5fa' : '#e8eaf8' }}>{r.v}</div>
                  <div style={{ fontSize: 10, color: '#5a6480', marginTop: 3, textTransform: 'uppercase', letterSpacing: '.5px' }}>{r.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA button */}
          {isConnected ? (
            <button
              onClick={() => setShowModal(true)}
              style={{ width: '100%', background: 'linear-gradient(135deg, #2563eb, #60a5fa)', color: '#fff', border: 'none', borderRadius: 12, padding: '15px 0', fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '.5px', cursor: 'pointer', textTransform: 'uppercase' }}
            >
              Start Staking → {amount} ETH · {days}d
            </button>
          ) : (
            <button
              onClick={() => openConnectModal?.()}
              style={{ width: '100%', background: 'linear-gradient(135deg, #2563eb, #60a5fa)', color: '#fff', border: 'none', borderRadius: 12, padding: '15px 0', fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: '.5px', cursor: 'pointer', textTransform: 'uppercase' }}
            >
              Connect Wallet
            </button>
          )}

          {/* Info row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 14 }}>
            {[
              { icon: '🔒', text: 'Non-custodial' },
              { icon: '⚡', text: 'ETH yield' },
              { icon: '🛡', text: 'Audited' },
            ].map(i => (
              <div key={i.text} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#5a6480' }}>
                <span>{i.icon}</span>{i.text}
              </div>
            ))}
          </div>
        </div>

        {/* Bonus tiers info */}
        <div style={{ ...card, marginTop: 16 }}>
          <div style={{ fontSize: 11, color: '#5a6480', textTransform: 'uppercase', letterSpacing: '.8px', fontFamily: "'Chakra Petch',sans-serif", marginBottom: 12 }}>Volume Bonus APR</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { tier: '32 ETH', bonus30: '+0.4%', bonus90: '+0.5%', bonus180: '+1.0%' },
              { tier: '64 ETH', bonus30: '+0.8%', bonus90: '+1.5%', bonus180: '+1.5%' },
              { tier: '96 ETH', bonus30: '+1.0%', bonus90: '+1.7%', bonus180: '+1.8%' },
              { tier: '128 ETH', bonus30: '+1.1%', bonus90: '+2.0%', bonus180: '+2.2%' },
            ].map(row => (
              <div key={row.tier} style={{ background: '#080b14', border: '1px solid #1a2040', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: 12, color: '#60a5fa', marginBottom: 6 }}>{row.tier}+</div>
                <div style={{ fontSize: 11, color: '#5a6480' }}>30d <b style={{ color: '#a0b8f0' }}>{row.bonus30}</b> · 90d <b style={{ color: '#a0b8f0' }}>{row.bonus90}</b> · 180d <b style={{ color: '#a0b8f0' }}>{row.bonus180}</b></div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link href="/" style={{ fontSize: 12, color: '#3a4566', textDecoration: 'none' }}>← Back to main page</Link>
        </div>
      </div>

      {showModal && (
        <StakeModal
          amount={amount}
          days={days}
          apr={apr}
          periodGain={periodGain}
          total={total}
          lang="en"
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
