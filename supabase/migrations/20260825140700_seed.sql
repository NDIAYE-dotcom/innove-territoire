-- Seed du contenu institutionnel officiel, en miroir exact de
-- src/data/institutionalContent.js (Phase 2). Rien d'inventé : ce sont les
-- mêmes textes déjà publiés sur le site public.

insert into public.domains (slug, title, description, order_index) values
('developpement-territorial-et-local', $$Développement territorial et local$$,
 $$Accompagnement des dynamiques de développement à l'échelle locale, au service d'une croissance équilibrée et durable des territoires.$$, 1),
('analyse-evaluation-politiques-publiques-locales', $$Analyse et évaluation des politiques publiques locales$$,
 $$Analyse rigoureuse et évaluation des politiques, programmes et projets locaux afin d'en mesurer les impacts et d'en améliorer l'efficacité.$$, 2),
('decentralisation-et-gouvernance-territoriale', $$Décentralisation et gouvernance territoriale$$,
 $$Appui aux processus de décentralisation et renforcement de la gouvernance territoriale au plus près des besoins locaux.$$, 3),
('planification-strategique-territoriale', $$Planification stratégique territoriale$$,
 $$Élaboration de stratégies territoriales cohérentes, fondées sur une connaissance fine des dynamiques locales.$$, 4),
('participation-citoyenne-et-concertation-locale', $$Participation citoyenne et concertation locale$$,
 $$Promotion d'une démarche participative et inclusive, associant les acteurs institutionnels, politiques et sociaux du territoire.$$, 5),
('renforcement-des-capacites-institutionnelles', $$Renforcement des capacités institutionnelles$$,
 $$Renforcement des capacités des élus et administrations locales en matière de gouvernance et de conduite de l'action publique.$$, 6),
('appui-reformes-locales-ingenierie-projets-territoriaux', $$Appui aux réformes locales et à l'ingénierie de projets territoriaux$$,
 $$Accompagnement des réformes locales et structuration des projets territoriaux, pour un meilleur pilotage et une meilleure appropriation locale.$$, 7);

insert into public.services (slug, title, description, order_index) values
('etudes-et-diagnostics-territoriaux', $$Études et diagnostics territoriaux$$,
 $$Diagnostics territoriaux approfondis — institutionnels, socio-économiques et politiques.$$, 1),
('elaboration-plans-developpement-local-territorial', $$Élaboration de plans de développement local et territorial$$,
 $$Construction de plans de développement cohérents, adaptés aux réalités de chaque territoire.$$, 2),
('transformation-digitale', $$Transformation digitale$$,
 $$Accompagnement des collectivités territoriales dans la modernisation numérique de leurs services, de leur gouvernance et de leurs modes d'interaction avec les citoyens.$$, 3),
('evaluation-politiques-publiques-programmes-projets', $$Évaluation de politiques publiques, programmes et projets$$,
 $$Évaluation rigoureuse pour mesurer l'impact et améliorer l'efficacité des actions publiques.$$, 4),
('appui-conseil-strategique-elus-decideurs-locaux', $$Appui-conseil stratégique aux élus et décideurs locaux$$,
 $$Accompagnement stratégique des élus et décideurs dans leurs choix de politique territoriale.$$, 5),
('formations-ateliers-seminaires', $$Formations, ateliers et séminaires pour acteurs locaux$$,
 $$Renforcement de capacités par des formations, ateliers et séminaires dédiés aux acteurs locaux.$$, 6),
('facilitation-animation-cadres-concertation-locale', $$Facilitation et animation de cadres de concertation locale$$,
 $$Animation de cadres de dialogue et de concertation entre les acteurs du territoire.$$, 7);

-- Relie chaque prestation à son domaine le plus proche (association indicative,
-- ajustable librement depuis le SuperAdmin en Phase 8/10).
update public.services set domain_id = (select id from public.domains where slug = 'analyse-evaluation-politiques-publiques-locales')
  where slug = 'etudes-et-diagnostics-territoriaux';
update public.services set domain_id = (select id from public.domains where slug = 'planification-strategique-territoriale')
  where slug = 'elaboration-plans-developpement-local-territorial';
update public.services set domain_id = (select id from public.domains where slug = 'developpement-territorial-et-local')
  where slug = 'transformation-digitale';
update public.services set domain_id = (select id from public.domains where slug = 'analyse-evaluation-politiques-publiques-locales')
  where slug = 'evaluation-politiques-publiques-programmes-projets';
update public.services set domain_id = (select id from public.domains where slug = 'decentralisation-et-gouvernance-territoriale')
  where slug = 'appui-conseil-strategique-elus-decideurs-locaux';
update public.services set domain_id = (select id from public.domains where slug = 'renforcement-des-capacites-institutionnelles')
  where slug = 'formations-ateliers-seminaires';
update public.services set domain_id = (select id from public.domains where slug = 'participation-citoyenne-et-concertation-locale')
  where slug = 'facilitation-animation-cadres-concertation-locale';

insert into public.site_settings (key, value) values
  ('site_name', '"Innov''Territoires"'::jsonb),
  ('site_description', to_jsonb($$Cabinet de conseil et d'ingénierie territoriale, dédié à l'accompagnement des élus locaux, des collectivités territoriales et des acteurs du développement local.$$::text));
