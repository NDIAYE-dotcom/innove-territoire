import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import FormationHero from '../../components/formations/FormationHero'
import FormationInfo from '../../components/formations/FormationInfo'
import FormationEnrollment from '../../components/formations/FormationEnrollment'
import useAuth from '../../hooks/useAuth'
import { fetchFormationBySlug, fetchMyEnrollmentForFormation } from '../../services/formationService'
import NotFound from './NotFound'

function FormationDetail() {
  const { slug } = useParams()
  const { user, loading: authLoading } = useAuth()
  const [state, setState] = useState({ status: 'loading', formation: null, enrollment: null })

  useEffect(() => {
    if (authLoading) return
    let isMounted = true

    async function load() {
      const { data: formation, error } = await fetchFormationBySlug(slug)

      if (!isMounted) return

      if (error || !formation) {
        setState({ status: error ? 'error' : 'not-found', formation: null, enrollment: null })
        return
      }

      let enrollment = null
      if (user) {
        const { data } = await fetchMyEnrollmentForFormation(user.id, formation.id)
        enrollment = data ?? null
      }

      if (!isMounted) return
      setState({ status: 'ready', formation, enrollment })
    }

    load()

    return () => {
      isMounted = false
    }
  }, [slug, user, authLoading])

  if (state.status === 'loading' || authLoading) {
    return (
      <MainLayout>
        <Loader fullPage label="Chargement de la formation..." />
      </MainLayout>
    )
  }

  if (state.status === 'not-found') {
    return <NotFound />
  }

  if (state.status === 'error') {
    return (
      <MainLayout>
        <ErrorState onRetry={() => window.location.reload()} />
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <FormationHero formation={state.formation} />
      <FormationInfo formation={state.formation}>
        <FormationEnrollment
          formation={state.formation}
          enrollment={state.enrollment}
          onEnrolled={(enrollment) => setState((current) => ({ ...current, enrollment }))}
        />
      </FormationInfo>
    </MainLayout>
  )
}

export default FormationDetail
