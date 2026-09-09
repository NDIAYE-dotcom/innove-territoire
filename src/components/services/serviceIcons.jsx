// Icônes de repli (SVG inline, pas de dépendance) tant qu'aucune photo n'est
// fournie pour une prestation — voir ServiceCard.jsx. Une fois `service.image`
// renseigné (public/assets/services/...), l'icône n'est plus utilisée.
const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const ICONS_BY_SLUG = {
  'etudes-et-diagnostics-territoriaux': (props) => (
    <svg {...iconProps} {...props}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 21 21" />
      <path d="M8 10.5h5M10.5 8v5" />
    </svg>
  ),
  'elaboration-plans-developpement-local-territorial': (props) => (
    <svg {...iconProps} {...props}>
      <path d="M3 6.5 9 4l6 2.5 6-2.5v13l-6 2.5-6-2.5-6 2.5z" />
      <path d="M9 4v13M15 6.5V19.5" />
    </svg>
  ),
  'transformation-digitale': (props) => (
    <svg {...iconProps} {...props}>
      <rect x="4" y="4" width="10" height="10" rx="2" />
      <path d="M9 2v2M9 14v2M2 9h2M14 9h2M4.5 4.5l1.4 1.4M4.5 4.5l1.4 1.4" />
      <path d="M16 14.5h4M16 17.5h5.5M16 20.5h3" />
    </svg>
  ),
  'evaluation-politiques-publiques-programmes-projets': (props) => (
    <svg {...iconProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  ),
  'appui-conseil-strategique-elus-decideurs-locaux': (props) => (
    <svg {...iconProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m14.8 9.2-2.1 4.9-4.9 2.1 2.1-4.9z" />
    </svg>
  ),
  'formations-ateliers-seminaires': (props) => (
    <svg {...iconProps} {...props}>
      <path d="M2 8.5 12 4l10 4.5-10 4.5-10-4.5Z" />
      <path d="M6 10.7v5c0 1.4 2.7 2.8 6 2.8s6-1.4 6-2.8v-5" />
      <path d="M21 8.5v6" />
    </svg>
  ),
  'facilitation-animation-cadres-concertation-locale': (props) => (
    <svg {...iconProps} {...props}>
      <path d="M4 5.5h11a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H10l-4 3v-3H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2Z" />
      <path d="M17 8.5h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1v2.5l-3-2.5" />
    </svg>
  ),
}

function DefaultIcon(props) {
  return (
    <svg {...iconProps} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M9 12h6M12 9v6" />
    </svg>
  )
}

export function ServiceIcon({ slug, ...props }) {
  const Icon = ICONS_BY_SLUG[slug] || DefaultIcon
  return <Icon {...props} />
}
