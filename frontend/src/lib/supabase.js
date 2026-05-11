import { createClient } from '@supabase/supabase-js';

export const USER_ROLES = ['school_admin', 'student', 'ngo_admin'];
export const DEFAULT_ROLE = 'student';

// Required local env vars (Create React App):
// - REACT_APP_SUPABASE_URL
// - REACT_APP_SUPABASE_ANON_KEY
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const isDemoBuild = process.env.REACT_APP_DEMO_MODE === 'true'
  || (process.env.NODE_ENV !== 'production' && !isSupabaseConfigured);

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;

export function normalizeRole(role) {
  return USER_ROLES.includes(role) ? role : DEFAULT_ROLE;
}

function getDisplayName(user) {
  return user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
}

function mapProfile(row, user) {
  const role = normalizeRole(row?.role || user?.user_metadata?.role);
  return {
    id: row?.id || user?.id || 'demo-user',
    email: row?.email || user?.email || '',
    fullName: row?.full_name || getDisplayName(user),
    role,
    organizationName: row?.organization_name || user?.user_metadata?.organization_name || ''
  };
}

export function createDemoProfile(role = DEFAULT_ROLE) {
  const normalizedRole = normalizeRole(role);
  const demoProfiles = {
    school_admin: {
      id: 'demo-school-admin',
      email: 'admin@sciencespo.fr',
      fullName: 'Demo School Admin',
      role: 'school_admin',
      organizationName: 'Sciences Po'
    },
    student: {
      id: 'demo-student',
      email: 'thomas.martin@sciencespo.fr',
      fullName: 'Thomas Martin',
      role: 'student',
      organizationName: 'Sciences Po'
    },
    ngo_admin: {
      id: 'demo-ngo-admin',
      email: 'ngo@croix-rouge.fr',
      fullName: 'Demo NGO Admin',
      role: 'ngo_admin',
      organizationName: 'La Croix-Rouge française'
    }
  };

  return demoProfiles[normalizedRole];
}

export async function getCurrentSession() {
  if (!supabase) return { session: null, user: null };
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return { session: data.session, user: data.session?.user || null };
}

export function onAuthStateChange(callback) {
  if (!supabase) return { unsubscribe: () => {} };
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null, session);
  });
  return data.subscription;
}

export async function getUserProfile(user) {
  if (!supabase || !user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, organization_name')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw new Error(`Failed to load user profile: ${error.message}`);

  if (data) return mapProfile(data, user);

  const profile = mapProfile(null, user);
  const { data: inserted, error: insertError } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      full_name: profile.fullName,
      role: profile.role,
      organization_name: profile.organizationName
    })
    .select('id, email, full_name, role, organization_name')
    .single();

  if (insertError) throw new Error(`Failed to create user profile: ${insertError.message}`);
  return mapProfile(inserted, user);
}

export async function signInWithPassword({ email, password }) {
  if (!supabase) throw new Error('Supabase is not configured for login.');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithPassword({ email, password, fullName, role, organizationName }) {
  if (!supabase) throw new Error('Supabase is not configured for sign up.');
  const normalizedRole = normalizeRole(role);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: normalizedRole,
        organization_name: organizationName
      }
    }
  });

  if (error) throw error;

  if (data.user) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name: fullName,
      role: normalizedRole,
      organization_name: organizationName
    });
  }

  return data;
}

export async function signOut() {
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
