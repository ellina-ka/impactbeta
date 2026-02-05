const TERMS = [
  { term_id: 'fall-2025', name: 'Fall 2025', start_date: '2025-09-01', end_date: '2025-12-15', required_hours: 20 },
  { term_id: 'spring-2026', name: 'Spring 2026', start_date: '2026-01-15', end_date: '2026-05-15', required_hours: 20 },
  { term_id: 'summer-2026', name: 'Summer 2026', start_date: '2026-06-01', end_date: '2026-08-15', required_hours: 10 }
];

const SETTINGS = {
  university_name: 'Columbia University',
  dashboard_title: 'Test Pilot Dashboard'
};

const PROGRAMS_BY_TERM = {
  'spring-2026': [
    { program_id: 'csc-001', name: 'Columbia Service Corps', type: 'campus', term_id: 'spring-2026', active_students_count: 3, icon: 'heart' },
    { program_id: 'gi-002', name: 'Green Initiative', type: 'campus', term_id: 'spring-2026', active_students_count: 2, icon: 'leaf' },
    { program_id: 'hno-003', name: 'Hope NYC Outreach', type: 'ngo_partner', term_id: 'spring-2026', active_students_count: 2, icon: 'users' }
  ],
  'fall-2025': [
    { program_id: 'csc-fall', name: 'Columbia Service Corps', type: 'campus', term_id: 'fall-2025', active_students_count: 2, icon: 'heart' }
  ],
  'summer-2026': [
    { program_id: 'summer-001', name: 'Community Summer Support', type: 'ngo_partner', term_id: 'summer-2026', active_students_count: 1, icon: 'sun' }
  ]
};

const STUDENTS_BY_TERM = {
  'spring-2026': [
    {
      student_id: 'stu-001',
      name: 'Maya Chen',
      email: 'maya@columbia.edu',
      avatar: 'MC',
      program_ids: ['csc-001', 'gi-002'],
      program_names: ['Columbia Service Corps', 'Green Initiative'],
      verified_hours: 14,
      required_hours: 20,
      progress: 70,
      risk_status: 'needs_attention',
      risk_score: 2,
      last_activity: '2026-02-01'
    },
    {
      student_id: 'stu-002',
      name: 'Jordan Lee',
      email: 'jordan@columbia.edu',
      avatar: 'JL',
      program_ids: ['hno-003'],
      program_names: ['Hope NYC Outreach'],
      verified_hours: 6,
      required_hours: 20,
      progress: 30,
      risk_status: 'needs_attention',
      risk_score: 2,
      last_activity: '2026-01-29'
    },
    {
      student_id: 'stu-003',
      name: 'Amira Khan',
      email: 'amira@columbia.edu',
      avatar: 'AK',
      program_ids: ['csc-001'],
      program_names: ['Columbia Service Corps'],
      verified_hours: 3,
      required_hours: 20,
      progress: 15,
      risk_status: 'at_risk',
      risk_score: 3,
      last_activity: '2026-01-24'
    }
  ],
  'fall-2025': [
    {
      student_id: 'stu-010',
      name: 'Casey Moore',
      email: 'casey@columbia.edu',
      avatar: 'CM',
      program_ids: ['csc-fall'],
      program_names: ['Columbia Service Corps'],
      verified_hours: 20,
      required_hours: 20,
      progress: 100,
      risk_status: 'on_track',
      risk_score: 0,
      last_activity: '2025-12-12'
    }
  ],
  'summer-2026': []
};

const SERVICE_LOGS_BY_TERM = {
  'spring-2026': [
    {
      log_id: 'log-001',
      student_id: 'stu-001',
      student_name: 'Maya Chen',
      student_email: 'maya@columbia.edu',
      program_id: 'csc-001',
      program_name: 'Columbia Service Corps',
      date: '2026-02-01',
      hours: 4,
      description: 'Weekend food pantry support',
      evidence_tier: 'org_confirmed',
      status: 'confirmed',
      created_at: '2026-02-01T08:00:00Z'
    },
    {
      log_id: 'log-002',
      student_id: 'stu-002',
      student_name: 'Jordan Lee',
      student_email: 'jordan@columbia.edu',
      program_id: 'hno-003',
      program_name: 'Hope NYC Outreach',
      date: '2026-01-29',
      hours: 3,
      description: 'Shelter intake assistance',
      evidence_tier: 'self_reported',
      status: 'pending',
      created_at: '2026-01-29T08:00:00Z'
    },
    {
      log_id: 'log-003',
      student_id: 'stu-003',
      student_name: 'Amira Khan',
      student_email: 'amira@columbia.edu',
      program_id: 'csc-001',
      program_name: 'Columbia Service Corps',
      date: '2026-01-24',
      hours: 2,
      description: 'Flagged duplicate attendance',
      evidence_tier: 'self_reported',
      status: 'flagged',
      created_at: '2026-01-24T08:00:00Z'
    }
  ],
  'fall-2025': [],
  'summer-2026': []
};

const VERIFICATION_REQUESTS_BY_TERM = {
  'spring-2026': [
    {
      request_id: 'vr-001',
      log_id: 'log-002',
      student_id: 'stu-002',
      student_name: 'Jordan Lee',
      student_email: 'jordan@columbia.edu',
      student_avatar: 'JL',
      program_id: 'hno-003',
      program_name: 'Hope NYC Outreach',
      status: 'awaiting_confirmation',
      hours: 3,
      log_date: '2026-01-29',
      evidence_tier: 'self_reported',
      description: 'Shelter intake assistance',
      ngo_name: 'Hope NYC Outreach',
      created_at: '2026-01-29T08:00:00Z'
    }
  ],
  'fall-2025': [],
  'summer-2026': []
};

const KPIS_BY_TERM = {
  'spring-2026': {
    verified_hours: { value: 23, delta: '+8% vs last week' },
    active_students: { value: 3, delta: '+1 new' },
    active_programs: { value: 3, delta: '0 change' },
    retention_rate: { value: 67, delta: '+5 pts' }
  },
  'fall-2025': {
    verified_hours: { value: 20, delta: 'Term complete' },
    active_students: { value: 1, delta: '—' },
    active_programs: { value: 1, delta: '—' },
    retention_rate: { value: 100, delta: 'Term complete' }
  },
  'summer-2026': {
    verified_hours: { value: 0, delta: 'No activity yet' },
    active_students: { value: 0, delta: 'No activity yet' },
    active_programs: { value: 1, delta: 'Configured' },
    retention_rate: { value: 0, delta: 'No activity yet' }
  }
};

const mockData = {
  terms: TERMS,
  settings: SETTINGS,
  kpisByTerm: KPIS_BY_TERM,
  programsByTerm: PROGRAMS_BY_TERM,
  studentsByTerm: STUDENTS_BY_TERM,
  serviceLogsByTerm: SERVICE_LOGS_BY_TERM,
  verificationRequestsByTerm: VERIFICATION_REQUESTS_BY_TERM
};

export default mockData;
