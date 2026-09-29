import type { SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as
  | string
  | undefined;

const supabaseAnonKey = import.meta.env
  .VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey
);

export const supabase: SupabaseClient | null =
  isSupabaseConfigured
    ? ({
        // The actual client is intentionally not created here
        // until Supabase credentials are configured.
      } as SupabaseClient)
    : null;