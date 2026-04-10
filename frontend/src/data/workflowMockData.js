export const initialApplications = [
  {
    id: 'app-001',
    studentName: 'Lina Moreau',
    studentEmail: 'lina.moreau@sciencespo.fr',
    ngoName: 'Association Afev Paris',
    missionDescription: 'Mentorat hebdomadaire auprès de lycéens en décrochage.',
    startDate: '2026-02-10',
    endDate: '2026-05-30',
    targetHours: 40,
    status: 'pending'
  },
  {
    id: 'app-002',
    studentName: 'Yassine Benali',
    studentEmail: 'yassine.benali@sciencespo.fr',
    ngoName: 'Restos du Cœur Paris 13',
    missionDescription: 'Soutien à la distribution alimentaire du samedi matin.',
    startDate: '2026-03-01',
    endDate: '2026-06-15',
    targetHours: 36,
    status: 'pending'
  },
  {
    id: 'app-003',
    studentName: 'Clara Dubois',
    studentEmail: 'clara.dubois@sciencespo.fr',
    ngoName: 'Emmaüs Connect',
    missionDescription: 'Accompagnement numérique de publics en insertion.',
    startDate: '2026-01-20',
    endDate: '2026-04-20',
    targetHours: 30,
    status: 'pending'
  },
  {
    id: 'app-004',
    studentName: 'Thomas Martin',
    studentEmail: 'thomas.martin@sciencespo.fr',
    ngoName: 'La Croix-Rouge française',
    missionDescription: 'Appui logistique événements solidarité locale.',
    startDate: '2026-01-15',
    endDate: '2026-04-30',
    targetHours: 35,
    status: 'validated'
  }
];

export const initialConventions = [
  {
    id: 'conv-001',
    applicationId: 'app-004',
    studentName: 'Thomas Martin',
    studentEmail: 'thomas.martin@sciencespo.fr',
    ngoName: 'La Croix-Rouge française',
    missionDescription: 'Appui logistique événements solidarité locale.',
    startDate: '2026-01-15',
    endDate: '2026-04-30',
    targetHours: 35,
    status: 'ready'
  }
];
