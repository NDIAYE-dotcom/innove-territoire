import Button from '../common/Button'
import Reveal from '../common/Reveal'
import './CtaBanner.css'

function CtaBanner() {
  return (
    <section className="cta-banner">
      <Reveal as="div" direction="up" className="container cta-banner-inner">
        <h2>Construisons ensemble des territoires plus innovants, cohérents et durables.</h2>
        <Button to="/contact" variant="secondary" size="lg">
          Nous contacter
        </Button>
      </Reveal>
    </section>
  )
}

export default CtaBanner
