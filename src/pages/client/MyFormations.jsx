import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import StatusBadge from '../../components/dashboard/StatusBadge'
import useAuth from '../../hooks/useAuth'
import { fetchMyEnrollments } from '../../services/formationService'
import { ENROLLMENT_STATUS, getStatusMeta } from '../../utils/statusLabels'
import './MyFormations.css'

function MyFormations() {
  const { user } = useAuth()
  const [state, setState] = useState({ status: 'loading', enrollments: [] })

  useEffect(() => {
    if (!user) return
    let isMounted = true

    fetchMyEnrollments(user.id).then(({ data, error }) => {
      if (!isMounted) return
      setState(error ? { status: 'error', enrollments: [] } : { status: 'ready', enrollments: data ?? [] })
    })

    return () => {
      isMounted = false
    }
  }, [user])

  return (
    <div>
      <div className="client-page-header">
        <span className="section-eyebrow">Espace client</span>
        <h1>Mes formations</h1>
        <p>Retrouvez ici les formations auxquelles vous êtes inscrit.</p>
      </div>

      {state.status === 'loading' && <Loader label="Chargement de vos formations..." />}
      {state.status === 'error' && <ErrorState onRetry={() => window.location.reload()} />}

      {state.status === 'ready' && state.enrollments.length === 0 && (
        <EmptyState
          title="Aucune formation pour le moment"
          description="Parcourez le catalogue et inscrivez-vous à une formation."
          actionLabel="Voir le catalogue"
          actionTo="/formations"
        />
      )}

      {state.status === 'ready' && state.enrollments.length > 0 && (
        <div className="my-formations-list">
          {state.enrollments.map((enrollment) => {
            const meta = getStatusMeta(ENROLLMENT_STATUS, enrollment.status)
            return (
              <article className="my-formation-card" key={enrollment.id}>
                <div className="my-formation-card-header">
                  <h3>{enrollment.formations?.title}</h3>
                  <StatusBadge label={meta.label} tone={meta.tone} />
                </div>
                <p className="my-formation-meta">
                  Demande envoyée le {new Date(enrollment.requested_at).toLocaleDateString('fr-FR')}
                </p>
                {enrollment.status === 'approved' && (
                  <Link to={`/formations/${enrollment.formations?.slug}`}>Accéder à la formation →</Link>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyFormations
