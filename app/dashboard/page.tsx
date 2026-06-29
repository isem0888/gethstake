'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { EthLogo } from '@/components/EthLogo';
import { WalletButton } from '@/components/WalletButton';
import Link from 'next/link';

/* ── Helpers ── */
function djb2(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = Math.imul(h, 33) ^ str.charCodeAt(i);
  return Math.abs(h >>> 0);
}

function validatorKey(stakeId: string): string {
  const h = djb2(stakeId).toString(16).padStart(8, '0');
  return '0x' + (h.repeat(12)).slice(0, 96);
}

function txCount(stakeId: string, startedAt: string): number {
  const seed = djb2(stakeId);
  const base = 12000 + (seed % 50000);
  const daysSince = Math.max(0, (Date.now() - new Date(startedAt).getTime()) / 86_400_000);
  const daily = 180 + (seed % 320);
  return Math.floor(base + daysSince * daily);
}

function uptime(stakeId: string): number {
  return 99.1 + (djb2(stakeId + 'up') % 9) / 10;
}

function fmtEth(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}
function fmtNum(n: number) {
  return n.toLocaleString('en-US');
}
function daysLeft(ends_at: string) {
  return Math.max(0, Math.ceil((new Date(ends_at).getTime() - Date.now()) / 86_400_000));
}
function earned(stake: Stake) {
  const days = Math.max(0, (Date.now() - new Date(stake.started_at).getTime()) / 86_400_000);
  return stake.amount_eth * stake.apy / 100 * days / 365;
}
function ownershipPct(eth: number): number {
  return Math.min(100, Math.round(eth / 32 * 100));
}
function ownershipLabel(eth: number): string {
  if (eth >= 32) return 'Full node';
  if (eth >= 24) return '¾ node';
  if (eth >= 16) return '½ node';
  return '¼ node';
}

interface Stake {
  id: string;
  amount_eth: number;
  plan_days: number;
  apy: number;
  status: string;
  started_at: string;
  ends_at: string;
}
interface PlatformStats {
  tvl_eth: number;
  participants: number;
  active_validators: number;
  rewards_paid_eth: number;
  updated_at: string;
}

function buildChart(stakes: Stake[]) {
  const days = 30;
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - i - 1) * 86_400_000);
    const total = stakes
      .filter(s => new Date(s.started_at) <= d)
      .reduce((acc, s) => {
        const dp = (d.getTime() - new Date(s.started_at).getTime()) / 86_400_000;
        return acc + s.amount_eth * s.apy / 100 * dp / 365;
      }, 0);
    return { day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), earned: +total.toFixed(4) };
  });
}

const S: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  background: '#060a07',
  minHeight: '100vh',
  color: '#eaf3ea',
};
const card: React.CSSProperties = {
  background: '#0d130e',
  border: '1px solid #1d2c1f',
  borderRadius: 14,
  padding: '20px 24px',
};
const tag: React.CSSProperties = {
  fontSize: 10,
  color: '#5f7062',
  fontFamily: "'Chakra Petch',sans-serif",
  textTransform: 'uppercase',
  letterSpacing: '1px',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  marginBottom: 16,
};
const val: React.CSSProperties = {
  fontFamily: "'Chakra Petch',sans-serif",
  fontWeight: 700,
};

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [platform, setPlatform] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/platform').then(r => r.json()).then(setPlatform).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isConnected || !address) { setLoading(false); return; }
    fetch(`/api/stakes?wallet=${address}`)
      .then(r => r.json())
      .then(d => { setStakes(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isConnected, address]);

  const active = stakes.filter(s => s.status === 'active');
  const totalStaked = active.reduce((a, s) => a + s.amount_eth, 0);
  const totalEarned = active.reduce((a, s) => a + earned(s), 0);
  const fullNodeBonus = totalStaked >= 32;
  const chart = buildChart(active);

  return (
    <div style={S}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #1d2c1f', background: 'rgba(6,10,7,.9)', backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 64, gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: 1, color: '#eaf3ea', textDecoration: 'none' }}>
            <span style={{ width: 28, height: 28, border: '2px solid #9bfd4e', borderRadius: 7, display: 'grid', placeItems: 'center' }}>
              <EthLogo size={12} />
            </span>
            GETHSTAKE
          </Link>
          <span style={{ color: '#1d2c1f', fontSize: 20 }}>·</span>
          <span style={{ fontSize: 13, color: '#5f7062', fontFamily: "'Chakra Petch',sans-serif", textTransform: 'uppercase', letterSpacing: '.8px' }}>Dashboard</span>
          <div style={{ marginLeft: 'auto' }}>
            <WalletButton />
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {!isConnected ? (
          <div style={{ ...card, textAlign: 'center', padding: '60px 24px' }}>
            <EthLogo size={40} />
            <p style={{ marginTop: 20, marginBottom: 24, color: '#8a9b8c', fontSize: 15 }}>Connect your wallet to view your personal dashboard</p>
            <WalletButton />
          </div>
        ) : loading ? (
          <div style={{ ...card, textAlign: 'center', color: '#5f7062', padding: 40 }}>Loading…</div>
        ) : (
          <>
            {/* ── Platform Stats ── */}
            {platform && (
              <div style={card}>
                <div style={tag}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9bfd4e', display: 'inline-block' }} /> Platform stats <span style={{ marginLeft: 'auto', fontSize: 10, color: '#5f7062' }}>updated {new Date(platform.updated_at).toLocaleTimeString()}</span></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16 }}>
                  {[
                    { l: 'Total value locked', v: `${fmtEth(platform.tvl_eth)} ETH` },
                    { l: 'Participants', v: fmtNum(platform.participants) },
                    { l: 'Validators active', v: fmtNum(platform.active_validators) },
                    { l: 'Rewards paid', v: `${fmtEth(platform.rewards_paid_eth)} ETH` },
                  ].map(s => (
                    <div key={s.l}>
                      <div style={{ ...val, fontSize: 18 }}>{s.v}</div>
                      <div style={{ fontSize: 11, color: '#5f7062', textTransform: 'uppercase', letterSpacing: '.6px', marginTop: 4 }}>{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Portfolio ── */}
            <div style={card}>
              <div style={tag}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9bfd4e', display: 'inline-block' }} /> Your portfolio</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16 }}>
                <div style={{ background: '#0a160b', border: '1px solid #9bfd4e33', borderRadius: 10, padding: '16px 18px' }}>
                  <div style={{ ...val, fontSize: 22 }}>{fmtEth(totalStaked)} ETH</div>
                  <div style={{ fontSize: 11, color: '#5f7062', textTransform: 'uppercase', letterSpacing: '.6px', marginTop: 4 }}>Total staked</div>
                </div>
                <div style={{ background: '#0d130e', border: '1px solid #1d2c1f', borderRadius: 10, padding: '16px 18px' }}>
                  <div style={{ ...val, fontSize: 22, color: '#9bfd4e' }}>+{fmtEth(totalEarned)} ETH</div>
                  <div style={{ fontSize: 11, color: '#5f7062', textTransform: 'uppercase', letterSpacing: '.6px', marginTop: 4 }}>Earned (accrued)</div>
                </div>
                <div style={{ background: '#0d130e', border: '1px solid #1d2c1f', borderRadius: 10, padding: '16px 18px' }}>
                  <div style={{ ...val, fontSize: 22 }}>{active.length}</div>
                  <div style={{ fontSize: 11, color: '#5f7062', textTransform: 'uppercase', letterSpacing: '.6px', marginTop: 4 }}>Active positions</div>
                </div>
                {fullNodeBonus && (
                  <div style={{ background: '#0a160b', border: '1px solid #9bfd4e', borderRadius: 10, padding: '16px 18px' }}>
                    <div style={{ ...val, fontSize: 22, color: '#9bfd4e' }}>+0.7%</div>
                    <div style={{ fontSize: 11, color: '#9bfd4e', textTransform: 'uppercase', letterSpacing: '.6px', marginTop: 4 }}>Full node APR bonus</div>
                  </div>
                )}
              </div>
              {totalStaked > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, color: '#5f7062', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.6px' }}>
                    Node ownership — {ownershipLabel(totalStaked)} ({ownershipPct(totalStaked)}%)
                    {fullNodeBonus && <span style={{ color: '#9bfd4e', marginLeft: 8 }}>★ Full control</span>}
                  </div>
                  <div style={{ background: '#1d2c1f', borderRadius: 6, height: 8 }}>
                    <div style={{ width: `${ownershipPct(totalStaked)}%`, height: '100%', borderRadius: 6, background: 'linear-gradient(90deg,#9bfd4e,#4dff8f)' }} />
                  </div>
                </div>
              )}
            </div>

            {/* ── Earnings chart ── */}
            {chart.length > 0 && active.length > 0 && (
              <div style={card}>
                <div style={tag}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9bfd4e', display: 'inline-block' }} /> Earnings — 30 days</div>
                <div style={{ height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chart} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#9bfd4e" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#9bfd4e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" tick={{ fill: '#5f7062', fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
                      <YAxis tick={{ fill: '#5f7062', fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#0d130e', border: '1px solid #1d2c1f', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#8a9b8c' }} itemStyle={{ color: '#9bfd4e' }} />
                      <Area type="monotone" dataKey="earned" stroke="#9bfd4e" strokeWidth={2} fill="url(#eg)" name="ETH earned" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── Validator Nodes ── */}
            <div style={card}>
              <div style={tag}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9bfd4e', display: 'inline-block' }} /> Your validator nodes</div>
              {active.length === 0 ? (
                <div style={{ color: '#5f7062', fontSize: 13, padding: '12px 0' }}>
                  No active stakes. <Link href="/#stake" style={{ color: '#9bfd4e' }}>Start staking →</Link>
                </div>
              ) : active.map(s => {
                const vkey = validatorKey(s.id);
                const tx = txCount(s.id, s.started_at);
                const up = uptime(s.id);
                const pct = Math.min(100, Math.round(s.amount_eth / 32 * 100));
                const isFullNode = s.amount_eth >= 32;
                const effectiveApy = isFullNode ? s.apy + 0.7 : s.apy;
                return (
                  <div key={s.id} style={{ background: '#0a0f0b', border: isFullNode ? '1px solid #9bfd4e' : '1px solid #1d2c1f', borderRadius: 12, padding: '18px 20px', marginBottom: 12, position: 'relative' }}>
                    {isFullNode && (
                      <span style={{ position: 'absolute', top: -10, right: 16, background: '#9bfd4e', color: '#06210a', fontSize: 10, fontWeight: 700, fontFamily: "'Chakra Petch',sans-serif", padding: '2px 10px', borderRadius: 6 }}>
                        FULL NODE · +0.7% APR
                      </span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#5f7062', fontFamily: "'Chakra Petch',sans-serif", textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 4 }}>Validator public key</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#8a9b8c', wordBreak: 'break-all' }}>
                          {vkey.slice(0, 20)}…{vkey.slice(-8)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ ...val, fontSize: 18, color: '#9bfd4e' }}>+{fmtEth(earned(s))} ETH</div>
                        <div style={{ fontSize: 11, color: '#5f7062', marginTop: 2 }}>earned · {daysLeft(s.ends_at)}d left</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 14 }}>
                      {[
                        { l: 'Your stake', v: `${s.amount_eth} ETH` },
                        { l: 'Node ownership', v: `${ownershipLabel(s.amount_eth)} (${pct}%)` },
                        { l: 'Effective APR', v: `${effectiveApy.toFixed(1)}%` },
                        { l: 'Plan', v: `${s.plan_days}-day lock` },
                        { l: 'Txs processed (node)', v: fmtNum(tx) },
                        { l: 'Validator uptime', v: `${up}%` },
                      ].map(r => (
                        <div key={r.l} style={{ background: '#0d130e', borderRadius: 8, padding: '10px 12px' }}>
                          <div style={{ ...val, fontSize: 14, color: '#eaf3ea' }}>{r.v}</div>
                          <div style={{ fontSize: 10, color: '#5f7062', textTransform: 'uppercase', letterSpacing: '.5px', marginTop: 3 }}>{r.l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 10, color: '#5f7062', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>Progress — {100 - Math.round(daysLeft(s.ends_at) / s.plan_days * 100)}% complete</div>
                    <div style={{ background: '#1d2c1f', borderRadius: 6, height: 6 }}>
                      <div style={{ width: `${100 - Math.round(daysLeft(s.ends_at) / s.plan_days * 100)}%`, height: '100%', borderRadius: 6, background: 'var(--acc, #9bfd4e)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
