/**
 * Telegram notification utility
 * Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local and Vercel env vars
 */

const TOKEN   = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTg(text: string): Promise<void> {
  if (!TOKEN || !CHAT_ID) {
    console.warn('[Telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set');
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: 'HTML' }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (e) {
    console.error('[Telegram] Failed to send message:', e);
  }
}

function now(): string {
  return new Date().toLocaleString('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }) + ' МСК';
}

export function tgWalletConnected(wallet: string): string {
  return (
    `🔌 <b>Новый кошелёк подключился</b>\n\n` +
    `👛 <code>${wallet}</code>\n` +
    `⏰ ${now()}`
  );
}

function getBonus(eth: number, days: number): number {
  if (eth >= 128) return days === 30 ? 1.1 : days === 90 ? 2.0 : 2.2;
  if (eth >= 96)  return days === 30 ? 1.0 : days === 90 ? 1.7 : 1.8;
  if (eth >= 64)  return days === 30 ? 0.8 : days === 90 ? 1.5 : 1.5;
  if (eth >= 32)  return days === 30 ? 0.4 : days === 90 ? 0.5 : 1.0;
  return 0;
}

export function tgStakeCreated(opts: {
  wallet: string;
  amount: number;
  days: number;
  apr: number;
  endsAt: string;
}): string {
  const { wallet, amount, days, apr, endsAt } = opts;
  const bonus = getBonus(amount, days);
  const effectiveApr = apr + bonus;
  const ends = new Date(endsAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const yield_ = (amount * effectiveApr / 100 * days / 365).toFixed(4);
  const total  = (amount + parseFloat(yield_)).toFixed(4);

  return (
    `💰 <b>Новая инвестиция!</b>\n\n` +
    `👛 <code>${wallet}</code>\n` +
    `💎 Сумма: <b>${amount} ETH</b>\n` +
    `📅 План: <b>${days} дней</b>\n` +
    `📈 APR: <b>${effectiveApr.toFixed(1)}%</b>${bonus > 0 ? ` (база ${apr}% + бонус ${bonus}%)` : ''}\n` +
    `✨ Доход: <b>+${yield_} ETH</b>\n` +
    `🏦 Итого к выводу: <b>${total} ETH</b>\n` +
    `🔒 Окончание лока: ${ends}\n` +
    `⏰ ${now()}`
  );
}
