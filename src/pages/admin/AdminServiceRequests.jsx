import { useEffect, useMemo, useState } from 'react'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import StatusBadge from '../../components/dashboard/StatusBadge'
import useAuth from '../../hooks/useAuth'
import {
  fetchAllServiceRequests,
  fetchServiceRequestMessages,
  updateServiceRequestStatus,
  sendAdminMessage,
} from '../../services/serviceRequestService'
import { SERVICE_REQUEST_STATUS, getStatusMeta } from '../../utils/statusLabels'
import { getSignedUrl } from '../../services/storageService'
import '../client/MyMessages.css'

const STATUS_OPTIONS = Object.keys(SERVICE_REQUEST_STATUS)

function AdminServiceRequests() {
  const { user } = useAuth()
  const [state, setState] = useState({ status: 'loading', requests: [] })
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const load = () => {
    fetchAllServiceRequests().then(({ data, error }) => {
      setState(error ? { status: 'error', requests: [] } : { status: 'ready', requests: data ?? [] })
    })
  }

  useEffect(load, [])

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return state.requests
    return state.requests.filter((r) => r.status === statusFilter)
  }, [state.requests, statusFilter])

  if (state.status === 'loading') {
    return <Loader fullPage label="Chargement des demandes..." />
  }

  if (state.status === 'error') {
    return <ErrorState onRetry={load} />
  }

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <span className="section-eyebrow">SuperAdmin</span>
          <h1>Demandes de service</h1>
          <p>Toutes les demandes envoyées depuis le site public.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">Tous les statuts</option>
          {STATUS_OPTIONS.map((key) => (
            <option key={key} value={key}>
              {SERVICE_REQUEST_STATUS[key].label}
            </option>
          ))}
        </select>
      </div>

      {filteredRequests.length === 0 ? (
        <EmptyState title="Aucune demande" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Nom</th>
                <th>Prestation</th>
                <th>Statut</th>
                <th>Date</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((request) => {
                const meta = getStatusMeta(SERVICE_REQUEST_STATUS, request.status)
                return (
                  <tr key={request.id}>
                    <td>{request.request_number}</td>
                    <td>
                      {request.first_name} {request.last_name}
                    </td>
                    <td>{request.services?.title || '—'}</td>
                    <td>
                      <StatusBadge label={meta.label} tone={meta.tone} />
                    </td>
                    <td>{new Date(request.created_at).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <button type="button" className="admin-link-action" onClick={() => setSelected(request)}>
                        Voir
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <RequestDetailModal
        request={selected}
        onClose={() => setSelected(null)}
        onUpdated={() => {
          load()
        }}
        adminId={user?.id}
      />
    </div>
  )
}

function RequestDetailModal({ request, onClose, onUpdated, adminId }) {
  if (!request) return null

  // Remonté (via key) à chaque changement de demande sélectionnée : évite de
  // resynchroniser messages/statut avec un useEffect + setState (cf. Profile.jsx).
  return <RequestDetailModalContent key={request.id} request={request} onClose={onClose} onUpdated={onUpdated} adminId={adminId} />
}

function RequestDetailModalContent({ request, onClose, onUpdated, adminId }) {
  const [messages, setMessages] = useState([])
  const [messagesStatus, setMessagesStatus] = useState('loading')
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [statusValue, setStatusValue] = useState(request.status)
  const [statusSaving, setStatusSaving] = useState(false)
  const [openingAttachment, setOpeningAttachment] = useState(false)
  const [attachmentError, setAttachmentError] = useState('')

  useEffect(() => {
    fetchServiceRequestMessages(request.id).then(({ data, error }) => {
      setMessagesStatus(error ? 'error' : 'ready')
      setMessages(data ?? [])
    })
  }, [request.id])

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value
    setStatusValue(newStatus)
    setStatusSaving(true)
    const { error } = await updateServiceRequestStatus(request.id, newStatus)
    setStatusSaving(false)
    if (!error) onUpdated()
  }

  const handleOpenAttachment = async () => {
    // Ouvre l'onglet tout de suite (synchrone, dans le même geste utilisateur)
    // puis y navigue une fois l'URL signée prête — un window.open() après un
    // await est fréquemment bloqué par les navigateurs comme pop-up. Note :
    // passer "noopener" ici ferait retourner null (pas de handle à naviguer
    // ensuite) — on l'omet volontairement pour ce cas précis.
    const tab = window.open('', '_blank')
    setOpeningAttachment(true)
    setAttachmentError('')
    // Le bucket "documents" est privé — attachment_url stocke le chemin, pas
    // une URL publique (qui produirait un lien mort/404, RLS bloquant sans
    // signature). On génère une URL signée à la demande, valable 1h.
    const { url, error } = await getSignedUrl('documents', request.attachment_url)
    setOpeningAttachment(false)
    if (error || !url || !tab) {
      tab?.close()
      setAttachmentError("Impossible d'ouvrir ce fichier.")
      return
    }
    tab.location.href = url
  }

  const handleSendReply = async (event) => {
    event.preventDefault()
    if (!reply.trim() || sending) return
    setSending(true)
    const { data, error } = await sendAdminMessage(request.id, adminId, reply.trim())
    setSending(false)
    if (!error && data) {
      setMessages((current) => [...current, data])
      setReply('')
    }
  }

  return (
    <Modal isOpen onClose={onClose} title={request.request_number} size="lg">
      <div className="admin-form">
        <div className="admin-form-row">
          <div>
            <label>Demandeur</label>
            <p>
              {request.first_name} {request.last_name} — {request.email}
              {request.phone ? ` — ${request.phone}` : ''}
            </p>
          </div>
          <div>
            <label>Statut</label>
            <select value={statusValue} onChange={handleStatusChange} disabled={statusSaving}>
              {STATUS_OPTIONS.map((key) => (
                <option key={key} value={key}>
                  {SERVICE_REQUEST_STATUS[key].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label>Organisation / fonction</label>
          <p>{[request.organization, request.function_title].filter(Boolean).join(' — ') || '—'}</p>
        </div>

        <div>
          <label>Prestation / domaine</label>
          <p>{[request.services?.title, request.domains?.title].filter(Boolean).join(' — ') || '—'}</p>
        </div>

        <div>
          <label>Objet</label>
          <p>{request.subject}</p>
        </div>

        <div>
          <label>Description</label>
          <p style={{ whiteSpace: 'pre-wrap' }}>{request.description}</p>
        </div>

        {request.budget_indicative && (
          <div>
            <label>Budget indicatif</label>
            <p>{request.budget_indicative}</p>
          </div>
        )}

        {request.attachment_url && (
          <div>
            <label>Pièce jointe</label>
            <p>
              <button type="button" className="admin-link-action" onClick={handleOpenAttachment} disabled={openingAttachment}>
                {openingAttachment ? 'Ouverture...' : 'Ouvrir le fichier'}
              </button>
            </p>
            {attachmentError && <p className="form-error">{attachmentError}</p>}
          </div>
        )}

        <div className="admin-panel" style={{ padding: 16 }}>
          <h2 style={{ fontSize: '1rem' }}>Échanges</h2>
          {messagesStatus === 'loading' && <Loader label="Chargement..." />}
          {messagesStatus === 'ready' && messages.length === 0 && <p>Aucun message pour l'instant.</p>}
          {messagesStatus === 'ready' && messages.length > 0 && (
            <div className="messages-list">
              {messages.map((message) => (
                <article key={message.id} className={`message-card message-card--${message.sender_role}`}>
                  <div className="message-card-header">
                    <span className="message-card-sender">{message.sender_role === 'admin' ? 'Le cabinet' : 'Client'}</span>
                  </div>
                  <p className="message-card-text">{message.message}</p>
                  <p className="message-card-date">{new Date(message.created_at).toLocaleString('fr-FR')}</p>
                </article>
              ))}
            </div>
          )}

          <form onSubmit={handleSendReply} style={{ marginTop: 16 }}>
            <textarea
              placeholder="Répondre au client..."
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              rows={3}
            />
            <div className="admin-form-actions">
              <Button type="submit" variant="primary" size="sm" loading={sending} disabled={!reply.trim()}>
                Envoyer
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  )
}

export default AdminServiceRequests
