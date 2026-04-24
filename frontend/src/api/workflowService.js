import { supabase } from '../lib/supabase';

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

export async function getApplications() {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .order('id', { ascending: false });

  throwIfError(error, 'Failed to fetch applications');
  return (data || []).map(mapApplicationRow);
}

export async function createApplication(payload) {
  const { data, error } = await supabase
    .from('applications')
    .insert([mapApplicationPayloadToInsert(payload)])
    .select('*')
    .single();

  throwIfError(error, 'Failed to create application');
  return mapApplicationRow(data);
}

export async function submitApplication(payload) {
  return createApplication(payload);
}

export async function getConventions() {
  const { data, error } = await supabase
    .from('conventions')
    .select('*')
    .order('id', { ascending: false });

  throwIfError(error, 'Failed to fetch conventions');
  return (data || []).map(mapConventionRow);
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
}

export async function rejectApplication(id) {
  const { data, error } = await supabase
    .from('applications')
    .update({ status: 'rejected' })
    .eq('id', id)
    .select('*')
    .single();

  throwIfError(error, 'Failed to reject application');
  return mapApplicationRow(data);
}
