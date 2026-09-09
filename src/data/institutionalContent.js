// Contenu institutionnel officiel, issu du document "Cabinet Innov'Territoires".
// Provisoire : sera remplacé par des requêtes Supabase (tables domains / services) en Phase 3/10,
// sans changer la forme des objets ci-dessous pour simplifier la migration.

export const POSITIONING =
  "Cabinet de conseil et d'ingénierie territoriale, dédié à l'accompagnement des élus locaux, des collectivités territoriales et des acteurs du développement local dans la conception, l'analyse, la mise en œuvre et l'évaluation des politiques publiques locales."

export const CONTEXT =
  "Face aux mutations économiques, sociales, institutionnelles et environnementales, les collectivités territoriales sont confrontées à des défis majeurs : gouvernance locale, efficacité des politiques publiques, attractivité des territoires, inclusion sociale et développement durable."

export const GENERAL_OBJECTIVE =
  "Appuyer les collectivités territoriales et les acteurs locaux dans l'élaboration de stratégies territoriales innovantes, cohérentes et efficaces, fondées sur une analyse rigoureuse des politiques publiques locales et une connaissance fine des dynamiques territoriales."

export const SPECIFIC_OBJECTIVES = [
  'Réaliser des diagnostics territoriaux approfondis (institutionnels, socio-économiques, politiques).',
  "Renforcer les capacités des élus et cadres territoriaux en matière de gouvernance locale et d'action publique.",
  "Évaluer les programmes, projets et politiques locales afin d'en mesurer les impacts et améliorer leur efficacité.",
  "Promouvoir l'innovation territoriale et les approches participatives.",
]

export const DOMAINS = [
  {
    slug: 'developpement-territorial-et-local',
    title: 'Développement territorial et local',
    description:
      "Accompagnement des dynamiques de développement à l'échelle locale, au service d'une croissance équilibrée et durable des territoires.",
  },
  {
    slug: 'analyse-evaluation-politiques-publiques-locales',
    title: 'Analyse et évaluation des politiques publiques locales',
    description:
      "Analyse rigoureuse et évaluation des politiques, programmes et projets locaux afin d'en mesurer les impacts et d'en améliorer l'efficacité.",
  },
  {
    slug: 'decentralisation-et-gouvernance-territoriale',
    title: 'Décentralisation et gouvernance territoriale',
    description:
      'Appui aux processus de décentralisation et renforcement de la gouvernance territoriale au plus près des besoins locaux.',
  },
  {
    slug: 'planification-strategique-territoriale',
    title: 'Planification stratégique territoriale',
    description:
      'Élaboration de stratégies territoriales cohérentes, fondées sur une connaissance fine des dynamiques locales.',
  },
  {
    slug: 'participation-citoyenne-et-concertation-locale',
    title: 'Participation citoyenne et concertation locale',
    description:
      "Promotion d'une démarche participative et inclusive, associant les acteurs institutionnels, politiques et sociaux du territoire.",
  },
  {
    slug: 'renforcement-des-capacites-institutionnelles',
    title: 'Renforcement des capacités institutionnelles',
    description:
      'Renforcement des capacités des élus et administrations locales en matière de gouvernance et de conduite de l\'action publique.',
  },
  {
    slug: 'appui-reformes-locales-ingenierie-projets-territoriaux',
    title: 'Appui aux réformes locales et à l\'ingénierie de projets territoriaux',
    description:
      "Accompagnement des réformes locales et structuration des projets territoriaux, pour un meilleur pilotage et une meilleure appropriation locale.",
  },
]

export const SERVICES = [
  {
    slug: 'etudes-et-diagnostics-territoriaux',
    title: 'Études et diagnostics territoriaux',
    description: 'Diagnostics territoriaux approfondis — institutionnels, socio-économiques et politiques.',
    image: '/assets/img-1.png',
  },
  {
    slug: 'elaboration-plans-developpement-local-territorial',
    title: 'Élaboration de plans de développement local et territorial',
    description: 'Construction de plans de développement cohérents, adaptés aux réalités de chaque territoire.',
    image: '/assets/img-2.png',
  },
  {
    slug: 'transformation-digitale',
    title: 'Transformation digitale',
    description:
      "Accompagnement des collectivités territoriales dans la modernisation numérique de leurs services, de leur gouvernance et de leurs modes d'interaction avec les citoyens.",
    image: '/assets/img-3.png',
  },
  {
    slug: 'evaluation-politiques-publiques-programmes-projets',
    title: 'Évaluation de politiques publiques, programmes et projets',
    description: "Évaluation rigoureuse pour mesurer l'impact et améliorer l'efficacité des actions publiques.",
    image: '/assets/img-4.png',
  },
  {
    slug: 'appui-conseil-strategique-elus-decideurs-locaux',
    title: 'Appui-conseil stratégique aux élus et décideurs locaux',
    description: "Accompagnement stratégique des élus et décideurs dans leurs choix de politique territoriale.",
    image: '/assets/img-5.png',
  },
  {
    slug: 'formations-ateliers-seminaires',
    title: 'Formations, ateliers et séminaires pour acteurs locaux',
    description: 'Renforcement de capacités par des formations, ateliers et séminaires dédiés aux acteurs locaux.',
    image: '/assets/img-6.png',
  },
  {
    slug: 'facilitation-animation-cadres-concertation-locale',
    title: 'Facilitation et animation de cadres de concertation locale',
    description: "Animation de cadres de dialogue et de concertation entre les acteurs du territoire.",
    image: '/assets/img-7.png',
  },
]

export const METHODOLOGY = [
  {
    title: 'Analyse qualitative et quantitative',
    description: 'Une analyse qualitative et quantitative des données territoriales.',
  },
  {
    title: 'Entretiens avec les acteurs',
    description: 'Des entretiens avec les acteurs institutionnels, politiques et sociaux.',
  },
  {
    title: 'Démarche participative et inclusive',
    description: 'Une démarche participative et inclusive associant l\'ensemble des parties prenantes.',
  },
  {
    title: "Outils d'analyse des politiques publiques",
    description: "L'utilisation d'outils d'analyse des politiques publiques.",
  },
  {
    title: 'Résultats, impacts et durabilité',
    description: 'Une logique orientée résultats, impacts et durabilité.',
  },
]

export const PRINCIPLES = [
  {
    title: 'Rigueur scientifique et indépendance',
    description: 'Une approche fondée sur la rigueur scientifique et une indépendance affirmée.',
  },
  {
    title: 'Éthique et neutralité politique',
    description: "Un engagement éthique et une stricte neutralité politique dans l'ensemble de nos missions.",
  },
  {
    title: 'Approche participative et inclusive',
    description: "L'implication de l'ensemble des acteurs, dans une logique participative et inclusive.",
  },
  {
    title: 'Innovation et adaptation aux réalités locales',
    description: "Une capacité d'innovation et d'adaptation aux réalités propres à chaque territoire.",
  },
  {
    title: "Orientation vers l'impact et la durabilité",
    description: "Une action résolument orientée vers l'impact et la durabilité des résultats obtenus.",
  },
]

export const EXPECTED_RESULTS = [
  'Des politiques publiques locales mieux conçues et plus cohérentes.',
  'Une gouvernance territoriale renforcée.',
  'Des capacités accrues des élus et administrations locales.',
  'Des projets territoriaux mieux structurés et mieux pilotés.',
  'Une meilleure appropriation locale des stratégies de développement.',
]

export const BENEFICIARIES = [
  'Collectivités territoriales (communes, départements)',
  'Élus locaux et administrations territoriales',
  'Structures intercommunales',
  'Organisations de la société civile et partenaires locaux',
  'Programmes et projets de développement territorial',
]

export const INTERVENTION_ZONE =
  "Le Cabinet Innov'Territoires intervient prioritairement en milieu rural et urbain, avec une possibilité d'intervention à l'échelle nationale et régionale."
