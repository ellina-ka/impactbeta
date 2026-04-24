import { createClient } from '@supabase/supabase-js';

// Required local env vars (Create React App):
// - REACT_APP_SUPABASE_URL
// - REACT_APP_SUPABASE_ANON_KEY
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Keep error explicit so missing local config is easy to diagnose.
  throw new Error(
    'Missing Supabase env vars: REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
