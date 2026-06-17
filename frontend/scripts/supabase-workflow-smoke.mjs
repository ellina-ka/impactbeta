#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
  || (process.env.REACT_APP_SUPABASE_PROJECT_REF
    ? `https://${process.env.REACT_APP_SUPABASE_PROJECT_REF}.supabase.co`
    : '');
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_PUBLISHABLE_KEY
  || process.env.REACT_APP_SUPABASE_ANON_KEY;
const PASSWORD = process.env.IMPACTBETA_DEMO_PASSWORD || 'Impactbeta2026!';
const RUN_ID = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);

const accounts = {
  student: process.env.IMPACTBETA_STUDENT_EMAIL || 'lina.moreau@sciencespo.fr',
  admin: process.env.IMPACTBETA_ADMIN_EMAIL || 'admin@impactbeta.app',
  ngo: process.env.IMPACTBETA_NGO_EMAIL || 'ngo@impactbeta.app'
};

function fail(message, details) {
  console.error(`❌ ${message}`);
  if (details) console.error(details);
  process.exit(1);
}

function assertEnv() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    fail(
      'Missing Supabase environment. Set REACT_APP_SUPABASE_URL plus REACT_APP_SUPABASE_PUBLISHABLE_KEY, or REACT_APP_SUPABASE_PROJECT_REF plus key.'
    );
  }
}

async function signIn(email) {
  const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
  const { data, error } = await client.auth.signInWithPassword({ email, password: PASSWORD });
  if (error) fail(`Unable to sign in as ${email}`, error.message);
  if (!data.session) fail(`No session returned for ${email}`);
  return client;
}

async function singleOrFail(query, context) {
  const { data, error } = await query.single();
  if (error) fail(context, error.message);
  return data;
}

async function maybeSingleOrFail(query, context) {
  const { data, error } = await query.maybeSingle();
  if (error) fail(context, error.message);
  return data;
}

assertEnv();
console.log(`🔎 Running ImpactBeta Supabase workflow smoke test against ${SUPABASE_URL}`);

const studentClient = await signIn(accounts.student);
const adminClient = await signIn(accounts.admin);
const ngoClient = await signIn(accounts.ngo);

const applicationPayload = {
  student_name: 'Lina Moreau',
  student_email: accounts.student,
  ngo_name: 'La Croix-Rouge française',
  school_name: 'Sciences Po',
  mission_description: `Smoke test mission ${RUN_ID}`,
  start_date: '2026-06-15',
  end_date: '2026-07-15',
  target_hours: 12,
  status: 'pending'
};

const application = await singleOrFail(
  studentClient
    .from('applications')
    .insert([applicationPayload])
    .select('*'),
  'Student could not create application. Check applications insert RLS and the student profile organization.'
);
console.log(`✅ Student created application ${application.id}`);

const adminVisibleApplication = await maybeSingleOrFail(
  adminClient
    .from('applications')
    .select('*')
    .eq('id', application.id),
  'School admin could not read the student application. Check profiles and applications select RLS.'
);
if (!adminVisibleApplication) fail('School admin query returned no application row.');
console.log('✅ School admin can read the application');

const validatedApplication = await singleOrFail(
  adminClient
    .from('applications')
    .update({ status: 'validated' })
    .eq('id', application.id)
    .select('*'),
  'School admin could not validate the application. Check applications update RLS.'
);
if (validatedApplication.status !== 'validated') fail('Application status did not become validated.');
console.log('✅ School admin validated the application');

const conventionPayload = {
  application_id: validatedApplication.id,
  student_name: validatedApplication.student_name,
  student_email: validatedApplication.student_email,
  ngo_name: validatedApplication.ngo_name,
  school_name: validatedApplication.school_name,
  mission_description: validatedApplication.mission_description,
  start_date: validatedApplication.start_date,
  end_date: validatedApplication.end_date,
  target_hours: validatedApplication.target_hours,
  status: 'ready'
};

const convention = await singleOrFail(
  adminClient
    .from('conventions')
    .insert([conventionPayload])
    .select('*'),
  'School admin could not create the convention. Check conventions insert RLS and unique application_id.'
);
console.log(`✅ School admin created convention ${convention.id}`);

const ngoVisibleConvention = await maybeSingleOrFail(
  ngoClient
    .from('conventions')
    .select('*')
    .eq('id', convention.id),
  'NGO admin could not read the convention. Check NGO profile organization and conventions select RLS.'
);
if (!ngoVisibleConvention) fail('NGO admin query returned no convention row.');
console.log('✅ NGO admin can read the convention');

const signedConvention = await singleOrFail(
  ngoClient
    .from('conventions')
    .update({ status: 'signed' })
    .eq('id', convention.id)
    .select('*'),
  'NGO admin could not sign the convention. Check conventions update RLS.'
);
if (signedConvention.status !== 'signed') fail('Convention status did not become signed.');
console.log('✅ NGO admin signed the convention');

const refreshedStudentConvention = await maybeSingleOrFail(
  studentClient
    .from('conventions')
    .select('*')
    .eq('application_id', application.id),
  'Student could not read the signed convention. Check conventions student select RLS.'
);
if (!refreshedStudentConvention || refreshedStudentConvention.status !== 'signed') {
  fail('Student did not see the signed convention after refresh-style read.');
}
console.log('✅ Student can read the signed convention after persistence check');

console.log('🎉 Supabase workflow smoke test passed.');
