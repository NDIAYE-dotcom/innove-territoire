import './FormationInfo.css'

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString('fr-FR') : null
}

function formatTime(time) {
  return time ? time.slice(0, 5) : null
}

function FormationInfo({ formation, children }) {
  const objectives = Array.isArray(formation.objectives) ? formation.objectives : []

  const practicalDetails = [
    { label: 'Dates', value: [formatDate(formation.start_date), formatDate(formation.end_date)].filter(Boolean).join(' — ') },
    { label: 'Horaires', value: [formatTime(formation.start_time), formatTime(formation.end_time)].filter(Boolean).join(' — ') },
    { label: 'Durée', value: formation.duration },
    { label: 'Places', value: formation.seats_total ? `${formation.seats_total} places` : null },
    { label: 'Prix', value: formation.price != null ? `${formation.price} FCFA` : null },
    { label: 'Formateur', value: formation.instructor_name },
  ].filter((item) => item.value)

  return (
    <section className="section">
      <div className="container formation-info-grid">
        <div className="formation-info-main">
          {formation.full_description && (
            <div className="formation-info-block">
              <h2>Présentation</h2>
              <p>{formation.full_description}</p>
            </div>
          )}

          {objectives.length > 0 && (
            <div className="formation-info-block">
              <h2>Objectifs</h2>
              <ul className="formation-info-list">
                {objectives.map((objective) => (
                  <li key={objective}>{objective}</li>
                ))}
              </ul>
            </div>
          )}

          {formation.target_audience && (
            <div className="formation-info-block">
              <h2>Public cible</h2>
              <p>{formation.target_audience}</p>
            </div>
          )}

          {formation.prerequisites && (
            <div className="formation-info-block">
              <h2>Prérequis</h2>
              <p>{formation.prerequisites}</p>
            </div>
          )}
        </div>

        <aside className="formation-info-sidebar">
          {practicalDetails.length > 0 && (
            <>
              <h2>Informations pratiques</h2>
              <dl>
                {practicalDetails.map((item) => (
                  <div className="formation-info-sidebar-row" key={item.label}>
                    <dt>{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}
          {children}
        </aside>
      </div>
    </section>
  )
}

export default FormationInfo
