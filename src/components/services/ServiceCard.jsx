import Button from '../common/Button'
import { ServiceIcon } from './serviceIcons'
import './ServiceCard.css'

// Alterne 3 déclinaisons de dégradé de marque tant qu'une vraie photo n'est
// pas fournie pour la prestation (service.image) — évite que les 7 cards sans
// image se ressemblent toutes exactement à l'identique.
const GRADIENT_VARIANTS = ['service-card-media--a', 'service-card-media--b', 'service-card-media--c']

function ServiceCard({ service, index }) {
  const gradientClass = GRADIENT_VARIANTS[index % GRADIENT_VARIANTS.length]

  return (
    <article className="service-card">
      <div className={`service-card-media ${service.image ? '' : gradientClass}`}>
        {service.image ? (
          <img src={service.image} alt="" className="service-card-image" loading="lazy" />
        ) : (
          <ServiceIcon slug={service.slug} className="service-card-media-icon" />
        )}
      </div>

      <div className="service-card-body">
        <h3 className="service-card-title">{service.title}</h3>
        <p className="service-card-description">{service.description}</p>
        <Button to={`/contact?service=${service.slug}`} variant="outline" size="sm" className="service-card-cta">
          Demander ce service
          <span className="service-card-cta-arrow" aria-hidden="true">→</span>
        </Button>
      </div>
    </article>
  )
}

export default ServiceCard
