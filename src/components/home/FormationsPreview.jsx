import EmptyState from '../common/EmptyState'
import Reveal from '../common/Reveal'
import './FormationsPreview.css'

function FormationsPreview() {
  return (
    <section className="section formations-preview">
      <div className="container">
        <Reveal as="div" direction="up" className="section-header">
          <span className="section-eyebrow">E-learning</span>
          <h2>Formations</h2>
          <p>Un espace de formation dédié aux acteurs territoriaux, bientôt disponible.</p>
        </Reveal>

        <Reveal as="div" direction="up" delay={100}>
          <EmptyState
            title="Aucune formation disponible pour le moment"
            description="Le catalogue de formations sera publié ici dès son ouverture."
            actionLabel="Voir l'espace formations"
            actionTo="/formations"
          />
        </Reveal>
      </div>
    </section>
  )
}

export default FormationsPreview
