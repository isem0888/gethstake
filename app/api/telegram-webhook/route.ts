import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { answerCallback, editTgMessage } from '@/lib/telegram';

function now(): string {
  return new Date().toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) + ' МСК';
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // Handle inline button callback
    if (update.callback_query) {
      const cb = update.callback_query;
      const data: string = cb.data || '';

      if (data.startsWith('paid:')) {
        const withdrawalId = data.replace('paid:', '');
        const supabase = createServerClient();

        // Update withdrawal status to completed
        const { data: w, error } = await supabase
          .from('withdrawals' as any)
          .update({ status: 'completed', processed_at: new Date().toISOString() } as any)
          .eq('id', withdrawalId)
          .select()
          .single();

        if (error) {
          await answerCallback(cb.id, '❌ Ошибка обновления');
          return NextResponse.json({ ok: false });
        }

        const withdrawal = w as any;

        // Answer callback — removes loading spinner on button
        await answerCallback(cb.id, '✅ Статус обновлён — средства выплачены');

        // Edit original message — remove button, add done status
        const newText =
          `✅ <b>Вывод выполнен!</b>\n\n` +
          `👛 Кошелёк: <code>${withdrawal.wallet_address}</code>\n` +
          `💸 Сумма: <b>${withdrawal.amount_eth} ETH</b>\n` +
          `📤 Отправлено на: <code>${withdrawal.to_address}</code>\n` +
          `⏰ Выплачено: ${now()}`;

        await editTgMessage(
          cb.message.chat.id,
          cb.message.message_id,
          newText
        );
      }
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('[telegram-webhook]', e);
    return NextResponse.json({ ok: false });
  }
}

// Telegram шлёт GET для проверки
export async function GET() {
  return NextResponse.json({ ok: true, service: 'gethstake-tg-webhook' });
}
