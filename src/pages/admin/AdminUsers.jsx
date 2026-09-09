import { useEffect, useMemo, useState } from 'react'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import ConfirmModal from '../../components/common/ConfirmModal'
import useAuth from '../../hooks/useAuth'
import { fetchAllProfiles, fetchRoles, updateUserRole, updateUserActive } from '../../services/userService'

function AdminUsers() {
  const { user: currentUser } = useAuth()
  const [state, setState] = useState({ status: 'loading', users: [], roles: [] })
  const [search, setSearch] = useState('')
  const [pendingAction, setPendingAction] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const load = () => {
    Promise.all([fetchAllProfiles(), fetchRoles()]).then(([usersRes, rolesRes]) => {
      if (usersRes.error || rolesRes.error) {
        setState({ status: 'error', users: [], roles: [] })
        return
      }
      setState({ status: 'ready', users: usersRes.data ?? [], roles: rolesRes.data ?? [] })
    })
  }

  useEffect(load, [])

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return state.users
    return state.users.filter((u) =>
      [u.email, u.first_name, u.last_name, u.organization].filter(Boolean).join(' ').toLowerCase().includes(q)
    )
  }, [state.users, search])

  const superadminRole = state.roles.find((r) => r.key === 'superadmin')
  const clientRole = state.roles.find((r) => r.key === 'client')

  const handleRoleToggle = async (targetUser) => {
    const isSuperadmin = targetUser.roles?.key === 'superadmin'
    const nextRole = isSuperadmin ? clientRole : superadminRole
    if (!nextRole) return

    setBusyId(targetUser.id)
    const { error } = await updateUserRole(targetUser.id, nextRole.id)
    setBusyId(null)
    if (!error) load()
  }

  const handleToggleActive = async (targetUser) => {
    setBusyId(targetUser.id)
    const { error } = await updateUserActive(targetUser.id, !targetUser.is_active)
    setBusyId(null)
    if (!error) load()
  }

  if (state.status === 'loading') {
    return <Loader fullPage label="Chargement des utilisateurs..." />
  }

  if (state.status === 'error') {
    return <ErrorState onRetry={load} />
  }

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <span className="section-eyebrow">SuperAdmin</span>
          <h1>Utilisateurs</h1>
          <p>Comptes clients et SuperAdmins de la plateforme.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          type="search"
          placeholder="Rechercher un utilisateur..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState title="Aucun utilisateur trouvé" />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Organisation</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Inscrit le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isSelf = u.id === currentUser?.id
                const isSuperadmin = u.roles?.key === 'superadmin'
                return (
                  <tr key={u.id}>
                    <td className="admin-table-wrap-cell">
                      <strong>
                        {u.first_name} {u.last_name}
                      </strong>
                      <br />
                      {u.email}
                    </td>
                    <td>{u.organization || '—'}</td>
                    <td>{u.roles?.label || '—'}</td>
                    <td>{u.is_active ? 'Actif' : 'Désactivé'}</td>
                    <td>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-link-action"
                          disabled={isSelf || busyId === u.id}
                          onClick={() => handleRoleToggle(u)}
                        >
                          {isSuperadmin ? 'Rétrograder en client' : 'Promouvoir SuperAdmin'}
                        </button>
                        <button
                          type="button"
                          className={`admin-link-action ${u.is_active ? 'admin-link-action--danger' : ''}`}
                          disabled={isSelf || busyId === u.id}
                          onClick={() => setPendingAction(u)}
                        >
                          {u.is_active ? 'Désactiver' : 'Réactiver'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        onConfirm={async () => {
          await handleToggleActive(pendingAction)
          setPendingAction(null)
        }}
        title={pendingAction?.is_active ? 'Désactiver ce compte ?' : 'Réactiver ce compte ?'}
        description={
          pendingAction?.is_active
            ? "L'utilisateur ne pourra plus se connecter tant que le compte est désactivé."
            : "L'utilisateur pourra de nouveau se connecter."
        }
        confirmLabel={pendingAction?.is_active ? 'Désactiver' : 'Réactiver'}
        variant={pendingAction?.is_active ? 'danger' : 'primary'}
        loading={busyId === pendingAction?.id}
      />
    </div>
  )
}

export default AdminUsers
