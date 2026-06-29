import { NextResponse } from 'next/server';

export const revalidate = 30; // кэш 30 секунд

export async function GET() {
  try {
    // Binance — без API ключа, надёжный источник
    const [tickerRes, statsRes] = await Promise.all([
      fetch('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT', { next: { revalidate: 30 } }),
      fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT', { next: { revalidate: 30 } }),
    ]);

    const ticker = await tickerRes.json();
    const stats = await statsRes.json();

    const price = parseFloat(ticker.price);
    const change24h = parseFloat(stats.priceChangePercent);
    const volume24h = parseFloat(stats.quoteVolume); // в USD (USDT)
    const high24h = parseFloat(stats.highPrice);
    const low24h = parseFloat(stats.lowPrice);

    // Market cap через CoinGecko как fallback (Binance не даёт market cap)
    let marketCap = 0;
    try {
      const cgRes = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=true',
        { next: { revalidate: 60 } }
      );
      const cg = await cgRes.json();
      marketCap = cg?.ethereum?.usd_market_cap ?? 0;
    } catch { /* не критично */ }

    return NextResponse.json({ price, change24h, volume24h, marketCap, high24h, low24h });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch ETH price' }, { status: 500 });
  }
}
