import { supabase, isSupabaseConfigured } from '../lib/supabase';
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

function getLocalApplications() {
  return clone(localStore.applications).sort((a, b) => String(b.id).localeCompare(String(a.id)));
}

function getLocalConventions() {
  return clone(localStore.conventions).sort((a, b) => String(b.id).localeCompare(String(a.id)));
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

export async function getApplications() {
  if (!isSupabaseConfigured) return getLocalApplications();

  try {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('id', { ascending: false });

    throwIfError(error, 'Failed to fetch applications');
    return (data || []).map(mapApplicationRow);
  } catch (error) {
    warnAndFallback('Failed to fetch applications', error);
    return getLocalApplications();
  }
}

export async function createApplication(payload) {
  if (!isSupabaseConfigured) return createLocalApplication(payload);

  try {
    const { data, error } = await supabase
      .from('applications')
      .insert([mapApplicationPayloadToInsert(payload)])
      .select('*')
      .single();

    throwIfError(error, 'Failed to create application');
    return mapApplicationRow(data);
  } catch (error) {
    warnAndFallback('Failed to create application', error);
    return createLocalApplication(payload);
  }
}

export async function submitApplication(payload) {
  return createApplication(payload);
}

export async function getConventions() {
  if (!isSupabaseConfigured) return getLocalConventions();

  try {
    const { data, error } = await supabase
      .from('conventions')
      .select('*')
      .order('id', { ascending: false });

    throwIfError(error, 'Failed to fetch conventions');
    return (data || []).map(mapConventionRow);
  } catch (error) {
    warnAndFallback('Failed to fetch conventions', error);
    return getLocalConventions();
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

export async function validateApplication(id) {
  if (!isSupabaseConfigured) return validateLocalApplication(id);

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

export async function rejectApplication(id) {
  if (!isSupabaseConfigured) return rejectLocalApplication(id);

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
