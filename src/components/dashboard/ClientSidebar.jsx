import { NavLink } from 'react-router-dom'
import AppLogo from '../common/AppLogo'
import useAuth from '../../hooks/useAuth'
import './ClientSidebar.css'

const NAV_ITEMS = [
  { label: 'Tableau de bord', to: '/client', end: true },
  { label: 'Mes formations', to: '/client/formations' },
  { label: 'Ma progression', to: '/client/progression' },
  { label: 'Mes demandes', to: '/client/demandes' },
  { label: 'Mes messages', to: '/client/messages' },
  { label: 'Mon profil', to: '/client/profil' },
  { label: 'Paramètres', to: '/client/parametres' },
]

function ClientSidebar({ onNavigate, onClose }) {
  const { profile, signOut } = useAuth()

  return (
    <aside className="client-sidebar">
      <div className="client-sidebar-brand">
        <AppLogo />
        <button type="button" className="client-sidebar-close" onClick={onClose} aria-label="Fermer le menu">
          ×
        </button>
      </div>

      <nav className="client-sidebar-nav" aria-label="Navigation espace client">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) => `client-sidebar-link ${isActive ? 'client-sidebar-link--active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="client-sidebar-footer">
        <p className="client-sidebar-user">{profile?.email}</p>
        <button type="button" className="client-sidebar-logout" onClick={() => signOut()}>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}

export default ClientSidebar
