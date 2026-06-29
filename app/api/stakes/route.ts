import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// GET /api/stakes?wallet=0x...
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet')?.toLowerCase();
  if (!wallet) return NextResponse.json({ error: 'wallet required' }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('stakes')
    .select('*')
    .eq('wallet_address', wallet)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/stakes — создать новый стейк (демо)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { wallet_address, amount_eth, plan_days } = body;

  if (!wallet_address || !amount_eth || !plan_days) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  if (amount_eth < 8) {
    return NextResponse.json({ error: 'Minimum 8 ETH' }, { status: 400 });
  }
  if (![30, 90, 180].includes(plan_days)) {
    return NextResponse.json({ error: 'Plan must be 30, 90, or 180 days' }, { status: 400 });
  }

  const supabase = createServerClient();
  const APY: Record<number, number> = { 30: 8.2, 90: 10.2, 180: 10.9 };
  const apy = APY[plan_days as 30 | 90 | 180];

  // Найдём или создадим пользователя
  const { data: user, error: userErr } = await supabase
    .from('users')
    .upsert({ wallet_address: wallet_address.toLowerCase() }, { onConflict: 'wallet_address' })
    .select()
    .single();

  if (userErr) return NextResponse.json({ error: userErr.message }, { status: 500 });

  const started_at = new Date();
  const ends_at = new Date(started_at.getTime() + plan_days * 86400_000);

  const { data, error } = await supabase
    .from('stakes')
    .insert({
      user_id: user.id,
      wallet_address: wallet_address.toLowerCase(),
      amount_eth,
      plan_days,
      apy,
      status: 'active',
      started_at: started_at.toISOString(),
      ends_at: ends_at.toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
