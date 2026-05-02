import { createClient } from '@supabase/supabase-js';

// NOTE: In production, use environment variables
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper to handle Supabase errors
export const handleSupabaseError = (error: unknown): never => {
  console.error('Supabase error:', error);
  throw new Error((error as Error)?.message || 'An unexpected error occurred');
};
