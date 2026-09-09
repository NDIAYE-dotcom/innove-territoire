import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import Loader from '../components/common/Loader'

function ProtectedRoute({ children }) {
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

export default ProtectedRoute
