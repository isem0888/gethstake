'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { EthLogo } from './EthLogo';

interface PlatformStats {
  tvl_eth: number;
  participants: number;
  rewards_paid_eth: number;
  active_validators: number;
  updated_at: string;
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

function fmtEth(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtNum(n: number) {
  return n.toLocaleString('en-US');
}
function daysLeft(ends_at: string) {
  const ms = new Date(ends_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86400_000));
}
function earned(stake: Stake) {
  const daysPassed = (Date.now() - new Date(stake.started_at).getTime()) / 86400_000;
  return stake.amount_eth * stake.apy / 100 * daysPassed / 365;
}

// Генерируем демо-график доходности
function buildChartData(stakes: Stake[]) {
  if (!stakes.length) return [];
  const days = 30;
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(Date.now() - (days - i - 1) * 86400_000);
    const total = stakes
      .filter(s => new Date(s.started_at) <= d)
      .reduce((acc, s) => {
        const dp = (d.getTime() - new Date(s.started_at).getTime()) / 86400_000;
        return acc + s.amount_eth * s.apy / 100 * dp / 365;
      }, 0);
    return { day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), earned: +total.toFixed(4) };
  });
}

export function Dashboard() {
  const { address, isConnected } = useAccount();
  const [platform, setPlatform] = useState<PlatformStats | null>(null);
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [loadingPlatform, setLoadingPlatform] = useState(true);
  const [loadingStakes, setLoadingStakes] = useState(false);

  // Публичная статистика платформы
  useEffect(() => {
    fetch('/api/platform')
      .then(r => r.json())
      .then(d => { setPlatform(d); setLoadingPlatform(false); })
      .catch(() => setLoadingPlatform(false));
  }, []);

  // Личные стейки
  useEffect(() => {
    if (!isConnected || !address) return;
    setLoadingStakes(true);
    fetch(`/api/stakes?wallet=${address}`)
      .then(r => r.json())
      .then(d => { setStakes(Array.isArray(d) ? d : []); setLoadingStakes(false); })
      .catch(() => setLoadingStakes(false));
  }, [isConnected, address]);

  const activeStakes = stakes.filter(s => s.status === 'active');
  const totalStaked = activeStakes.reduce((a, s) => a + s.amount_eth, 0);
  const totalEarned = activeStakes.reduce((a, s) => a + earned(s), 0);
  const chartData = buildChartData(activeStakes);

  return (
    <div className="dashboard-wrap">
      {/* ── Platform Stats ── */}
      <div className="dash-section">
        <div className="dash-label">
          <span className="dotg" /> Platform stats
          {platform && (
            <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--mut2)' }}>
              updated {new Date(platform.updated_at).toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="dash-grid4">
          {[
            { label: 'Total value locked', value: loadingPlatform ? '—' : `${fmtEth(platform!.tvl_eth)} ETH` },
            { label: 'Participants', value: loadingPlatform ? '—' : fmtNum(platform!.participants) },
            { label: 'Validators active', value: loadingPlatform ? '—' : fmtNum(platform!.active_validators) },
            { label: 'Rewards paid', value: loadingPlatform ? '—' : `${fmtEth(platform!.rewards_paid_eth)} ETH` },
          ].map(s => (
            <div key={s.label} className="dash-stat">
              <div className="dash-stat-val">{s.value}</div>
              <div className="dash-stat-lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Personal Dashboard (only when connected) ── */}
      {isConnected && (
        <>
          <div className="dash-section">
            <div className="dash-label"><span className="dotg" /> Your portfolio</div>
            <div className="dash-grid3">
              <div className="dash-stat accent">
                <div className="dash-stat-val">{fmtEth(totalStaked)} ETH</div>
                <div className="dash-stat-lbl">Total staked</div>
              </div>
              <div className="dash-stat">
                <div className="dash-stat-val" style={{ color: 'var(--acc)' }}>+{fmtEth(totalEarned)} ETH</div>
                <div className="dash-stat-lbl">Earned (accrued)</div>
              </div>
              <div className="dash-stat">
                <div className="dash-stat-val">{activeStakes.length}</div>
                <div className="dash-stat-lbl">Active positions</div>
              </div>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="dash-section">
              <div className="dash-label"><span className="dotg" /> Earnings (30 days)</div>
              <div style={{ height: 140, marginTop: 8 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9bfd4e" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#9bfd4e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" tick={{ fill: '#5f7062', fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
                    <YAxis tick={{ fill: '#5f7062', fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#0d130e', border: '1px solid #1d2c1f', borderRadius: 8, fontSize: 12 }}
                      labelStyle={{ color: '#8a9b8c' }}
                      itemStyle={{ color: '#9bfd4e' }}
                    />
                    <Area type="monotone" dataKey="earned" stroke="#9bfd4e" strokeWidth={2} fill="url(#earnGrad)" name="ETH earned" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Stakes list */}
          <div className="dash-section">
            <div className="dash-label"><span className="dotg" /> Active positions</div>
            {loadingStakes ? (
              <div style={{ color: 'var(--mut)', fontSize: 13, padding: '16px 0' }}>Loading…</div>
            ) : activeStakes.length === 0 ? (
              <div style={{ color: 'var(--mut)', fontSize: 13, padding: '16px 0' }}>
                No active stakes yet. <a href="#stake" style={{ color: 'var(--acc)' }}>Start staking →</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
                {activeStakes.map(s => (
                  <div key={s.id} className="stake-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <EthLogo size={18} />
                      <div>
                        <div style={{ fontFamily: "'Chakra Petch', sans-serif", fontWeight: 700, fontSize: 14 }}>
                          {fmtEth(s.amount_eth)} ETH
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--mut)' }}>{s.plan_days}-day · {s.apy}% APR</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ color: 'var(--acc)', fontFamily: "'Chakra Petch', sans-serif", fontSize: 13, fontWeight: 700 }}>
                        +{fmtEth(earned(s))} ETH
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--mut)' }}>{daysLeft(s.ends_at)}d left</div>
                    </div>
                    <div className="stake-bar-wrap">
                      <div
                        className="stake-bar"
                        style={{ width: `${Math.min(100, 100 - daysLeft(s.ends_at) / s.plan_days * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {!isConnected && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--mut)', fontSize: 14 }}>
          Connect your wallet to see your personal dashboard
        </div>
      )}
    </div>
  );
}
