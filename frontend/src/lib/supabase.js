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

export const isDemoBuild = process.env.REACT_APP_DEMO_MODE === 'true';

export function normalizeRole(role) {
  return USER_ROLES.includes(role) ? role : DEFAULT_ROLE;
}

export function createDemoProfile(role = DEFAULT_ROLE) {
  const normalizedRole = normalizeRole(role);
  return DEMO_PROFILES_BY_ROLE[normalizedRole];
}

const DEMO_PROFILES_BY_ROLE = {
  school_admin: {
    id: 'demo-school-admin',
    email: 'admin@impactbeta.app',
    fullName: 'Camille Laurent',
    role: 'school_admin',
    organizationName: 'Sciences Po'
  },
  student: {
    id: 'demo-student',
    email: 'lina.moreau@sciencespo.fr',
    fullName: 'Lina Moreau',
    role: 'student',
    organizationName: 'Sciences Po'
  },
  ngo_admin: {
    id: 'demo-ngo-admin',
    email: 'ngo@impactbeta.app',
    fullName: 'Sofia Rahmani',
    role: 'ngo_admin',
    organizationName: 'Croix-Rouge'
  }
};

const DEMO_PROFILES_BY_EMAIL = Object.values(DEMO_PROFILES_BY_ROLE).reduce((lookup, profile) => {
  lookup[profile.email] = profile;
  return lookup;
}, {});

function ensureSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured for this build.');
  }
}

function mapProfile(row, user) {
  const demoProfile = DEMO_PROFILES_BY_EMAIL[user?.email];
  return {
    id: row?.id || user?.id,
    email: row?.email || user?.email || '',
    fullName: row?.full_name || demoProfile?.fullName || user?.user_metadata?.full_name || user?.email || 'ImpactBeta user',
    role: normalizeRole(row?.role || demoProfile?.role || user?.user_metadata?.role),
    organizationName: row?.organization_name || demoProfile?.organizationName || user?.user_metadata?.organization_name || ''
  };
}

function buildProfilePayload(user, overrides = {}) {
  const demoProfile = DEMO_PROFILES_BY_EMAIL[user?.email];
  return {
    id: user.id,
    email: user.email,
    full_name: overrides.fullName || demoProfile?.fullName || user.user_metadata?.full_name || user.email,
    role: normalizeRole(overrides.role || demoProfile?.role || user.user_metadata?.role),
    organization_name: overrides.organizationName || demoProfile?.organizationName || user.user_metadata?.organization_name || ''
  };
}

export async function getCurrentSession() {
  ensureSupabase();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return {
    session: data.session,
    user: data.session?.user || null
  };
}

export async function getUserProfile(user) {
  ensureSupabase();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;

  const demoProfile = DEMO_PROFILES_BY_EMAIL[user.email];

  if (data && (!demoProfile || data.role === demoProfile.role)) {
    return mapProfile(data, user);
  }

  const fallbackProfile = buildProfilePayload(user);

  const { data: created, error: createError } = await supabase
    .from('profiles')
    .upsert(fallbackProfile, { onConflict: 'id' })
    .select('*')
    .single();

  if (createError) throw createError;
  return mapProfile(created, user);
}

export async function signInWithPassword({ email, password }) {
  ensureSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithPassword({ email, password, fullName, role, organizationName }) {
  ensureSupabase();
  const normalizedRole = normalizeRole(role);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: normalizedRole,
        organization_name: organizationName || ''
      }
    }
  });

  if (error) throw error;

  if (data.user) {
    const profilePayload = buildProfilePayload(data.user, {
      fullName,
      role: normalizedRole,
      organizationName
    });

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });

    if (profileError) throw profileError;
  }

  return {
    user: data.user,
    session: data.session
  };
}

export async function signOut() {
  ensureSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export function onAuthStateChange(callback) {
  if (!supabase) {
    return { unsubscribe: () => {} };
  }

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });

  return data.subscription;
}
