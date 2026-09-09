import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/dashboard/StatCard'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import useAuth from '../../hooks/useAuth'
import { fetchMyEnrollments } from '../../services/formationService'
import { fetchMyServiceRequests } from '../../services/serviceRequestService'
import { fetchMyNotifications } from '../../services/userService'
import './ClientDashboard.css'

function ClientDashboard() {
  const { user, profile } = useAuth()
  const [state, setState] = useState({ status: 'loading', enrollments: [], requests: [], notifications: [] })

  useEffect(() => {
    if (!user) return

    let isMounted = true

    async function load() {
      const [enrollmentsRes, requestsRes, notificationsRes] = await Promise.all([
        fetchMyEnrollments(user.id),
        fetchMyServiceRequests(user.id),
        fetchMyNotifications(user.id),
      ])

      if (!isMounted) return

      if (enrollmentsRes.error || requestsRes.error || notificationsRes.error) {
        setState((current) => ({ ...current, status: 'error' }))
        return
      }

      setState({
        status: 'ready',
        enrollments: enrollmentsRes.data ?? [],
        requests: requestsRes.data ?? [],
        notifications: notificationsRes.data ?? [],
      })
    }

    load()

    return () => {
      isMounted = false
    }
  }, [user])

  if (state.status === 'loading') {
    return <Loader fullPage label="Chargement de votre tableau de bord..." />
  }

  if (state.status === 'error') {
    return <ErrorState onRetry={() => window.location.reload()} />
  }

  const approvedEnrollments = state.enrollments.filter((e) => e.status === 'approved')
  const nextCourse = approvedEnrollments
    .map((e) => e.formations)
    .filter((f) => f?.start_date)
    .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))[0]

  return (
    <div className="client-dashboard">
      <div className="client-dashboard-header">
        <span className="section-eyebrow">Espace client</span>
        <h1>Bonjour {profile?.first_name || profile?.email}</h1>
      </div>

      <div className="client-dashboard-stats">
        <StatCard label="Mes formations" value={state.enrollments.length} hint={`${approvedEnrollments.length} approuvée(s)`} />
        <StatCard label="Demandes de services" value={state.requests.length} />
        <StatCard label="Notifications" value={state.notifications.filter((n) => !n.is_read).length} hint="non lues" />
      </div>

      <div className="client-dashboard-grid">
        <section className="client-dashboard-panel">
          <h2>Prochain cours</h2>
          {nextCourse ? (
            <div className="client-dashboard-next-course">
              <p className="client-dashboard-next-course-title">{nextCourse.title}</p>
              <p className="client-dashboard-next-course-date">{nextCourse.start_date}</p>
              <Link to="/client/formations">Voir mes formations →</Link>
            </div>
          ) : (
            <EmptyState
              title="Aucun cours à venir"
              description="Inscrivez-vous à une formation pour la voir apparaître ici."
              actionLabel="Voir les formations"
              actionTo="/formations"
            />
          )}
        </section>

        <section className="client-dashboard-panel">
          <h2>Dernières notifications</h2>
          {state.notifications.length === 0 ? (
            <EmptyState title="Aucune notification pour le moment" />
          ) : (
            <ul className="client-dashboard-notifications">
              {state.notifications.map((notification) => (
                <li key={notification.id}>
                  <p className="client-dashboard-notification-title">{notification.title}</p>
                  {notification.message && <p className="client-dashboard-notification-message">{notification.message}</p>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

export default ClientDashboard
