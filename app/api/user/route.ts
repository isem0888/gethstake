import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';

// POST /api/user — upsert пользователя по wallet address
export async function POST(req: NextRequest) {
  const { wallet_address } = await req.json();

  if (!wallet_address || !/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
    return NextResponse.json({ error: 'Invalid wallet address' }, { status: 400 });
  }

  const supabase = createServerClient();

  // Upsert — создаём или обновляем last_seen_at
  const { data, error } = await supabase
    .from('users')
    .upsert(
      { wallet_address: wallet_address.toLowerCase(), last_seen_at: new Date().toISOString() },
      { onConflict: 'wallet_address' }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
