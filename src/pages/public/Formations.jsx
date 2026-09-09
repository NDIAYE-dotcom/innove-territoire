import { useEffect, useState } from 'react'
import MainLayout from '../../components/layout/MainLayout'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import FormationCard from '../../components/formations/FormationCard'
import { fetchPublishedFormations } from '../../services/formationService'
import './Formations.css'

function Formations() {
  const [state, setState] = useState({ status: 'loading', formations: [] })

  useEffect(() => {
    let isMounted = true

    fetchPublishedFormations().then(({ data, error }) => {
      if (!isMounted) return
      setState(error ? { status: 'error', formations: [] } : { status: 'ready', formations: data ?? [] })
    })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <MainLayout>
      <section className="formations-hero">
        <div className="container">
          <span className="section-eyebrow">E-learning</span>
          <h1>Catalogue des formations</h1>
          <p className="formations-hero-text">
            Des formations, ateliers et séminaires pour renforcer les capacités des acteurs locaux.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {state.status === 'loading' && <Loader label="Chargement du catalogue..." />}
          {state.status === 'error' && <ErrorState onRetry={() => window.location.reload()} />}

          {state.status === 'ready' && state.formations.length === 0 && (
            <EmptyState
              title="Aucune formation disponible pour le moment"
              description="Le catalogue sera publié dès l'ouverture de l'espace e-learning. Revenez prochainement."
              actionLabel="Nous contacter"
              actionTo="/contact"
            />
          )}

          {state.status === 'ready' && state.formations.length > 0 && (
            <div className="formations-grid">
              {state.formations.map((formation) => (
                <FormationCard formation={formation} key={formation.id} />
              ))}
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  )
}

export default Formations
