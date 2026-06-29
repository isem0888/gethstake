import { NextResponse } from 'next/server';

export const revalidate = 60; // кэш 60 сек

export async function GET() {
  // Сервер-сайд — нет CORS, нет ограничений браузера

  // Источник 1: BlockCypher
  try {
    const res = await fetch('https://api.blockcypher.com/v1/eth/main', {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const d = await res.json();
      if (d.height) {
        return NextResponse.json({
          pendingTx:   Number(d.unconfirmed_count)   || 0,
          highGas:     Math.round((d.high_gas_price   || 0) / 1e9),
          medGas:      Math.round((d.medium_gas_price || 0) / 1e9),
          lowGas:      Math.round((d.low_gas_price    || 0) / 1e9),
          blockHeight: Number(d.height) || 0,
        });
      }
    }
  } catch { /* fallback */ }

  // Источник 2: beaconcha.in gas now
  try {
    const res = await fetch('https://beaconcha.in/api/v1/execution/gasnow', {
      signal: AbortSignal.timeout(8000),
      headers: { Accept: 'application/json' },
    });
    if (res.ok) {
      const d = await res.json();
      const rapid    = Math.round((d.data?.rapid    || 0) / 1e9);
      const fast     = Math.round((d.data?.fast     || 0) / 1e9);
      const standard = Math.round((d.data?.standard || 0) / 1e9);
      const slow     = Math.round((d.data?.slow     || 0) / 1e9);
      if (fast > 0 || standard > 0) {
        return NextResponse.json({
          pendingTx: 0,
          highGas:   rapid    || fast,
          medGas:    fast     || standard,
          lowGas:    standard || slow,
          blockHeight: 0,
        });
      }
    }
  } catch { /* zeros */ }

  return NextResponse.json({
    pendingTx: 0, highGas: 0, medGas: 0, lowGas: 0, blockHeight: 0,
  });
}
