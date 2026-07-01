import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { sendTg, tgStakeCreated } from '@/lib/telegram';

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

// POST /api/stakes — создать новый стейк
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { wallet_address, amount_eth, plan_days } = body;

  if (!wallet_address || !amount_eth || !plan_days) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  if (amount_eth < 0.01) {
    return NextResponse.json({ error: 'Minimum 0.01 ETH' }, { status: 400 });
  }
  if (![30, 90, 180].includes(plan_days)) {
    return NextResponse.json({ error: 'Plan must be 30, 90, or 180 days' }, { status: 400 });
  }

  // Проверка дедлайна платформы
  const PLATFORM_CLOSE = new Date('2027-01-01T00:00:00Z');
  const nowTs = new Date();
  if (nowTs >= PLATFORM_CLOSE) {
    return NextResponse.json({ error: 'Платформа закрыта для новых стейков с 01.01.2027' }, { status: 403 });
  }
  const projectedEnd = new Date(nowTs.getTime() + plan_days * 86_400_000);
  if (projectedEnd > PLATFORM_CLOSE) {
    return NextResponse.json({
      error: `План ${plan_days}д выходит за дату закрытия 01.01.2027. Выберите меньший срок.`,
    }, { status: 400 });
  }

  const supabase = createServerClient();
  const APY: Record<number, number> = { 30: 5.5, 90: 8.3, 180: 9.7 };
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

  // 🔔 Telegram уведомление о новом стейке — await обязателен в Vercel serverless
  await sendTg(tgStakeCreated({
    wallet: wallet_address,
    amount: amount_eth,
    days: plan_days,
    apr: apy,
    endsAt: ends_at.toISOString(),
  }));

  return NextResponse.json(data, { status: 201 });
}
