import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Серверный клиент с service role — только в API routes, никогда на клиенте
export function createServerClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
