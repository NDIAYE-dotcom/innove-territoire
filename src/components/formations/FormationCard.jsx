import Button from '../common/Button'
import { FORMATION_STATUS } from '../../utils/statusLabels'
import './FormationCard.css'

function formatDateRange(startDate, endDate) {
  if (!startDate) return null
  const start = new Date(startDate).toLocaleDateString('fr-FR')
  if (!endDate || endDate === startDate) return start
  return `${start} — ${new Date(endDate).toLocaleDateString('fr-FR')}`
}

function FormationCard({ formation }) {
  const { title, short_description: shortDescription, image_url: image, start_date, end_date, duration, level, status, slug } = formation
  const statusLabel = FORMATION_STATUS[status]?.label

  return (
    <article className="formation-card">
      <div className="formation-card-image">
        {image ? <img src={image} alt={title} /> : <div className="formation-card-image-fallback" aria-hidden="true" />}
        {statusLabel && <span className="formation-card-status">{statusLabel}</span>}
      </div>
      <div className="formation-card-body">
        <h3 className="formation-card-title">{title}</h3>
        {shortDescription && <p className="formation-card-description">{shortDescription}</p>}
        <ul className="formation-card-meta">
          {formatDateRange(start_date, end_date) && <li>{formatDateRange(start_date, end_date)}</li>}
          {duration && <li>{duration}</li>}
          {level && <li>{level}</li>}
        </ul>
        <Button to={`/formations/${slug}`} variant="outline" size="sm">
          Voir la formation
        </Button>
      </div>
    </article>
  )
}

export default FormationCard
