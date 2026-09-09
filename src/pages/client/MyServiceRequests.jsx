import { useEffect, useState } from 'react'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import StatusBadge from '../../components/dashboard/StatusBadge'
import useAuth from '../../hooks/useAuth'
import { fetchMyServiceRequests } from '../../services/serviceRequestService'
import { SERVICE_REQUEST_STATUS, getStatusMeta } from '../../utils/statusLabels'
import './MyServiceRequests.css'

function MyServiceRequests() {
  const { user } = useAuth()
  const [state, setState] = useState({ status: 'loading', requests: [] })

  useEffect(() => {
    if (!user) return
    let isMounted = true

    fetchMyServiceRequests(user.id).then(({ data, error }) => {
      if (!isMounted) return
      setState(error ? { status: 'error', requests: [] } : { status: 'ready', requests: data ?? [] })
    })

    return () => {
      isMounted = false
    }
  }, [user])

  return (
    <div>
      <div className="client-page-header">
        <span className="section-eyebrow">Espace client</span>
        <h1>Mes demandes</h1>
        <p>Suivez l'état de vos demandes de service envoyées au cabinet.</p>
      </div>

      {state.status === 'loading' && <Loader label="Chargement de vos demandes..." />}
      {state.status === 'error' && <ErrorState onRetry={() => window.location.reload()} />}

      {state.status === 'ready' && state.requests.length === 0 && (
        <EmptyState
          title="Aucune demande pour le moment"
          description="Vos demandes de service apparaîtront ici une fois envoyées."
          actionLabel="Demander un accompagnement"
          actionTo="/contact"
        />
      )}

      {state.status === 'ready' && state.requests.length > 0 && (
        <div className="service-requests-list">
          {state.requests.map((request) => {
            const meta = getStatusMeta(SERVICE_REQUEST_STATUS, request.status)
            return (
              <article className="service-request-card" key={request.id}>
                <div className="service-request-card-header">
                  <span className="service-request-number">{request.request_number}</span>
                  <StatusBadge label={meta.label} tone={meta.tone} />
                </div>
                <p className="service-request-subject">{request.subject}</p>
                {request.services?.title && <p className="service-request-service">{request.services.title}</p>}
                <p className="service-request-date">
                  Envoyée le {new Date(request.created_at).toLocaleDateString('fr-FR')}
                </p>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default MyServiceRequests
