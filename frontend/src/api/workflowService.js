import { supabase, isDemoBuild, isSupabaseConfigured } from '../lib/supabase';
import { initialApplications, initialConventions } from '../data/workflowMockData';

const clone = (value) => JSON.parse(JSON.stringify(value));
const localStore = {
  applications: clone(initialApplications),
  conventions: clone(initialConventions)
};

// Demo deploys should keep working even if Supabase env vars exist but the
// backing tables/policies are not ready yet. Set REACT_APP_DEMO_FALLBACK=false
// when you want Supabase errors to fail hard during production integration.
const DEMO_FALLBACK = process.env.REACT_APP_DEMO_FALLBACK !== 'false';

const normalizeHours = (value) => Number(value || 0);

function mapApplicationRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    ngoName: row.ngo_name,
    schoolName: row.school_name,
    missionDescription: row.mission_description,
    startDate: row.start_date,
    endDate: row.end_date,
    targetHours: normalizeHours(row.target_hours),
    status: row.status
  };
}

function mapConventionRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    applicationId: row.application_id,
    studentName: row.student_name,
    studentEmail: row.student_email,
    ngoName: row.ngo_name,
    schoolName: row.school_name,
    missionDescription: row.mission_description,
    startDate: row.start_date,
    endDate: row.end_date,
    targetHours: normalizeHours(row.target_hours),
    status: row.status
  };
}

function mapApplicationPayloadToInsert(payload) {
  return {
    student_name: payload.studentName,
    student_email: payload.studentEmail,
    ngo_name: payload.ngoName,
    school_name: payload.schoolName || payload.profile?.organizationName || 'Sciences Po',
    mission_description: payload.missionDescription,
    start_date: payload.startDate,
    end_date: payload.endDate,
    target_hours: normalizeHours(payload.targetHours),
    status: payload.status || 'pending'
  };
}

function mapApplicationToConventionInsert(application) {
  return {
    application_id: application.id,
    student_name: application.studentName,
    student_email: application.studentEmail,
    ngo_name: application.ngoName,
    school_name: application.schoolName || 'Sciences Po',
    mission_description: application.missionDescription,
    start_date: application.startDate,
    end_date: application.endDate,
    target_hours: normalizeHours(application.targetHours),
    status: 'ready'
  };
}

function throwIfError(error, context) {
  if (error) throw new Error(`${context}: ${error.message}`);
}

function warnAndFallback(context, error) {
  if (!DEMO_FALLBACK) throw error;
  // eslint-disable-next-line no-console
  console.warn(`${context}; using local demo workflow data instead.`, error);
}

function shouldUseDemoDisplayData(profile, rows) {
  return DEMO_FALLBACK && profile?.email && rows.length === 0;
}

function filterByProfile(items, profile) {
  if (!profile || profile.role === 'school_admin') return items;

  if (profile.role === 'student') {
    return items.filter((item) => item.studentEmail === profile.email);
  }

  if (profile.role === 'ngo_admin') {
    const organization = profile.organizationName?.toLowerCase();
    if (!organization) return [];
    return items.filter((item) => item.ngoName.toLowerCase().includes(organization));
  }

  return [];
}

function applyProfileFilters(query, profile) {
  if (!profile || profile.role === 'school_admin') return query;
  if (profile.role === 'student') return query.eq('student_email', profile.email);
  if (profile.role === 'ngo_admin' && profile.organizationName) {
    return query.ilike('ngo_name', `%${profile.organizationName}%`);
  }
  return query.eq('id', '__forbidden__');
}

function getLocalApplications(profile) {
  return filterByProfile(clone(localStore.applications), profile)
    .sort((a, b) => String(b.id).localeCompare(String(a.id)));
}

function getLocalConventions(profile) {
  return filterByProfile(clone(localStore.conventions), profile)
    .sort((a, b) => String(b.id).localeCompare(String(a.id)));
}

function createLocalApplication(payload) {
  const created = {
    ...payload,
    id: `app-${Date.now()}`,
    status: payload.status || 'pending',
    targetHours: normalizeHours(payload.targetHours)
  };
  localStore.applications.unshift(created);
  return clone(created);
}

function validateLocalApplication(id) {
  const application = localStore.applications.find((item) => String(item.id) === String(id));
  if (!application) throw new Error('Failed to validate application: not found');

  application.status = 'validated';
  const existingConvention = localStore.conventions.find(
    (item) => String(item.applicationId) === String(id)
  );

  if (!existingConvention) {
    localStore.conventions.unshift({
      id: `conv-${Date.now()}`,
      applicationId: application.id,
      studentName: application.studentName,
      studentEmail: application.studentEmail,
      ngoName: application.ngoName,
      missionDescription: application.missionDescription,
      startDate: application.startDate,
      endDate: application.endDate,
      targetHours: normalizeHours(application.targetHours),
      status: 'ready'
    });
  }

  return clone(application);
}

function rejectLocalApplication(id) {
  const application = localStore.applications.find((item) => String(item.id) === String(id));
  if (!application) throw new Error('Failed to reject application: not found');
  application.status = 'rejected';
  return clone(application);
}

function signLocalConvention(id) {
  const convention = localStore.conventions.find((item) => String(item.id) === String(id));
  if (!convention) throw new Error('Failed to sign convention: not found');
  convention.status = 'signed';
  return clone(convention);
}

export async function getApplications(profile) {
  if (!isSupabaseConfigured || isDemoBuild) return getLocalApplications(profile);

  try {
    const query = supabase
      .from('applications')
      .select('*')
      .order('id', { ascending: false });
    const { data, error } = await applyProfileFilters(query, profile);

    throwIfError(error, 'Failed to fetch applications');
    const rows = (data || []).map(mapApplicationRow);
    return shouldUseDemoDisplayData(profile, rows) ? getLocalApplications(profile) : rows;
  } catch (error) {
    warnAndFallback('Failed to fetch applications', error);
    return getLocalApplications(profile);
  }
}

export async function createApplication(payload, profile) {
  if (profile?.role && profile.role !== 'student') {
    throw new Error('Only students can submit applications.');
  }

  if (!isSupabaseConfigured || isDemoBuild) return createLocalApplication(payload);

  try {
    const { data, error } = await supabase
      .from('applications')
      .insert([mapApplicationPayloadToInsert({ ...payload, profile })])
      .select('*')
      .single();

    throwIfError(error, 'Failed to create application');
    return mapApplicationRow(data);
  } catch (error) {
    warnAndFallback('Failed to create application', error);
    return createLocalApplication(payload);
  }
}

export async function submitApplication(payload, profile) {
  return createApplication(payload, profile);
}

export async function getConventions(profile) {
  if (!isSupabaseConfigured || isDemoBuild) return getLocalConventions(profile);

  try {
    const query = supabase
      .from('conventions')
      .select('*')
      .order('id', { ascending: false });
    const { data, error } = await applyProfileFilters(query, profile);

    throwIfError(error, 'Failed to fetch conventions');
    const rows = (data || []).map(mapConventionRow);
    return shouldUseDemoDisplayData(profile, rows) ? getLocalConventions(profile) : rows;
  } catch (error) {
    warnAndFallback('Failed to fetch conventions', error);
    return getLocalConventions(profile);
  }
}

export async function createConventionFromApplication(application) {
  const insertPayload = mapApplicationToConventionInsert(application);

  const { data, error } = await supabase
    .from('conventions')
    .insert([insertPayload])
    .select('*')
    .single();

  throwIfError(error, 'Failed to create convention');
  return mapConventionRow(data);
}

export async function validateApplication(id, profile) {
  if (profile?.role !== 'school_admin') throw new Error('Only school administrators can validate requests.');
  if (!isSupabaseConfigured || isDemoBuild) return validateLocalApplication(id);

  try {
    const { data: updatedRow, error: updateError } = await supabase
      .from('applications')
      .update({ status: 'validated' })
      .eq('id', id)
      .select('*')
      .single();

    throwIfError(updateError, 'Failed to validate application');
    const application = mapApplicationRow(updatedRow);

    const { data: existingConvention, error: existingError } = await supabase
      .from('conventions')
      .select('id')
      .eq('application_id', id)
      .maybeSingle();

    throwIfError(existingError, 'Failed to check existing convention');

    if (!existingConvention) {
      await createConventionFromApplication(application);
    }

    return application;
  } catch (error) {
    warnAndFallback('Failed to validate application', error);
    return validateLocalApplication(id);
  }
}

export async function rejectApplication(id, profile) {
  if (profile?.role !== 'school_admin') throw new Error('Only school administrators can reject requests.');
  if (!isSupabaseConfigured || isDemoBuild) return rejectLocalApplication(id);

  try {
    const { data, error } = await supabase
      .from('applications')
      .update({ status: 'rejected' })
      .eq('id', id)
      .select('*')
      .single();

    throwIfError(error, 'Failed to reject application');
    return mapApplicationRow(data);
  } catch (error) {
    warnAndFallback('Failed to reject application', error);
    return rejectLocalApplication(id);
  }
}

export async function signConvention(id, profile) {
  if (profile?.role !== 'ngo_admin' && profile?.role !== 'school_admin') {
    throw new Error('Only NGO or school administrators can sign conventions.');
  }

  if (!isSupabaseConfigured || isDemoBuild) return signLocalConvention(id);

  try {
    const { data, error } = await supabase
      .from('conventions')
      .update({ status: 'signed' })
      .eq('id', id)
      .select('*')
      .single();

    throwIfError(error, 'Failed to sign convention');
    return mapConventionRow(data);
  } catch (error) {
    warnAndFallback('Failed to sign convention', error);
    try {
      return signLocalConvention(id);
    } catch (_localError) {
      return { id, status: 'signed', localOnly: true };
    }
  }
}
