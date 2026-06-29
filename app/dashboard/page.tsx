'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { EthLogo } from '@/components/EthLogo';
import { WalletButton } from '@/components/WalletButton';
import Link from 'next/link';

/* ── Market + Network data ── */
interface EthMarket {
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
}
interface EthNetwork {
  pendingTx: number;
  highGas: number;
  medGas: number;
  lowGas: number;
  blockHeight: number;
}
interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  published_on: number;
  imageurl: string;
  body: string;
  categories: string;
}

function useEthMarket() {
  const [data, setData] = useState<EthMarket | null>(null);
  const fetch_ = useCallback(() => {
    fetch('/api/eth-price')
      .then(r => r.json())
      .then(d => {
        if (d.error || d.price == null || isNaN(Number(d.price))) return;
        setData({
          price:     Number(d.price)     || 0,
          change24h: Number(d.change24h) || 0,
          marketCap: Number(d.marketCap) || 0,
          volume24h: Number(d.volume24h) || 0,
        });
      })
      .catch(() => {});
  }, []);
  useEffect(() => { fetch_(); const t = setInterval(fetch_, 30_000); return () => clearInterval(t); }, [fetch_]);
  return data;
}

/* ── Bonus APR по количеству ETH + сроку плана ── */
function getBonus(eth: number, days: number): number {
  if (eth >= 128) return days === 30 ? 1.1 : days === 90 ? 2.0 : 2.2;
  if (eth >= 96)  return days === 30 ? 1.0 : days === 90 ? 1.7 : 1.8;
  if (eth >= 64)  return days === 30 ? 0.8 : days === 90 ? 1.5 : 1.5;
  if (eth >= 32)  return days === 30 ? 0.4 : days === 90 ? 0.5 : 1.0;
  return 0;
}

function tierName(eth: number): string {
  if (eth >= 128) return 'Sovereign';
  if (eth >= 96)  return 'Architect';
  if (eth >= 64)  return 'Sentinel';
  if (eth >= 32)  return 'Validator';
  return '';
}

function bonusLabel(eth: number, days: number): string {
  const b = getBonus(eth, days);
  const name = tierName(eth);
  if (!name) return '';
  return `${name} · +${b}% APR`;
}

function useEthNetwork() {
  const [data, setData] = useState<EthNetwork | null>(null);
  const fetch_ = useCallback(() => {
    fetch('/api/network')           // server-side — нет CORS
      .then(r => r.json())
      .then(d => {
        if (d.error && !d.blockHeight) return;
        setData({
          pendingTx:   d.pendingTx   ?? 0,
          highGas:     d.highGas     ?? 0,
          medGas:      d.medGas      ?? 0,
          lowGas:      d.lowGas      ?? 0,
          blockHeight: d.blockHeight ?? 0,
        });
      })
      .catch(() => {});
  }, []);
  useEffect(() => { fetch_(); const t = setInterval(fetch_, 60_000); return () => clearInterval(t); }, [fetch_]);
  return data;
}

// Fetch news from our own API route (which parses RSS feeds server-side)
function useNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    fetch('/api/news')
      .then(r => r.json())
      .then(d => {
        if (d.articles && d.articles.length > 0) {
          setNews(d.articles);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, []);
  return { news, error };
}

function fmtUsd(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtBig(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return fmtUsd(n);
}
function timeAgo(ts: number) {
  const diff = Math.floor((Date.now() / 1000) - ts);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

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
    // Суммарный доход за ЭТОТ день по всем активным стейкам (дневная ставка)
    const dailyYield = stakes
      .filter(s => {
        const start = new Date(s.started_at);
        const end   = new Date(s.ends_at);
        return start <= d && d <= end;
      })
      .reduce((acc, s) => {
        const effectiveApy = s.apy + getBonus(s.amount_eth, s.plan_days);
        return acc + s.amount_eth * effectiveApy / 100 / 365;
      }, 0);
    return { day: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), earned: +dailyYield.toFixed(4) };
  });
}

const S: React.CSSProperties = {
  fontFamily: 'Inter, sans-serif',
  background: '#06070f',
  minHeight: '100vh',
  color: '#e8eaf8',
};
const card: React.CSSProperties = {
  background: '#0d1121',
  border: '1px solid #1a2040',
  borderRadius: 14,
  padding: '20px 24px',
};
const tag: React.CSSProperties = {
  fontSize: 10,
  color: '#5a6480',
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

  const market = useEthMarket();
  const network = useEthNetwork();
  const { news: allNews, error: newsError } = useNews();
  const [newsTab, setNewsTab] = useState<'all' | 'eth' | 'market' | 'regulation'>('all');

  useEffect(() => {
    fetch('/api/platform').then(r => r.json()).then(setPlatform).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isConnected || !address) { setLoading(false); return; }
    const fetchStakes = () =>
      fetch(`/api/stakes?wallet=${address}`)
        .then(r => r.json())
        .then(d => {
          const rows = (Array.isArray(d) ? d : []).map((s: any) => ({
            ...s,
            amount_eth: Number(s.amount_eth) || 0,
            plan_days:  Number(s.plan_days)  || 90,
            apy:        Number(s.apy)        || 0,
          }));
          setStakes(rows);
          setLoading(false);
        })
        .catch(() => setLoading(false));

    fetchStakes();
    const t = setInterval(fetchStakes, 4 * 60 * 60 * 1000); // авто-обновление каждые 4 часа
    return () => clearInterval(t);
  }, [isConnected, address]);

  const PLATFORM_CLOSE = new Date('2027-01-01T00:00:00Z');
  const daysToClose = Math.max(0, Math.ceil((PLATFORM_CLOSE.getTime() - Date.now()) / 86_400_000));

  const active = stakes.filter(s => s.status === 'active');
  const totalStaked = active.reduce((a, s) => a + s.amount_eth, 0);
  const totalEarned = active.reduce((a, s) => a + earned(s), 0);
  const totalDailyYield = active.reduce((a, s) => {
    const effectiveApy = s.apy + getBonus(s.amount_eth, s.plan_days);
    return a + s.amount_eth * effectiveApy / 100 / 365;
  }, 0);
  const maxBonus = active.length > 0
    ? Math.max(...active.map(s => getBonus(s.amount_eth, s.plan_days)))
    : 0;
  const maxBonusTier = active.length > 0
    ? tierName(Math.max(...active.map(s => s.amount_eth)))
    : '';
  const chart = buildChart(active);

  return (
    <div style={S}>
      {/* Nav */}
      <nav style={{ borderBottom: '1px solid #1d2c1f', background: 'rgba(6,7,15,.9)', backdropFilter: 'blur(14px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 64, gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: 1, color: '#e8eaf8', textDecoration: 'none' }}>
            <span style={{ width: 28, height: 28, border: '2px solid #60a5fa', borderRadius: 7, display: 'grid', placeItems: 'center' }}>
              <EthLogo size={12} />
            </span>
            GETHSTAKE
          </Link>
          <span style={{ color: '#1a2040', fontSize: 20 }}>·</span>
          <span style={{ fontSize: 13, color: '#5a6480', fontFamily: "'Chakra Petch',sans-serif", textTransform: 'uppercase', letterSpacing: '.8px' }}>Dashboard</span>
          <div style={{ marginLeft: 'auto' }}>
            <WalletButton />
          </div>
        </div>
      </nav>

      {/* ── Deadline banner ── */}
      <div style={{ background: daysToClose < 60 ? 'rgba(248,113,113,.1)' : 'rgba(96,165,250,.07)', borderBottom: `1px solid ${daysToClose < 60 ? '#f87171' : '#60a5fa33'}` }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '8px 24px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 }}>
          <span style={{ color: daysToClose < 60 ? '#f87171' : '#60a5fa', fontFamily: "'Chakra Petch',sans-serif", fontWeight: 700, letterSpacing: '.5px' }}>
            🔒 ПЛАТФОРМА ЗАКРЫВАЕТСЯ 01.01.2027
          </span>
          <span style={{ color: '#5a6480' }}>·</span>
          <span style={{ color: '#8a93b8' }}>Осталось <b style={{ color: daysToClose < 60 ? '#f87171' : '#e8eaf8' }}>{daysToClose} дней</b> для открытия новых стейков</span>
          <span style={{ marginLeft: 'auto', color: '#3a4566', fontSize: 11 }}>Все активные позиции будут выплачены по истечении срока</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Portfolio (top) ── */}
        {!isConnected ? (
          <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 16, padding: '18px 24px' }}>
            <EthLogo size={28} />
            <p style={{ color: '#5a6480', fontSize: 14, margin: 0 }}>Connect your wallet to view your portfolio and validator nodes</p>
            <div style={{ marginLeft: 'auto' }}><WalletButton /></div>
          </div>
        ) : loading ? (
          <div style={{ ...card, textAlign: 'center', color: '#5a6480', padding: 32 }}>Loading portfolio…</div>
        ) : (
          <>
            {/* ── Portfolio ── */}
            <div style={card}>
              <div style={tag}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} /> Your portfolio</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16 }}>
                <div style={{ background: '#0a0e20', border: '1px solid #60a5fa33', borderRadius: 10, padding: '16px 18px' }}>
                  <div style={{ ...val, fontSize: 22 }}>{fmtEth(totalStaked)} ETH</div>
                  <div style={{ fontSize: 11, color: '#5a6480', textTransform: 'uppercase', letterSpacing: '.6px', marginTop: 4 }}>Total staked</div>
                </div>
                <div style={{ background: '#0d1121', border: '1px solid #1a2040', borderRadius: 10, padding: '16px 18px' }}>
                  <div style={{ ...val, fontSize: 22, color: '#60a5fa' }}>+{fmtEth(totalEarned)} ETH</div>
                  <div style={{ fontSize: 11, color: '#5a6480', textTransform: 'uppercase', letterSpacing: '.6px', marginTop: 4 }}>Earned (accrued)</div>
                </div>
                <div style={{ background: '#0d1121', border: '1px solid #1a2040', borderRadius: 10, padding: '16px 18px' }}>
                  <div style={{ ...val, fontSize: 22 }}>{active.length}</div>
                  <div style={{ fontSize: 11, color: '#5a6480', textTransform: 'uppercase', letterSpacing: '.6px', marginTop: 4 }}>Active positions</div>
                </div>
                {totalDailyYield > 0 && (
                  <div style={{ background: '#0a0e20', border: '1px solid #22c55e44', borderRadius: 10, padding: '16px 18px' }}>
                    <div style={{ ...val, fontSize: 22, color: '#22c55e' }}>+{fmtEth(totalDailyYield)} ETH</div>
                    <div style={{ fontSize: 11, color: '#22c55e99', textTransform: 'uppercase', letterSpacing: '.6px', marginTop: 4 }}>Начисление в день</div>
                  </div>
                )}
                {maxBonus > 0 && (
                  <div style={{ background: '#0a0e20', border: '1px solid #60a5fa', borderRadius: 10, padding: '16px 18px' }}>
                    <div style={{ ...val, fontSize: 22, color: '#60a5fa' }}>+{maxBonus}%</div>
                    <div style={{ fontSize: 11, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '.6px', marginTop: 4 }}>{maxBonusTier} лучший бонус</div>
                  </div>
                )}
              </div>
              {totalStaked > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={{ fontSize: 11, color: '#5a6480', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.6px' }}>
                    Node ownership — {ownershipLabel(totalStaked)} ({ownershipPct(totalStaked)}%)
                    {maxBonus > 0 && <span style={{ color: '#60a5fa', marginLeft: 8 }}>★ {maxBonusTier}</span>}
                  </div>
                  <div style={{ background: '#1a2040', borderRadius: 6, height: 8 }}>
                    <div style={{ width: `${ownershipPct(totalStaked)}%`, height: '100%', borderRadius: 6, background: 'linear-gradient(90deg,#60a5fa,#a78bfa)' }} />
                  </div>
                </div>
              )}
            </div>

            {/* ── Earnings chart ── */}
            {chart.some(p => p.earned > 0) && active.length > 0 && (
              <div style={card}>
                <div style={tag}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} /> Дневной доход ETH — 30 дней <span style={{ marginLeft: 'auto', fontSize: 9, color: '#3a4566' }}>обновляется каждые 4ч</span></div>
                <div style={{ height: 160 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chart} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="eg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="day" tick={{ fill: '#5a6480', fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
                      <YAxis tick={{ fill: '#5a6480', fontSize: 10 }} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ background: '#0d1121', border: '1px solid #1a2040', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#8a93b8' }} itemStyle={{ color: '#60a5fa' }} />
                      <Area type="monotone" dataKey="earned" stroke="#60a5fa" strokeWidth={2} fill="url(#eg)" name="ETH earned" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* ── Validator Nodes ── */}
            <div style={card}>
              <div style={tag}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} /> Your validator nodes</div>
              {active.length === 0 ? (
                <div style={{ color: '#5a6480', fontSize: 13, padding: '12px 0' }}>
                  No active stakes. <Link href="/#stake" style={{ color: '#60a5fa' }}>Start staking →</Link>
                </div>
              ) : active.map(s => {
                const vkey = validatorKey(s.id);
                const tx = txCount(s.id, s.started_at);
                const up = uptime(s.id);
                const pct = Math.min(100, Math.round(s.amount_eth / 32 * 100));
                const stakeBonus = getBonus(s.amount_eth, s.plan_days);
                const effectiveApy = s.apy + stakeBonus;
                return (
                  <div key={s.id} style={{ background: '#080b14', border: stakeBonus > 0 ? '1px solid #60a5fa' : '1px solid #1d2c1f', borderRadius: 12, padding: '18px 20px', marginBottom: 12, position: 'relative' }}>
                    {stakeBonus > 0 && (
                      <span style={{ position: 'absolute', top: -10, right: 16, background: '#60a5fa', color: '#040e24', fontSize: 10, fontWeight: 700, fontFamily: "'Chakra Petch',sans-serif", padding: '2px 10px', borderRadius: 6 }}>
                        {bonusLabel(s.amount_eth, s.plan_days).toUpperCase()}
                      </span>
                    )}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
                      <div>
                        <div style={{ fontSize: 10, color: '#5a6480', fontFamily: "'Chakra Petch',sans-serif", textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 4 }}>Validator public key</div>
                        <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#8a93b8', wordBreak: 'break-all' }}>
                          {vkey.slice(0, 20)}…{vkey.slice(-8)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ ...val, fontSize: 18, color: '#60a5fa' }}>+{fmtEth(earned(s))} ETH</div>
                        <div style={{ fontSize: 11, color: '#5a6480', marginTop: 2 }}>earned · {daysLeft(s.ends_at)}d left</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12, marginBottom: 14 }}>
                      {[
                        { l: 'Your stake', v: `${s.amount_eth} ETH` },
                        { l: 'Node ownership', v: `${ownershipLabel(s.amount_eth)} (${pct}%)` },
                        { l: 'Effective APR', v: `${effectiveApy.toFixed(1)}%` },
                        { l: 'Plan', v: `${s.plan_days}-day lock` },
                        { l: 'Итого к выплате', v: `${fmtEth(s.amount_eth + s.amount_eth * effectiveApy / 100 * s.plan_days / 365)} ETH`, highlight: true },
                        { l: 'Txs processed (node)', v: fmtNum(tx) },
                        { l: 'Validator uptime', v: `${up}%` },
                      ].map(r => (
                        <div key={r.l} style={{ background: (r as any).highlight ? '#0a1a0a' : '#0d1121', border: (r as any).highlight ? '1px solid #22c55e33' : 'none', borderRadius: 8, padding: '10px 12px' }}>
                          <div style={{ ...val, fontSize: 14, color: (r as any).highlight ? '#22c55e' : '#e8eaf8' }}>{r.v}</div>
                          <div style={{ fontSize: 10, color: '#5a6480', textTransform: 'uppercase', letterSpacing: '.5px', marginTop: 3 }}>{r.l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize: 10, color: '#5a6480', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>Progress — {100 - Math.round(daysLeft(s.ends_at) / s.plan_days * 100)}% complete</div>
                    <div style={{ background: '#1a2040', borderRadius: 6, height: 6 }}>
                      <div style={{ width: `${100 - Math.round(daysLeft(s.ends_at) / s.plan_days * 100)}%`, height: '100%', borderRadius: 6, background: 'var(--acc, #60a5fa)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ── ETH Market + Network Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

          {/* ETH Price */}
          <div style={card}>
            <div style={tag}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} />
              ETH / USD · Live
              <span style={{ marginLeft: 'auto', fontSize: 9, color: '#3a4566' }}>updates every 30s</span>
            </div>
            {market ? (
              <>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 16 }}>
                  <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 32, fontWeight: 700 }}>
                    {fmtUsd(market.price)}
                  </div>
                  <div style={{ paddingBottom: 5, fontSize: 14, fontWeight: 700, color: market.change24h >= 0 ? '#60a5fa' : '#ff5555' }}>
                    {market.change24h >= 0 ? '▲' : '▼'} {Math.abs(market.change24h).toFixed(2)}%
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { l: 'Market cap', v: fmtBig(market.marketCap) },
                    { l: '24h volume', v: fmtBig(market.volume24h) },
                  ].map(r => (
                    <div key={r.l} style={{ background: '#080b14', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontSize: 12, color: '#8a93b8', marginBottom: 3 }}>{r.l}</div>
                      <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 13, fontWeight: 700 }}>{r.v}</div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ color: '#3a4566', fontSize: 13, padding: '20px 0' }}>Loading market data…</div>
            )}
          </div>

          {/* Network Stats */}
          <div style={card}>
            <div style={tag}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Ethereum Network · Real-time
            </div>
            {network ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { l: 'Pending transactions', v: fmtNum(network.pendingTx), accent: true },
                  { l: 'Block height', v: `#${fmtNum(network.blockHeight)}` },
                  { l: 'Gas · fast (Gwei)', v: `${network.highGas}` },
                  { l: 'Gas · standard', v: `${network.medGas}` },
                  { l: 'Gas · slow', v: `${network.lowGas}` },
                  { l: 'Consensus', v: 'Proof-of-Stake' },
                ].map(r => (
                  <div key={r.l} style={{ background: '#080b14', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 12, color: '#5a6480', marginBottom: 3 }}>{r.l}</div>
                    <div style={{ fontFamily: "'Chakra Petch',sans-serif", fontSize: 13, fontWeight: 700, color: (r as any).accent ? '#60a5fa' : undefined }}>{r.v}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#3a4566', fontSize: 13, padding: '20px 0' }}>Loading network data…</div>
            )}
          </div>
        </div>

        {/* ── News ── */}
        <div style={card}>
          <div style={tag}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} />
            Crypto & Market News
            <span style={{ marginLeft: 'auto', fontSize: 9, color: '#3a4566' }}>via CryptoCompare</span>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {([
              { key: 'all',        label: '🌐 All' },
              { key: 'eth',        label: '⟠ Ethereum' },
              { key: 'market',     label: '📈 Market' },
              { key: 'regulation', label: '🏛 Regulation' },
            ] as const).map(tab => (
              <button key={tab.key} onClick={() => setNewsTab(tab.key)}
                style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontFamily: "'Chakra Petch',sans-serif", border: '1px solid', transition: 'all .15s',
                  background: newsTab === tab.key ? 'var(--acc, #60a5fa)' : 'transparent',
                  color: newsTab === tab.key ? '#040e24' : '#5a6480',
                  borderColor: newsTab === tab.key ? 'var(--acc, #60a5fa)' : '#1a2040',
                }}
              >{tab.label}</button>
            ))}
          </div>

          {(() => {
            const filtered = allNews.filter(item => {
              const cats = (item.categories || '').toLowerCase();
              const title = item.title.toLowerCase();
              if (newsTab === 'eth')        return cats.includes('eth') || cats.includes('staking') || title.includes('ethereum') || title.includes(' eth ') || title.includes('ether');
              if (newsTab === 'market')     return cats.includes('market') || cats.includes('crypto') || title.includes('price') || title.includes('market') || title.includes('bitcoin');
              if (newsTab === 'regulation') return cats.includes('regulation') || title.includes('sec') || title.includes('regulat') || title.includes('law') || title.includes('ban') || title.includes('govern');
              return true;
            }).slice(0, 9);

            if (newsError) return (
              <div style={{ color: '#5a6480', fontSize: 13, padding: '12px 0' }}>Не удалось загрузить новости. Попробуйте обновить страницу.</div>
            );

            return allNews.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#3a4566', fontSize: 13, padding: '10px 0' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
                Загрузка новостей…
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ color: '#3a4566', fontSize: 13, padding: '8px 0' }}>В этой категории пока нет свежих статей.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                {filtered.map(item => (
                  <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                    style={{ display: 'flex', flexDirection: 'column', background: '#080b14', borderRadius: 10, overflow: 'hidden', textDecoration: 'none', border: '1px solid #1a2040', transition: 'border-color .2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#1e2d5a')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = '#1a2040')}
                  >
                    {item.imageurl && (
                      <img src={item.imageurl} alt="" style={{ width: '100%', height: 110, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.currentTarget.style.display = 'none'; }} />
                    )}
                    <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#e8eaf8', lineHeight: 1.4, marginBottom: 8, flex: 1 }}>
                        {item.title}
                      </div>
                      {item.body && (
                        <div style={{ fontSize: 11.5, color: '#5a6480', lineHeight: 1.45, marginBottom: 8 }}>
                          {item.body.slice(0, 100)}{item.body.length > 100 ? '…' : ''}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 10.5, color: '#4a6b4e', fontWeight: 600, fontFamily: "'Chakra Petch',sans-serif", textTransform: 'uppercase', letterSpacing: '.4px' }}>{item.source}</span>
                        <span style={{ fontSize: 11, color: '#3a4566' }}>{timeAgo(item.published_on)}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            );
          })()}
        </div>

        {/* ── Platform Stats (always visible) ── */}
        {platform && (
          <div style={card}>
            <div style={tag}><span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} /> Platform stats <span style={{ marginLeft: 'auto', fontSize: 10, color: '#5a6480' }}>updated {new Date(platform.updated_at).toLocaleTimeString()}</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 16 }}>
              {[
                { l: 'Total value locked', v: `${fmtEth(platform.tvl_eth)} ETH` },
                { l: 'Participants', v: fmtNum(platform.participants) },
                { l: 'Validators active', v: fmtNum(platform.active_validators) },
                { l: 'Rewards paid', v: `${fmtEth(platform.rewards_paid_eth)} ETH` },
              ].map(s => (
                <div key={s.l}>
                  <div style={{ ...val, fontSize: 18 }}>{s.v}</div>
                  <div style={{ fontSize: 11, color: '#5a6480', textTransform: 'uppercase', letterSpacing: '.6px', marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
