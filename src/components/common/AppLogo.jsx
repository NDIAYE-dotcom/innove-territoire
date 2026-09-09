import { Link } from 'react-router-dom'
import './AppLogo.css'

// variant="light" applique un filtre CSS (silhouette blanche) pour les fonds
// sombres (sidebar SuperAdmin, footer) — le fichier logo lui-même n'est
// jamais modifié, voir docs/workflow : le logo officiel ne doit pas être altéré.
function AppLogo({ variant = 'dark' }) {
  return (
    <Link to="/" className={`app-logo app-logo--${variant}`} aria-label="Innov'Territoires — Accueil">
      <img src="/assets/logo-innov-territoires.png" alt="Innov'Territoires" className="app-logo-image" />
    </Link>
  )
}

export default AppLogo
