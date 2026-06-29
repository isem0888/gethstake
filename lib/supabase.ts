import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Клиентский клиент (anon key) — для публичных данных
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
