import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import Loader from '../components/common/Loader'

function AdminRoute({ children }) {
  const { user, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <Loader fullPage label="Vérification de la session..." />
  }

  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />
  }

  // La vraie protection est côté Supabase (RLS) — cette redirection n'est
  // qu'un confort UX, jamais la seule barrière de sécurité.
  if (role !== 'superadmin') {
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
