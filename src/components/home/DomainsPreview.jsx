import { DOMAINS } from '../../data/institutionalContent'
import DomainCard from '../domains/DomainCard'
import Button from '../common/Button'
import Reveal from '../common/Reveal'
import './DomainsPreview.css'

function DomainsPreview() {
  return (
    <section className="section domains-preview">
      <div className="container">
        <Reveal as="div" direction="up" className="section-header">
          <span className="section-eyebrow">Expertise</span>
          <h2>Domaines d'intervention</h2>
          <p>Sept champs d'action complémentaires au service des collectivités et des acteurs territoriaux.</p>
        </Reveal>

        <div className="domains-preview-grid">
          {DOMAINS.map((domain, index) => (
            <Reveal as="div" direction="up" delay={(index % 3) * 100} key={domain.slug}>
              <DomainCard domain={domain} index={index} />
            </Reveal>
          ))}
        </div>

        <div className="text-center domains-preview-cta">
          <Button to="/domaines" variant="outline">
            Voir tous les domaines
          </Button>
        </div>
      </div>
    </section>
  )
}

export default DomainsPreview
