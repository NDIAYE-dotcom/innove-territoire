import { useEffect, useState } from 'react'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import useAuth from '../../hooks/useAuth'
import { fetchAllMyMessages } from '../../services/serviceRequestService'
import './MyMessages.css'

function MyMessages() {
  const { user } = useAuth()
  const [state, setState] = useState({ status: 'loading', messages: [] })

  useEffect(() => {
    if (!user) return
    let isMounted = true

    fetchAllMyMessages(user.id).then(({ data, error }) => {
      if (!isMounted) return
      setState(error ? { status: 'error', messages: [] } : { status: 'ready', messages: data ?? [] })
    })

    return () => {
      isMounted = false
    }
  }, [user])

  return (
    <div>
      <div className="client-page-header">
        <span className="section-eyebrow">Espace client</span>
        <h1>Mes messages</h1>
        <p>Historique des échanges avec le cabinet au sujet de vos demandes.</p>
      </div>

      {state.status === 'loading' && <Loader label="Chargement de vos messages..." />}
      {state.status === 'error' && <ErrorState onRetry={() => window.location.reload()} />}

      {state.status === 'ready' && state.messages.length === 0 && (
        <EmptyState title="Aucun message pour le moment" description="Les réponses du cabinet à vos demandes apparaîtront ici." />
      )}

      {state.status === 'ready' && state.messages.length > 0 && (
        <div className="messages-list">
          {state.messages.map((message) => (
            <article key={message.id} className={`message-card message-card--${message.sender_role}`}>
              <div className="message-card-header">
                <span className="message-card-sender">{message.sender_role === 'admin' ? 'Le cabinet' : 'Vous'}</span>
                <span className="message-card-request">{message.service_requests?.request_number}</span>
              </div>
              <p className="message-card-subject">{message.service_requests?.subject}</p>
              <p className="message-card-text">{message.message}</p>
              <p className="message-card-date">{new Date(message.created_at).toLocaleString('fr-FR')}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default MyMessages
