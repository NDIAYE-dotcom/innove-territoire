import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '../common/Button'
import StatusBadge from '../dashboard/StatusBadge'
import useAuth from '../../hooks/useAuth'
import { createEnrollment } from '../../services/formationService'
import { ENROLLMENT_STATUS, getStatusMeta } from '../../utils/statusLabels'
import './FormationEnrollment.css'

function FormationEnrollment({ formation, enrollment, onEnrolled }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const handleEnroll = async () => {
    if (status === 'submitting') return
    setStatus('submitting')
    setError('')

    const { data, error: enrollError } = await createEnrollment(user.id, formation.id)

    if (enrollError) {
      setError("Une erreur est survenue. Merci de réessayer.")
      setStatus('idle')
      return
    }

    onEnrolled(data)
    setStatus('idle')
  }

  if (!user) {
    return (
      <div className="formation-enrollment formation-enrollment--guest">
        <p>Connectez-vous ou créez un compte pour vous inscrire à cette formation.</p>
        <div className="formation-enrollment-actions">
          <Button variant="primary" onClick={() => navigate('/connexion', { state: { from: location } })}>
            Se connecter
          </Button>
          <Button variant="outline" onClick={() => navigate('/inscription', { state: { from: location } })}>
            Créer un compte
          </Button>
        </div>
      </div>
    )
  }

  if (enrollment?.status === 'approved' || enrollment?.status === 'completed') {
    return (
      <div className="formation-enrollment">
        <StatusBadge label="Vous êtes inscrit" tone="success" />
        <Button to={`/classe/${formation.slug}`} variant="primary" size="lg" className="formation-enrollment-cta">
          Accéder à la salle de cours
        </Button>
      </div>
    )
  }

  if (enrollment) {
    const meta = getStatusMeta(ENROLLMENT_STATUS, enrollment.status)
    return (
      <div className="formation-enrollment">
        <StatusBadge label={meta.label} tone={meta.tone} />
        <p className="formation-enrollment-note">
          Votre demande d'inscription a été envoyée le {new Date(enrollment.requested_at).toLocaleDateString('fr-FR')}.
        </p>
      </div>
    )
  }

  return (
    <div className="formation-enrollment">
      <Button variant="primary" size="lg" onClick={handleEnroll} loading={status === 'submitting'}>
        S'inscrire à cette formation
      </Button>
      {error && <p className="form-error">{error}</p>}
    </div>
  )
}

export default FormationEnrollment
