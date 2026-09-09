import { NavLink } from 'react-router-dom'
import AppLogo from '../common/AppLogo'
import useAuth from '../../hooks/useAuth'
import './AdminSidebar.css'

const NAV_ITEMS = [
  { label: 'Tableau de bord', to: '/admin', end: true },
  { label: 'Utilisateurs', to: '/admin/utilisateurs' },
  { label: 'Demandes de service', to: '/admin/demandes' },
  { label: 'Formations', to: '/admin/formations' },
  { label: 'Inscriptions', to: '/admin/inscriptions' },
  { label: 'Contenus', to: '/admin/contenus' },
  { label: 'Médias', to: '/admin/medias' },
  { label: 'Paramètres', to: '/admin/parametres' },
]

function AdminSidebar({ onNavigate, onClose }) {
  const { profile, signOut } = useAuth()

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-brand">
        <div className="admin-sidebar-brand-top">
          <AppLogo variant="light" />
          <button type="button" className="admin-sidebar-close" onClick={onClose} aria-label="Fermer le menu">
            ×
          </button>
        </div>
        <span className="admin-sidebar-tag">SuperAdmin</span>
      </div>

      <nav className="admin-sidebar-nav" aria-label="Navigation SuperAdmin">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) => `admin-sidebar-link ${isActive ? 'admin-sidebar-link--active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <p className="admin-sidebar-user">{profile?.email}</p>
        <button type="button" className="admin-sidebar-logout" onClick={() => signOut()}>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}

export default AdminSidebar
