-- Données de démonstration UNIQUEMENT pour tester la Phase 7 (catalogue,
-- inscription, salle de cours) avant que le SuperAdmin (Phase 8) ne puisse
-- créer de vraies formations. Rien de ceci n'est présenté comme un contenu
-- officiel du cabinet — à supprimer avant mise en production (requête de
-- nettoyage fournie en bas de fichier).

insert into public.formations (
  slug, title, short_description, full_description, objectives,
  target_audience, prerequisites, level, duration,
  start_date, end_date, seats_total, price, status, instructor_name
) values (
  'demo-gouvernance-locale',
  '[DEMO] Fondamentaux de la gouvernance locale',
  'Formation de démonstration utilisée pour tester le parcours e-learning.',
  'Cette formation de démonstration permet de vérifier le parcours complet : catalogue, inscription, validation et salle de cours.',
  '["Comprendre les principes de la gouvernance locale", "Identifier les leviers d''action des collectivités"]'::jsonb,
  'Élus locaux, cadres territoriaux (donnée de démonstration)',
  'Aucun',
  'Débutant',
  '2 heures',
  current_date + interval '14 days',
  current_date + interval '14 days',
  20,
  0,
  'published',
  '[DEMO] Formateur test'
)
returning id;

-- Récupérer l'id retourné ci-dessus puis l'utiliser dans les inserts suivants,
-- ou exécuter ce bloc complet qui le fait automatiquement :
do $$
declare
  v_formation_id uuid;
  v_module_id uuid;
begin
  select id into v_formation_id from public.formations where slug = 'demo-gouvernance-locale';

  insert into public.formation_modules (formation_id, title, description, order_index)
  values (v_formation_id, 'Module 1 — Introduction', 'Module de démonstration', 1)
  returning id into v_module_id;

  insert into public.lessons (module_id, title, description, content, order_index, status)
  values
    (v_module_id, 'Leçon 1 — Qu''est-ce que la gouvernance locale ?', 'Leçon de démonstration',
     'Ceci est un contenu de démonstration.' || chr(10) || 'La gouvernance locale désigne l''ensemble des processus par lesquels les acteurs d''un territoire coordonnent leurs actions.',
     1, 'published'),
    (v_module_id, 'Leçon 2 — Les acteurs du territoire', 'Leçon de démonstration',
     'Ceci est un second contenu de démonstration, pour vérifier la navigation entre leçons et le suivi de progression.',
     2, 'published');
end $$;

-- Lien Meet de démonstration (ne doit être visible qu'aux inscrits approuvés)
insert into public.formation_meet_links (formation_id, meet_link)
select id, 'https://meet.google.com/demo-test-link'
from public.formations where slug = 'demo-gouvernance-locale';

-- Nettoyage (à exécuter avant mise en production) :
-- delete from public.formations where slug = 'demo-gouvernance-locale';
-- (les modules, leçons, inscriptions, progressions et lien Meet associés sont
-- supprimés automatiquement via ON DELETE CASCADE)
