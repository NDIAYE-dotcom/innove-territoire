import { CONTEXT, GENERAL_OBJECTIVE } from '../../data/institutionalContent'
import Button from '../common/Button'
import Reveal from '../common/Reveal'
import './Presentation.css'

function Presentation() {
  return (
    <section className="section presentation">
      <div className="container presentation-grid">
        <Reveal direction="left" className="presentation-intro">
          <span className="section-eyebrow">Qui sommes-nous</span>
          <h2>Un partenaire de confiance pour les territoires</h2>
          <p className="presentation-text">{CONTEXT}</p>
        </Reveal>
        <Reveal direction="right" delay={120} className="presentation-objective">
          <h3>Notre objectif général</h3>
          <p>{GENERAL_OBJECTIVE}</p>
          <Button to="/a-propos" variant="outline" size="sm">
            En savoir plus sur le cabinet
          </Button>
        </Reveal>
      </div>
    </section>
  )
}

export default Presentation
