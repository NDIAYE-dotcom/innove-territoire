import { METHODOLOGY } from '../../data/institutionalContent'
import Reveal from '../common/Reveal'
import './Methodology.css'

function Methodology() {
  return (
    <section className="section methodology" id="methodologie">
      <div className="container">
        <Reveal as="div" direction="up" className="section-header">
          <span className="section-eyebrow">Notre approche</span>
          <h2>Méthodologie</h2>
          <p>Une méthodologie rigoureuse, participative et orientée vers l'impact.</p>
        </Reveal>

        <ol className="methodology-list">
          {METHODOLOGY.map((step, index) => (
            <Reveal
              as="li"
              className="methodology-item"
              direction={index % 2 === 0 ? 'left' : 'right'}
              key={step.title}
            >
              <span className="methodology-item-number">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}

export default Methodology
