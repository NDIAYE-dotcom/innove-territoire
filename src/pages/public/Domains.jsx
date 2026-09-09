import MainLayout from '../../components/layout/MainLayout'
import Button from '../../components/common/Button'
import DomainCard from '../../components/domains/DomainCard'
import { DOMAINS } from '../../data/institutionalContent'
import './Domains.css'

function Domains() {
  return (
    <MainLayout>
      <section className="domains-hero">
        <div className="container">
          <span className="section-eyebrow">Expertise</span>
          <h1>Domaines d'intervention</h1>
          <p className="domains-hero-text">
            Le Cabinet Innov'Territoires intervient sur sept champs d'action complémentaires, au service des
            collectivités territoriales et des acteurs du développement local.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="domains-grid">
            {DOMAINS.map((domain, index) => (
              <DomainCard domain={domain} index={index} key={domain.slug} />
            ))}
          </div>
        </div>
      </section>

      <section className="section domains-cta">
        <div className="container text-center">
          <h2>Une prestation associée à chaque domaine</h2>
          <p className="domains-cta-text">
            Découvrez l'ensemble de nos prestations, ou demandez directement un accompagnement sur votre
            territoire.
          </p>
          <div className="domains-cta-actions">
            <Button to="/prestations" variant="primary">
              Voir les prestations
            </Button>
            <Button to="/contact" variant="outline">
              Demander un accompagnement
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}

export default Domains
