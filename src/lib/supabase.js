import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const missingCredentials = !supabaseUrl || !supabaseAnonKey;

function createDisabledSupabaseClient() {
  const disabledResult = {
    data: null,
    error: { message: 'Supabase credentials not configured' },
  };

  const client = {
    ...disabledResult,
    isConfigured: false,
    from: () => client,
    select: () => client,
    order: () => client,
    eq: () => client,
    single: () => client,
    update: () => client,
  };

  return client;
}

if (missingCredentials) {
  console.warn('Supabase credentials not found in environment variables. Please check .env.local.');
}

export const supabase = missingCredentials
  ? createDisabledSupabaseClient()
  : Object.assign(createClient(supabaseUrl, supabaseAnonKey), { isConfigured: true });
