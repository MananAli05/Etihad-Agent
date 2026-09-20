import { createClient } from '@supabase/supabase-js';

const envUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Use Vite proxy in development mode to bypass Windows/Browser HTTP2/HTTP3 QUIC UDP connection resets
const supabaseUrl = (import.meta.env.DEV && typeof window !== 'undefined')
  ? `${window.location.origin}/supabase-api`
  : (envUrl || 'https://gnonqfdyufszdymynftq.supabase.co');

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
