import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import Loader from '../components/common/Loader'

// Distincte de ProtectedRoute pour pouvoir, plus tard, restreindre l'espace
// client à des rôles précis (ex. exclure formateur/manager) sans toucher aux
// autres routes protégées.
function ClientRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <Loader fullPage label="Vérification de la session..." />
  }

  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />
  }

  return children
}

export default ClientRoute
