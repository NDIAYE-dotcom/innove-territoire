import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import Loader from '../components/common/Loader'
import ErrorState from '../components/common/ErrorState'
import Button from '../components/common/Button'
import useAuth from '../hooks/useAuth'
import './EnrollmentGuard.css'
import { fetchFormationBySlug, fetchMyEnrollmentForFormation } from '../services/formationService'

// Vérifie, en plus de l'authentification (déjà gérée par ClientRoute), que
// l'utilisateur a une inscription approuvée pour CETTE formation précise —
// un contrôle par formation que ClientRoute ne peut pas faire seul. La
// véritable barrière reste RLS côté Supabase (formation_modules/lessons ne
// sont de toute façon lisibles que par un inscrit approuvé) : ce garde n'est
// qu'un confort UX pour afficher un message clair plutôt qu'un espace vide.
function EnrollmentGuard({ children }) {
  const { slug } = useParams()
  const { user } = useAuth()
  const [state, setState] = useState({ status: 'loading' })

  useEffect(() => {
    let isMounted = true

    async function check() {
      const { data: formation, error: formationError } = await fetchFormationBySlug(slug)

      if (!isMounted) return

      if (formationError || !formation) {
        setState({ status: 'not-found' })
        return
      }

      const { data: enrollment } = await fetchMyEnrollmentForFormation(user.id, formation.id)

      if (!isMounted) return

      const allowed = enrollment && (enrollment.status === 'approved' || enrollment.status === 'completed')
      setState(allowed ? { status: 'allowed' } : { status: 'denied', formation })
    }

    check()

    return () => {
      isMounted = false
    }
  }, [slug, user])

  if (state.status === 'loading') {
    return <Loader fullPage label="Vérification de votre accès..." />
  }

  if (state.status === 'not-found') {
    return <Navigate to="/formations" replace />
  }

  if (state.status === 'denied') {
    return (
      <div className="section">
        <div className="container">
          <ErrorState
            title="Accès non autorisé"
            description="Vous devez avoir une inscription approuvée pour accéder à cette salle de cours."
          />
          <div className="enrollment-guard-action">
            <Button to={`/formations/${slug}`} variant="outline">
              Voir la formation
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return children
}

export default EnrollmentGuard
