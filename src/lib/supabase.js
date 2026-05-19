import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials not found in environment variables. Please check .env.local.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
