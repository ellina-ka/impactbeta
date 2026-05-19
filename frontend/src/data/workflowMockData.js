export const initialApplications = [
  {
    id: 'app-001',
    studentName: 'Lina Moreau',
    studentEmail: 'lina.moreau@sciencespo.fr',
    ngoName: 'Association Afev Paris',
    schoolName: 'Sciences Po',
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
    schoolName: 'Sciences Po',
    missionDescription: 'Soutien à la distribution alimentaire du samedi matin.',
    startDate: '2026-03-01',
    endDate: '2026-06-15',
    targetHours: 36,
    status: 'validated'
  },
  {
    id: 'app-003',
    studentName: 'Clara Dubois',
    studentEmail: 'clara.dubois@sciencespo.fr',
    ngoName: 'Emmaüs Connect',
    schoolName: 'Sciences Po',
    missionDescription: 'Accompagnement numérique de publics en insertion.',
    startDate: '2026-01-20',
    endDate: '2026-04-20',
    targetHours: 30,
    status: 'rejected'
  },
  {
    id: 'app-004',
    studentName: 'Thomas Martin',
    studentEmail: 'thomas.martin@sciencespo.fr',
    ngoName: 'La Croix-Rouge française',
    schoolName: 'Sciences Po',
    missionDescription: 'Appui logistique événements solidarité locale.',
    startDate: '2026-01-15',
    endDate: '2026-04-30',
    targetHours: 35,
    status: 'validated'
  },
  {
    id: 'app-005',
    studentName: 'Maya Okafor',
    studentEmail: 'maya.okafor@sciencespo.fr',
    ngoName: 'Bibliothèques Sans Frontières',
    schoolName: 'Sciences Po',
    missionDescription: 'Animation d’ateliers de lecture et d’inclusion numérique pour nouveaux arrivants.',
    startDate: '2026-02-18',
    endDate: '2026-06-05',
    targetHours: 32,
    status: 'validated'
  },
  {
    id: 'app-006',
    studentName: 'Noé Petit',
    studentEmail: 'noe.petit@sciencespo.fr',
    ngoName: 'Fondation de France',
    schoolName: 'Sciences Po',
    missionDescription: 'Recherche et coordination pour un programme de solidarité étudiante.',
    startDate: '2026-03-10',
    endDate: '2026-06-30',
    targetHours: 28,
    status: 'pending'
  }
];

export const initialConventions = [
  {
    id: 'conv-001',
    applicationId: 'app-004',
    studentName: 'Thomas Martin',
    studentEmail: 'thomas.martin@sciencespo.fr',
    ngoName: 'La Croix-Rouge française',
    schoolName: 'Sciences Po',
    missionDescription: 'Appui logistique événements solidarité locale.',
    startDate: '2026-01-15',
    endDate: '2026-04-30',
    targetHours: 35,
    status: 'ready'
  },
  {
    id: 'conv-002',
    applicationId: 'app-005',
    studentName: 'Maya Okafor',
    studentEmail: 'maya.okafor@sciencespo.fr',
    ngoName: 'Bibliothèques Sans Frontières',
    schoolName: 'Sciences Po',
    missionDescription: 'Animation d’ateliers de lecture et d’inclusion numérique pour nouveaux arrivants.',
    startDate: '2026-02-18',
    endDate: '2026-06-05',
    targetHours: 32,
    status: 'ready'
  },
  {
    id: 'conv-003',
    applicationId: 'app-002',
    studentName: 'Yassine Benali',
    studentEmail: 'yassine.benali@sciencespo.fr',
    ngoName: 'Restos du Cœur Paris 13',
    schoolName: 'Sciences Po',
    missionDescription: 'Soutien à la distribution alimentaire du samedi matin.',
    startDate: '2026-03-01',
    endDate: '2026-06-15',
    targetHours: 36,
    status: 'signed'
  }
];
