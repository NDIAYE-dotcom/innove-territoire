import { FORMATION_STATUS, getStatusMeta } from '../../utils/statusLabels'
import StatusBadge from '../dashboard/StatusBadge'
import './FormationHero.css'

function FormationHero({ formation }) {
  const meta = getStatusMeta(FORMATION_STATUS, formation.status)

  return (
    <section className="formation-hero">
      <div className="container formation-hero-inner">
        <div className="formation-hero-text">
          <span className="section-eyebrow">Formation</span>
          <h1>{formation.title}</h1>
          {formation.short_description && <p className="formation-hero-description">{formation.short_description}</p>}
          <div className="formation-hero-badges">
            <StatusBadge label={meta.label} tone={meta.tone} />
            {formation.level && <span className="formation-hero-tag">{formation.level}</span>}
            {formation.duration && <span className="formation-hero-tag">{formation.duration}</span>}
          </div>
        </div>
        {formation.image_url && (
          <div className="formation-hero-image">
            <img src={formation.image_url} alt={formation.title} />
          </div>
        )}
      </div>
    </section>
  )
}

export default FormationHero
