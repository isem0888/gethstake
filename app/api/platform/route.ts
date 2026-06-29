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

  const tvl_eth = participants * 8;                              // 8 ETH per participant
  const active_validators = Math.floor(participants / 4);       // 4 × 8 = 32 ETH per validator

  // Platform genesis: 18 months before base date.
  // Rewards accumulate since genesis. Average TVL ≈ 55% of current (gradual growth).
  const GENESIS = new Date('2025-01-01T00:00:00Z');
  const daysOperating = (now.getTime() - GENESIS.getTime()) / 86_400_000;
  const avgTvl = tvl_eth * 0.55;
  const rewards_paid_eth = Math.round(avgTvl * 0.102 * daysOperating / 365 * 100) / 100;

  return NextResponse.json({
    tvl_eth,
    participants,
    active_validators,
    rewards_paid_eth,
    updated_at: now.toISOString(),
  });
}
