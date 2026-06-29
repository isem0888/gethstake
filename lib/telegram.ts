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

export function tgStakeCreated(opts: {
  wallet: string;
  amount: number;
  days: number;
  apr: number;
  endsAt: string;
}): string {
  const { wallet, amount, days, apr, endsAt } = opts;
  const ends = new Date(endsAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const yield_ = (amount * apr / 100 * days / 365).toFixed(4);
  const total  = (amount + parseFloat(yield_)).toFixed(4);

  return (
    `💰 <b>Новая инвестиция!</b>\n\n` +
    `👛 <code>${wallet}</code>\n` +
    `💎 Сумма: <b>${amount} ETH</b>\n` +
    `📅 План: <b>${days} дней</b>\n` +
    `📈 APR: <b>${apr}%</b>\n` +
    `✨ Доход: <b>+${yield_} ETH</b>\n` +
    `🏦 Итого к выводу: <b>${total} ETH</b>\n` +
    `🔒 Окончание лока: ${ends}\n` +
    `⏰ ${now()}`
  );
}
