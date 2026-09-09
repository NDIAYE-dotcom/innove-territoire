import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/dashboard/StatCard'
import StatusBadge from '../../components/dashboard/StatusBadge'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import useAuth from '../../hooks/useAuth'
import { fetchAllProfiles } from '../../services/userService'
import { fetchAllServiceRequests } from '../../services/serviceRequestService'
import { fetchAllEnrollments, fetchAllFormations } from '../../services/formationService'
import { SERVICE_REQUEST_STATUS, getStatusMeta } from '../../utils/statusLabels'

function AdminDashboard() {
  const { profile } = useAuth()
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let isMounted = true

    async function load() {
      const [usersRes, requestsRes, enrollmentsRes, formationsRes] = await Promise.all([
        fetchAllProfiles(),
        fetchAllServiceRequests(),
        fetchAllEnrollments(),
        fetchAllFormations(),
      ])

      if (!isMounted) return

      if (usersRes.error || requestsRes.error || enrollmentsRes.error || formationsRes.error) {
        setState({ status: 'error' })
        return
      }

      setState({
        status: 'ready',
        users: usersRes.data ?? [],
        requests: requestsRes.data ?? [],
        enrollments: enrollmentsRes.data ?? [],
        formations: formationsRes.data ?? [],
      })
    }

    load()

    return () => {
      isMounted = false
    }
  }, [])

  if (state.status === 'loading') {
    return <Loader fullPage label="Chargement du tableau de bord..." />
  }

  if (state.status === 'error') {
    return <ErrorState onRetry={() => window.location.reload()} />
  }

  const pendingEnrollments = state.enrollments.filter((e) => e.status === 'pending')
  const newRequests = state.requests.filter((r) => r.status === 'new')
  const publishedFormations = state.formations.filter((f) => f.status === 'published')
  const recentRequests = state.requests.slice(0, 5)

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <span className="section-eyebrow">SuperAdmin</span>
          <h1>Bonjour {profile?.first_name || profile?.email}</h1>
          <p>Vue d'ensemble de l'activité du cabinet.</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <StatCard label="Utilisateurs" value={state.users.length} />
        <StatCard label="Demandes nouvelles" value={newRequests.length} hint={`${state.requests.length} au total`} />
        <StatCard label="Inscriptions à valider" value={pendingEnrollments.length} hint={`${state.enrollments.length} au total`} />
        <StatCard label="Formations publiées" value={publishedFormations.length} hint={`${state.formations.length} au total`} />
      </div>

      <div className="admin-panel">
        <h2>Dernières demandes de service</h2>
        {recentRequests.length === 0 ? (
          <EmptyState title="Aucune demande pour le moment" />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Référence</th>
                  <th>Nom</th>
                  <th>Objet</th>
                  <th>Statut</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((request) => {
                  const meta = getStatusMeta(SERVICE_REQUEST_STATUS, request.status)
                  return (
                    <tr key={request.id}>
                      <td>{request.request_number}</td>
                      <td>
                        {request.first_name} {request.last_name}
                      </td>
                      <td>{request.subject}</td>
                      <td>
                        <StatusBadge label={meta.label} tone={meta.tone} />
                      </td>
                      <td>{new Date(request.created_at).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <p style={{ marginTop: 16 }}>
          <Link to="/admin/demandes" className="admin-link-action">
            Voir toutes les demandes →
          </Link>
        </p>
      </div>
    </div>
  )
}

export default AdminDashboard
