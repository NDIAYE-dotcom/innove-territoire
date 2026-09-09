import MainLayout from '../../components/layout/MainLayout'
import ServiceCard from '../../components/services/ServiceCard'
import Reveal from '../../components/common/Reveal'
import { SERVICES, EXPECTED_RESULTS } from '../../data/institutionalContent'
import './Services.css'

function Services() {
  return (
    <MainLayout>
      <section className="services-hero">
        <div className="container">
          <span className="section-eyebrow">Notre offre</span>
          <h1>Prestations</h1>
          <p className="services-hero-text">
            Un accompagnement complet des collectivités territoriales, de l'étude au pilotage des projets.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="services-grid">
            {SERVICES.map((service, index) => (
              <Reveal as="div" direction="up" delay={(index % 3) * 100} key={service.slug}>
                <ServiceCard service={service} index={index} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section services-results">
        <div className="container">
          <Reveal as="div" direction="up" className="section-header">
            <span className="section-eyebrow">Résultats attendus</span>
            <h2>Ce que nos missions apportent aux territoires</h2>
          </Reveal>
          <ul className="services-results-list">
            {EXPECTED_RESULTS.map((result, index) => (
              <Reveal as="li" direction="up" delay={(index % 3) * 80} key={result}>
                {result}
              </Reveal>
            ))}
          </ul>
        </div>
      </section>
    </MainLayout>
  )
}

export default Services
