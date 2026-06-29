import { NextResponse } from 'next/server';

export const revalidate = 30; // кэш 30 сек

export async function GET() {
  let price = NaN, change24h = 0, volume24h = 0;

  // ── Источник 1: Kraken (надёжный, без ключа, без rate-limit) ──────────
  try {
    const res = await fetch('https://api.kraken.com/0/public/Ticker?pair=ETHUSD', {
      signal: AbortSignal.timeout(6000),
      next: { revalidate: 30 },
    });
    if (res.ok) {
      const d = await res.json();
      if (!d.error?.length) {
        const t = d.result?.XETHZUSD;
        price = parseFloat(t?.c?.[0]);          // last trade price
        const openPrice = parseFloat(t?.o);      // 24h open
        change24h = (!isNaN(openPrice) && openPrice > 0)
          ? ((price - openPrice) / openPrice) * 100
          : 0;
        const ethVol = parseFloat(t?.v?.[1]);   // 24h ETH volume
        volume24h = (!isNaN(ethVol) ? ethVol : 0) * price;
      }
    }
  } catch { /* try Binance */ }

  // ── Источник 2: Binance (fallback) ────────────────────────────────────
  if (isNaN(price)) {
    try {
      const [tickerRes, statsRes] = await Promise.all([
        fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT', {
          signal: AbortSignal.timeout(6000), next: { revalidate: 30 },
        }),
        fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT', {
          signal: AbortSignal.timeout(6000), next: { revalidate: 30 },
        }),
      ]);
      const ticker = await tickerRes.json();
      const stats  = await statsRes.json();
      price     = parseFloat(ticker.price);
      change24h = parseFloat(stats.priceChangePercent) || 0;
      volume24h = parseFloat(stats.quoteVolume)         || 0;
    } catch { /* try Coinbase */ }
  }

  // ── Источник 3: Coinbase (last fallback) ──────────────────────────────
  if (isNaN(price)) {
    try {
      const res = await fetch('https://api.coinbase.com/v2/prices/ETH-USD/spot', {
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        const d = await res.json();
        price = parseFloat(d.data?.amount);
        change24h = 0;
        volume24h = 0;
      }
    } catch { /* all sources failed */ }
  }

  // Все источники недоступны — NaN нельзя сериализовать в JSON (даст null)
  if (isNaN(price)) {
    return NextResponse.json({ error: 'ETH price unavailable from all sources' }, { status: 503 });
  }

  // ── Market cap: CoinGecko (некритично) ───────────────────────────────
  let marketCap = 0;
  try {
    const cgRes = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=true',
      { signal: AbortSignal.timeout(5000), next: { revalidate: 120 } }
    );
    if (cgRes.ok) {
      const cg = await cgRes.json();
      marketCap = cg?.ethereum?.usd_market_cap ?? 0;
    }
  } catch { /* не критично */ }

  return NextResponse.json({
    price:     Math.round(price * 100) / 100,
    change24h: Math.round(change24h * 100) / 100,
    volume24h: Math.round(volume24h),
    marketCap: Math.round(marketCap),
  });
}
