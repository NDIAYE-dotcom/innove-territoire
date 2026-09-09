import { useEffect, useMemo, useState } from 'react'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import StatusBadge from '../../components/dashboard/StatusBadge'
import useAuth from '../../hooks/useAuth'
import { fetchAllEnrollments, decideEnrollment } from '../../services/formationService'
import { ENROLLMENT_STATUS, getStatusMeta } from '../../utils/statusLabels'

const STATUS_OPTIONS = Object.keys(ENROLLMENT_STATUS)

function AdminEnrollments() {
  const { user } = useAuth()
  const [state, setState] = useState({ status: 'loading', enrollments: [] })
  const [statusFilter, setStatusFilter] = useState('pending')
  const [busyId, setBusyId] = useState(null)

  const load = () => {
    fetchAllEnrollments().then(({ data, error }) => {
      setState(error ? { status: 'error', enrollments: [] } : { status: 'ready', enrollments: data ?? [] })
    })
  }

  useEffect(load, [])

  const filteredEnrollments = useMemo(() => {
    if (statusFilter === 'all') return state.enrollments
    return state.enrollments.filter((e) => e.status === statusFilter)
  }, [state.enrollments, statusFilter])

  const handleDecision = async (enrollment, status) => {
    setBusyId(enrollment.id)
    const { error } = await decideEnrollment(enrollment.id, status, user?.id)
    setBusyId(null)
    if (!error) load()
  }

  if (state.status === 'loading') {
    return <Loader fullPage label="Chargement des inscriptions..." />
  }

  if (state.status === 'error') {
    return <ErrorState onRetry={load} />
  }

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <span className="section-eyebrow">SuperAdmin</span>
          <h1>Inscriptions aux formations</h1>
          <p>Validez ou refusez les demandes d'inscription des clients.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <option value="all">Tous les statuts</option>
          {STATUS_OPTIONS.map((key) => (
            <option key={key} value={key}>
              {ENROLLMENT_STATUS[key].label}
            </option>
          ))}
        </select>
      </div>

      {filteredEnrollments.length === 0 ? (
        <EmptyState title="Aucune inscription" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Formation</th>
                <th>Statut</th>
                <th>Demandée le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map((enrollment) => {
                const meta = getStatusMeta(ENROLLMENT_STATUS, enrollment.status)
                const isPending = enrollment.status === 'pending'
                return (
                  <tr key={enrollment.id}>
                    <td className="admin-table-wrap-cell">
                      {enrollment.profiles?.first_name} {enrollment.profiles?.last_name}
                      <br />
                      {enrollment.profiles?.email}
                    </td>
                    <td>{enrollment.formations?.title || '—'}</td>
                    <td>
                      <StatusBadge label={meta.label} tone={meta.tone} />
                    </td>
                    <td>{new Date(enrollment.requested_at).toLocaleDateString('fr-FR')}</td>
                    <td>
                      {isPending ? (
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-link-action"
                            disabled={busyId === enrollment.id}
                            onClick={() => handleDecision(enrollment, 'approved')}
                          >
                            Approuver
                          </button>
                          <button
                            type="button"
                            className="admin-link-action admin-link-action--danger"
                            disabled={busyId === enrollment.id}
                            onClick={() => handleDecision(enrollment, 'rejected')}
                          >
                            Refuser
                          </button>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminEnrollments
