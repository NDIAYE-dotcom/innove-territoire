import Button from '../common/Button'
import './Hero.css'

function Hero() {
  return (
    <section className="hero">
      <div className="container hero-inner">
        <span className="section-eyebrow hero-eyebrow">Cabinet de conseil et d'ingénierie territoriale</span>
        <h1 className="hero-title">
          Des territoires plus <span className="hero-title-accent">innovants</span>, cohérents et durables.
        </h1>
        <p className="hero-text">
          Innov'Territoires accompagne les élus locaux, les collectivités territoriales et les acteurs du
          développement local dans la conception, l'analyse, la mise en œuvre et l'évaluation des politiques
          publiques locales.
        </p>

        <div className="hero-actions">
          <Button to="/prestations" variant="primary" size="lg">
            Découvrir nos services
          </Button>
          <Button to="/contact" variant="outline" size="lg">
            Demander un accompagnement
          </Button>
        </div>
      </div>
    </section>
  )
}

export default Hero
