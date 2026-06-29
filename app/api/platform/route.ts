import { NextResponse } from 'next/server';

// Deterministic seeded random (0..1)
function seededRand(seed: number): number {
  let s = seed + 1;
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
  s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
  s = s ^ (s >>> 16);
  return (s >>> 0) / 4294967296;
}

export async function GET() {
  // Base snapshot: 2026-06-29 00:00 UTC
  const BASE_DATE = new Date('2026-06-29T00:00:00Z');
  const BASE_PARTICIPANTS = 28492;
  const PERIOD_MS = 6 * 60 * 60 * 1000; // 6 hours

  const now = new Date();
  const periodsElapsed = Math.max(0, Math.floor((now.getTime() - BASE_DATE.getTime()) / PERIOD_MS));

  // Accumulate participants: each 6h period adds 1–8 new participants
  let participants = BASE_PARTICIPANTS;
  for (let i = 0; i < periodsElapsed; i++) {
    const added = Math.floor(seededRand(i) * 8) + 1;
    participants += added;
  }

  const tvl_eth = participants * 8;                                      // 8 ETH per participant
  const active_validators = Math.floor(participants / 4);               // 4 × 8 = 32 ETH per validator
  const rewards_paid_eth = Math.round(tvl_eth * 0.102 * 90 / 365 * 100) / 100; // 90-day plan APR

  return NextResponse.json({
    tvl_eth,
    participants,
    active_validators,
    rewards_paid_eth,
    updated_at: now.toISOString(),
  });
}
