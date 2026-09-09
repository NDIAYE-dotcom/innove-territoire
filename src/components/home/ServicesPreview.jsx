import { SERVICES } from '../../data/institutionalContent'
import ServiceCard from '../services/ServiceCard'
import Button from '../common/Button'
import Reveal from '../common/Reveal'
import './ServicesPreview.css'

function ServicesPreview() {
  return (
    <section className="section services-preview">
      <div className="container">
        <Reveal as="div" direction="up" className="section-header">
          <span className="section-eyebrow">Notre offre</span>
          <h2>Prestations</h2>
          <p>Un accompagnement complet, de l'étude au pilotage des projets territoriaux.</p>
        </Reveal>

        <div className="services-preview-grid">
          {SERVICES.map((service, index) => (
            <Reveal as="div" direction="up" delay={(index % 3) * 100} key={service.slug}>
              <ServiceCard service={service} index={index} />
            </Reveal>
          ))}
        </div>

        <div className="text-center services-preview-cta">
          <Button to="/prestations" variant="outline">
            Voir toutes les prestations
          </Button>
        </div>
      </div>
    </section>
  )
}

export default ServicesPreview
