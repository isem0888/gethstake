import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { sendTg } from '@/lib/telegram';

function now(): string {
  return new Date().toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) + ' МСК';
}

function tgWithdrawRequest(opts: {
  wallet: string;
  amount: number;
  toAddress: string;
  stakeId: string;
  planDays: number;
  early: boolean;
}): string {
  const { wallet, amount, toAddress, stakeId, planDays, early } = opts;
  return (
    `🔴 <b>Запрос на вывод средств!</b>\n\n` +
    `👛 Кошелёк: <code>${wallet}</code>\n` +
    `💸 Сумма: <b>${amount} ETH</b>\n` +
    `📤 Получатель: <code>${toAddress}</code>\n` +
    `📅 План: <b>${planDays}-day lock</b>\n` +
    `⚡️ Ранний вывод: <b>${early ? 'ДА — только тело инвестиции' : 'НЕТ — план завершён'}</b>\n` +
    `🆔 Stake ID: <code>${stakeId}</code>\n` +
    `⏰ ${now()}\n\n` +
    `⏳ Обработка: 1–3 рабочих дня`
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { wallet_address, stake_id, amount_eth, to_address, early } = body;

  if (!wallet_address || !stake_id || !amount_eth || !to_address) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Сохраняем запрос на вывод
  const { data, error } = await supabase
    .from('withdrawals' as any)
    .insert({
      wallet_address: wallet_address.toLowerCase(),
      stake_id,
      amount_eth: Number(amount_eth),
      to_address: to_address.toLowerCase(),
      early: Boolean(early),
      status: 'pending',
      requested_at: new Date().toISOString(),
    } as any)
    .select()
    .single();

  if (error) {
    // Если таблица не существует — всё равно шлём TG
    console.error('[withdraw] DB error:', error.message);
  }

  // Получаем план для уведомления
  const { data: stake } = await supabase
    .from('stakes')
    .select('plan_days')
    .eq('id', stake_id)
    .single();

  // TG уведомление (non-blocking)
  sendTg(tgWithdrawRequest({
    wallet: wallet_address,
    amount: Number(amount_eth),
    toAddress: to_address,
    stakeId: stake_id,
    planDays: stake?.plan_days ?? 0,
    early: Boolean(early),
  })).catch(() => {});

  return NextResponse.json({ ok: true, id: data?.id }, { status: 201 });
}

// GET — история выводов по кошельку
export async function GET(req: NextRequest) {
  const wallet = req.nextUrl.searchParams.get('wallet')?.toLowerCase();
  if (!wallet) return NextResponse.json({ error: 'wallet required' }, { status: 400 });

  const supabase = createServerClient();
  const { data, error } = await supabase
    .from('withdrawals' as any)
    .select('*')
    .eq('wallet_address', wallet)
    .order('requested_at', { ascending: false });

  if (error) return NextResponse.json([]);
  return NextResponse.json(data ?? []);
}
