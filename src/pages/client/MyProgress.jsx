import { useEffect, useState } from 'react'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import useAuth from '../../hooks/useAuth'
import { fetchMyEnrollments } from '../../services/formationService'
import './MyProgress.css'

function MyProgress() {
  const { user } = useAuth()
  const [state, setState] = useState({ status: 'loading', enrollments: [] })

  useEffect(() => {
    if (!user) return
    let isMounted = true

    fetchMyEnrollments(user.id).then(({ data, error }) => {
      if (!isMounted) return
      const approved = (data ?? []).filter((enrollment) => enrollment.status === 'approved')
      setState(error ? { status: 'error', enrollments: [] } : { status: 'ready', enrollments: approved })
    })

    return () => {
      isMounted = false
    }
  }, [user])

  return (
    <div>
      <div className="client-page-header">
        <span className="section-eyebrow">Espace client</span>
        <h1>Ma progression</h1>
        <p>Suivez votre avancement dans les formations auxquelles vous êtes inscrit.</p>
      </div>

      {state.status === 'loading' && <Loader label="Chargement de votre progression..." />}
      {state.status === 'error' && <ErrorState onRetry={() => window.location.reload()} />}

      {state.status === 'ready' && state.enrollments.length === 0 && (
        <EmptyState
          title="Aucune formation en cours"
          description="Votre progression apparaîtra ici une fois inscrit à une formation approuvée."
          actionLabel="Voir le catalogue"
          actionTo="/formations"
        />
      )}

      {state.status === 'ready' && state.enrollments.length > 0 && (
        <div className="progress-list">
          {state.enrollments.map((enrollment) => (
            <article className="progress-card" key={enrollment.id}>
              <div className="progress-card-header">
                <h3>{enrollment.formations?.title}</h3>
                <span className="progress-card-percent">0%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: '0%' }} />
              </div>
              <p className="progress-card-note">Le suivi détaillé des leçons sera disponible avec l'ouverture de la salle de cours.</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyProgress
