import { PRINCIPLES } from '../../data/institutionalContent'
import Reveal from '../common/Reveal'
import './WhyUs.css'

function WhyUs() {
  return (
    <section className="section why-us">
      <div className="container">
        <Reveal as="div" direction="up" className="section-header">
          <span className="section-eyebrow">Pourquoi Innov'Territoires ?</span>
          <h2>Des principes qui guident chacune de nos missions</h2>
        </Reveal>

        <div className="why-us-grid">
          {PRINCIPLES.map((principle, index) => (
            <Reveal as="div" className="why-us-card" direction="up" delay={(index % 3) * 100} key={principle.title}>
              <h3>{principle.title}</h3>
              <p>{principle.description}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhyUs
