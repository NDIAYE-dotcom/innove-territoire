import MainLayout from '../../components/layout/MainLayout'
import Button from '../../components/common/Button'
import {
  CONTEXT,
  POSITIONING,
  GENERAL_OBJECTIVE,
  SPECIFIC_OBJECTIVES,
  BENEFICIARIES,
  INTERVENTION_ZONE,
  PRINCIPLES,
  METHODOLOGY,
} from '../../data/institutionalContent'
import './About.css'

function About() {
  return (
    <MainLayout>
      <section className="about-hero">
        <div className="container">
          <span className="section-eyebrow">À propos</span>
          <h1>Le Cabinet Innov'Territoires</h1>
          <p className="about-hero-text">{POSITIONING}</p>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <div>
            <h2>Contexte et justification</h2>
            <p>{CONTEXT}</p>
          </div>
          <div>
            <h2>Objectif général</h2>
            <p>{GENERAL_OBJECTIVE}</p>
          </div>
        </div>
      </section>

      <section className="section about-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Nos priorités</span>
            <h2>Objectifs spécifiques</h2>
          </div>
          <ul className="about-list about-list--grid">
            {SPECIFIC_OBJECTIVES.map((objective) => (
              <li key={objective}>{objective}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container about-grid">
          <div>
            <h2>Bénéficiaires</h2>
            <ul className="about-list">
              {BENEFICIARIES.map((beneficiary) => (
                <li key={beneficiary}>{beneficiary}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Zone d'intervention</h2>
            <p>{INTERVENTION_ZONE}</p>

            <h2 className="about-methodology-title">Notre méthodologie</h2>
            <ul className="about-list">
              {METHODOLOGY.map((step) => (
                <li key={step.title}>{step.description}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section about-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">Nos engagements</span>
            <h2>Principes</h2>
          </div>
          <div className="about-principles">
            {PRINCIPLES.map((principle) => (
              <div className="about-principle" key={principle.title}>
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section text-center">
        <div className="container">
          <h2>Envie d'échanger sur votre territoire ?</h2>
          <p className="about-cta-text">
            Contactez le cabinet pour évoquer vos besoins en conseil et en ingénierie territoriale.
          </p>
          <Button to="/contact" variant="primary" size="lg">
            Nous contacter
          </Button>
        </div>
      </section>
    </MainLayout>
  )
}

export default About
