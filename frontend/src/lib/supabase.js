import { createClient } from '@supabase/supabase-js';

export const USER_ROLES = ['school_admin', 'student', 'ngo_admin'];
export const DEFAULT_ROLE = 'student';

// Required local env vars (Create React App):
// - REACT_APP_SUPABASE_URL, or REACT_APP_SUPABASE_PROJECT_REF
// - REACT_APP_SUPABASE_PUBLISHABLE_KEY, or legacy REACT_APP_SUPABASE_ANON_KEY
//
// Never expose a Supabase secret/service-role key through REACT_APP_* variables:
// Create React App embeds those values in the public browser bundle.
const supabaseProjectRef = process.env.REACT_APP_SUPABASE_PROJECT_REF;
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
  || (supabaseProjectRef ? `https://${supabaseProjectRef}.supabase.co` : '');
const supabasePublishableKey = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY
  || process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;
