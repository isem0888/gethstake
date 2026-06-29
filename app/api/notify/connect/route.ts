import { NextRequest, NextResponse } from 'next/server';
import { sendTg, tgWalletConnected } from '@/lib/telegram';

export async function POST(req: NextRequest) {
  const { wallet } = await req.json().catch(() => ({}));
  if (!wallet || typeof wallet !== 'string') {
    return NextResponse.json({ error: 'wallet required' }, { status: 400 });
  }

  await sendTg(tgWalletConnected(wallet));
  return NextResponse.json({ ok: true });
}
