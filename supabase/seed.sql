-- Demo workflow records for the sellable ImpactBeta prototype.
-- Create the demo Auth users in Supabase first, then insert matching rows into
-- public.profiles using their Auth user IDs.
--
-- Recommended demo credentials:
-- admin@impactbeta.app / Impactbeta2026!
-- lina.moreau@sciencespo.fr / Impactbeta2026!
-- ngo@impactbeta.app / Impactbeta2026!

insert into public.applications (
  id, student_name, student_email, ngo_name, school_name, mission_description,
  start_date, end_date, target_hours, status
) values
  ('11111111-1111-4111-8111-111111111111', 'Lina Moreau', 'lina.moreau@sciencespo.fr', 'Association Afev Paris', 'Sciences Po', 'Mentorat hebdomadaire auprès de lycéens en décrochage.', '2026-02-10', '2026-05-30', 40, 'pending'),
  ('22222222-2222-4222-8222-222222222222', 'Yassine Benali', 'yassine.benali@sciencespo.fr', 'Restos du Cœur Paris 13', 'Sciences Po', 'Soutien à la distribution alimentaire du samedi matin.', '2026-03-01', '2026-06-15', 36, 'pending'),
  ('33333333-3333-4333-8333-333333333333', 'Clara Dubois', 'clara.dubois@sciencespo.fr', 'Emmaüs Connect', 'Sciences Po', 'Accompagnement numérique de publics en insertion.', '2026-01-20', '2026-04-20', 30, 'rejected'),
  ('44444444-4444-4444-8444-444444444444', 'Thomas Martin', 'thomas.martin@sciencespo.fr', 'La Croix-Rouge française', 'Sciences Po', 'Appui logistique événements solidarité locale.', '2026-01-15', '2026-04-30', 35, 'validated'),
  ('55555555-5555-4555-8555-555555555555', 'Maya Okafor', 'maya.okafor@sciencespo.fr', 'Bibliothèques Sans Frontières', 'Sciences Po', 'Animation d’ateliers de lecture et d’inclusion numérique pour nouveaux arrivants.', '2026-02-18', '2026-06-05', 32, 'validated')
on conflict (id) do update set
  student_name = excluded.student_name,
  student_email = excluded.student_email,
  ngo_name = excluded.ngo_name,
  school_name = excluded.school_name,
  mission_description = excluded.mission_description,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  target_hours = excluded.target_hours,
  status = excluded.status;

insert into public.conventions (
  id, application_id, student_name, student_email, ngo_name, school_name, mission_description,
  start_date, end_date, target_hours, status
) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '44444444-4444-4444-8444-444444444444', 'Thomas Martin', 'thomas.martin@sciencespo.fr', 'La Croix-Rouge française', 'Sciences Po', 'Appui logistique événements solidarité locale.', '2026-01-15', '2026-04-30', 35, 'ready'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '55555555-5555-4555-8555-555555555555', 'Maya Okafor', 'maya.okafor@sciencespo.fr', 'Bibliothèques Sans Frontières', 'Sciences Po', 'Animation d’ateliers de lecture et d’inclusion numérique pour nouveaux arrivants.', '2026-02-18', '2026-06-05', 32, 'ready')
on conflict (application_id) do update set
  student_name = excluded.student_name,
  student_email = excluded.student_email,
  ngo_name = excluded.ngo_name,
  school_name = excluded.school_name,
  mission_description = excluded.mission_description,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  target_hours = excluded.target_hours,
  status = excluded.status;
