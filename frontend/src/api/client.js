import mockData from '../data/mockData';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';
const STATIC_MODE = process.env.REACT_APP_STATIC_MODE === 'true';

const clone = (value) => JSON.parse(JSON.stringify(value));
const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const db = {
  settings: clone(mockData.settings),
  terms: clone(mockData.terms),
  kpisByTerm: clone(mockData.kpisByTerm),
  programsByTerm: clone(mockData.programsByTerm),
  studentsByTerm: clone(mockData.studentsByTerm),
  serviceLogsByTerm: clone(mockData.serviceLogsByTerm),
  verificationRequestsByTerm: clone(mockData.verificationRequestsByTerm),
};

async function fetchJson(path, options) {
  const response = await fetch(`${API_URL}${path}`, options);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

function getTermHours(termId) {
  return db.terms.find((term) => term.term_id === termId)?.required_hours || 20;
}

function updateStudentProgressForTerm(termId) {
  const requiredHours = getTermHours(termId);
  const students = db.studentsByTerm[termId] || [];
  const logs = db.serviceLogsByTerm[termId] || [];

  students.forEach((student) => {
    const verifiedHours = logs
      .filter((log) => log.student_id === student.student_id && log.status === 'confirmed')
      .reduce((sum, log) => sum + Number(log.hours || 0), 0);

    student.verified_hours = verifiedHours;
    student.required_hours = requiredHours;
    student.progress = requiredHours > 0 ? Math.round((verifiedHours / requiredHours) * 100) : 0;

    if (student.progress >= 50) {
      student.risk_status = 'on_track';
      student.risk_score = student.progress >= 75 ? 0 : 1;
    } else if (student.progress >= 25) {
      student.risk_status = 'needs_attention';
      student.risk_score = 2;
    } else {
      student.risk_status = 'at_risk';
      student.risk_score = 3;
    }
  });

  const totalVerifiedHours = students.reduce((sum, student) => sum + Number(student.verified_hours || 0), 0);
  db.kpisByTerm[termId] = {
    verified_hours: { value: totalVerifiedHours, delta: 'Demo data' },
    active_students: { value: students.length, delta: 'Demo data' },
    active_programs: { value: (db.programsByTerm[termId] || []).length, delta: 'Demo data' },
    retention_rate: {
      value: students.length ? Math.round((students.filter((student) => student.progress >= 50).length / students.length) * 100) : 0,
      delta: 'Demo data'
    }
  };
}

function buildStudentDetail(studentId, termId) {
  const students = db.studentsByTerm[termId] || [];
  const student = students.find((item) => item.student_id === studentId);
  if (!student) return null;

  const logs = (db.serviceLogsByTerm[termId] || [])
    .filter((log) => log.student_id === studentId)
    .map((log) => ({ ...log }));

  const pendingHours = logs
    .filter((log) => log.status === 'pending')
    .reduce((sum, log) => sum + Number(log.hours || 0), 0);

  return {
    ...student,
    logs,
    pending_hours: pendingHours,
  };
}

function getRequestById(requestId) {
  for (const termId of Object.keys(db.verificationRequestsByTerm)) {
    const index = (db.verificationRequestsByTerm[termId] || []).findIndex((request) => request.request_id === requestId);
    if (index >= 0) {
      return { termId, index, request: db.verificationRequestsByTerm[termId][index] };
    }
  }
  return null;
}

export async function getTerms() {
  if (!STATIC_MODE) return fetchJson('/api/terms');
  await delay();
  return clone(db.terms);
}

export async function getSettings() {
  if (!STATIC_MODE) return fetchJson('/api/settings');
  await delay();
  return clone(db.settings);
}

export async function getKpis(termId) {
  if (!STATIC_MODE) return fetchJson(`/api/kpis?term_id=${termId}`);
  await delay();
  return clone(db.kpisByTerm[termId] || db.kpisByTerm['spring-2026']);
}

export async function getPrograms(termId) {
  if (!STATIC_MODE) return fetchJson(`/api/programs?term_id=${termId}`);
  await delay();
  return clone(db.programsByTerm[termId] || []);
}

export async function getProgram(programId) {
  if (!STATIC_MODE) return fetchJson(`/api/programs/${programId}`);
  await delay();
  const allPrograms = Object.values(db.programsByTerm).flat();
  const program = allPrograms.find((item) => item.program_id === programId);
  const studentsInProgram = Object.values(db.studentsByTerm)
    .flat()
    .filter((student) => student.program_ids.includes(programId));

  return {
    ...(program || {}),
    students: studentsInProgram,
    active_students_count: studentsInProgram.length,
  };
}

export async function getVerificationRequests(termId, status) {
  if (!STATIC_MODE) {
    const query = status ? `?term_id=${termId}&status=${status}` : `?term_id=${termId}`;
    return fetchJson(`/api/verification-requests${query}`);
  }
  await delay();
  const requests = clone(db.verificationRequestsByTerm[termId] || []);
  return status ? requests.filter((request) => request.status === status) : requests;
}

export async function getServiceLogs(termId) {
  if (!STATIC_MODE) return fetchJson(`/api/service-logs?term_id=${termId}`);
  await delay();
  return clone(db.serviceLogsByTerm[termId] || []);
}

export async function getStudents(termId) {
  if (!STATIC_MODE) return fetchJson(`/api/students?term_id=${termId}`);
  await delay();
  updateStudentProgressForTerm(termId);
  return clone(db.studentsByTerm[termId] || []);
}

export async function getStudent(studentId, termId) {
  if (!STATIC_MODE) return fetchJson(`/api/students/${studentId}?term_id=${termId}`);
  await delay();
  updateStudentProgressForTerm(termId);
  return clone(buildStudentDetail(studentId, termId));
}

export async function confirmVerification(requestId) {
  if (!STATIC_MODE) {
    return fetchJson('/api/verification-requests/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: requestId })
    });
  }

  await delay();
  const found = getRequestById(requestId);
  if (!found) return { ok: true, hours_added: 0 };

  const request = found.request;
  db.verificationRequestsByTerm[found.termId].splice(found.index, 1);

  const log = (db.serviceLogsByTerm[found.termId] || []).find((item) => item.log_id === request.log_id);
  if (log) log.status = 'confirmed';

  updateStudentProgressForTerm(found.termId);
  return { ok: true, hours_added: request.hours || 0 };
}

export async function rejectVerification(requestId, reason) {
  if (!STATIC_MODE) {
    return fetchJson('/api/verification-requests/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: requestId, reason })
    });
  }

  await delay();
  const found = getRequestById(requestId);
  if (!found) return { ok: true };

  const request = found.request;
  db.verificationRequestsByTerm[found.termId].splice(found.index, 1);
  const log = (db.serviceLogsByTerm[found.termId] || []).find((item) => item.log_id === request.log_id);
  if (log) log.status = 'rejected';
  updateStudentProgressForTerm(found.termId);
  return { ok: true, reason };
}

export async function flagVerification(requestId, reason) {
  if (!STATIC_MODE) {
    return fetchJson('/api/verification-requests/flag', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ request_id: requestId, reason })
    });
  }

  await delay();
  const found = getRequestById(requestId);
  if (!found) return { ok: true };

  const request = found.request;
  db.verificationRequestsByTerm[found.termId].splice(found.index, 1);
  const log = (db.serviceLogsByTerm[found.termId] || []).find((item) => item.log_id === request.log_id);
  if (log) {
    log.status = 'flagged';
    log.description = reason || log.description;
  }

  updateStudentProgressForTerm(found.termId);
  return { ok: true };
}

export async function updateSettings(payload) {
  if (!STATIC_MODE) {
    return fetchJson('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  await delay();
  db.settings = {
    ...db.settings,
    ...payload,
    dashboard_title: payload.dashboard_title || db.settings.dashboard_title,
  };
  return clone(db.settings);
}

export function getExportUrl(type, termId) {
  if (STATIC_MODE) return null;
  return type === 'logs'
    ? `${API_URL}/api/export/verified-logs?term_id=${termId}`
    : `${API_URL}/api/export/audit-trail?term_id=${termId}`;
}

export function isStaticMode() {
  return STATIC_MODE;
}
