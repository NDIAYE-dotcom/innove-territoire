import Button from '../common/Button'
import './ClassroomOverview.css'

function formatSchedule(formation) {
  const parts = []
  if (formation.start_date) {
    const date = new Date(formation.start_date)
    parts.push(date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }))
  }
  if (formation.start_time) {
    parts.push(`à ${formation.start_time.slice(0, 5)}`)
  }
  return parts.length ? parts.join(' ') : null
}

// Écran d'accueil de la salle de cours : donne le contexte (objectifs,
// formateur, prochaine session) avant de plonger dans le contenu — évite que
// l'apprenant tombe directement sur la Leçon 1 sans comprendre la structure
// du cours (retour utilisateur : "l'étudiant vient et il voit tout sans
// comprendre").
function ClassroomOverview({ formation, modules, totalLessons, completedCount, meetLink, unlockedLessonIds, onStart }) {
  const schedule = formatSchedule(formation)

  return (
    <div className="classroom-overview">
      <div className="classroom-overview-header">
        <span className="section-eyebrow">Bienvenue</span>
        <h1>{formation.title}</h1>
        {formation.short_description && <p className="classroom-overview-lead">{formation.short_description}</p>}
      </div>

      <div className="classroom-overview-grid">
        <div className="classroom-overview-main">
          {formation.objectives?.length > 0 && (
            <section className="classroom-overview-card">
              <h2>Objectifs de la formation</h2>
              <ul className="classroom-overview-objectives">
                {formation.objectives.map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="classroom-overview-card">
            <h2>Programme</h2>
            <ol className="classroom-overview-modules">
              {modules.map((module, index) => {
                const isLocked = !module.lessons.some((lesson) => unlockedLessonIds.has(lesson.id))
                return (
                  <li key={module.id} className={isLocked ? 'is-locked' : ''}>
                    <span className="classroom-overview-module-index">{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <p className="classroom-overview-module-title">
                        {module.title}
                        {isLocked && <span className="classroom-overview-module-lock">🔒</span>}
                      </p>
                      <p className="classroom-overview-module-meta">
                        {module.lessons.length} leçon{module.lessons.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>

          <Button variant="primary" size="lg" onClick={onStart}>
            {completedCount > 0 ? 'Reprendre la formation' : 'Commencer la formation'}
          </Button>
        </div>

        <aside className="classroom-overview-side">
          <div className="classroom-overview-stat-card">
            <span className="classroom-overview-stat-value">{completedCount}</span>
            <span className="classroom-overview-stat-label">/ {totalLessons} leçons terminées</span>
          </div>

          {formation.instructor_name && (
            <div className="classroom-overview-instructor">
              <div className="classroom-overview-instructor-avatar">
                {formation.instructor_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="classroom-overview-instructor-label">Votre formateur</p>
                <p className="classroom-overview-instructor-name">{formation.instructor_name}</p>
              </div>
            </div>
          )}

          {meetLink ? (
            <div className="classroom-overview-meet">
              <p className="classroom-overview-meet-label">Session en direct</p>
              {schedule && <p className="classroom-overview-meet-schedule">{schedule}</p>}
              <a href={meetLink} target="_blank" rel="noreferrer" className="classroom-overview-meet-link">
                Rejoindre la session Meet →
              </a>
            </div>
          ) : (
            <div className="classroom-overview-meet classroom-overview-meet--empty">
              <p className="classroom-overview-meet-label">Session en direct</p>
              <p className="classroom-overview-meet-schedule">Aucune session programmée pour le moment.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

export default ClassroomOverview
