import { DOMAINS, SERVICES, PRINCIPLES } from '../../data/institutionalContent'
import Reveal from '../common/Reveal'
import './Indicators.css'

const INDICATORS = [
  { value: DOMAINS.length, label: "domaines d'intervention" },
  { value: SERVICES.length, label: 'prestations proposées' },
  { value: PRINCIPLES.length, label: "principes d'intervention" },
  { value: 'National & régional', label: "zone d'intervention" },
]

function Indicators() {
  return (
    <section className="indicators">
      <div className="container indicators-grid">
        {INDICATORS.map((indicator, index) => (
          <Reveal as="div" className="indicator" direction="up" delay={index * 90} key={indicator.label}>
            <span className="indicator-value">{indicator.value}</span>
            <span className="indicator-label">{indicator.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

export default Indicators
