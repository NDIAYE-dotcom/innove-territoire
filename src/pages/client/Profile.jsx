import { useState } from 'react'
import SuccessMessage from '../../components/common/SuccessMessage'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import useAuth from '../../hooks/useAuth'
import { updateProfile } from '../../services/userService'
import './Profile.css'

const FIELDS = [
  { name: 'first_name', label: 'Prénom' },
  { name: 'last_name', label: 'Nom' },
  { name: 'phone', label: 'Téléphone' },
  { name: 'organization', label: 'Organisation' },
  { name: 'function_title', label: 'Fonction' },
]

function Profile() {
  const { profile } = useAuth()

  if (!profile) {
    return <Loader label="Chargement de votre profil..." />
  }

  // Remonté (via key) à chaque changement de profil : évite de resynchroniser
  // l'état local du formulaire avec un useEffect + setState.
  return <ProfileForm key={profile.id} profile={profile} />
}

function ProfileForm({ profile }) {
  const { user, refreshProfile } = useAuth()
  const [form, setForm] = useState({
    first_name: profile.first_name || '',
    last_name: profile.last_name || '',
    phone: profile.phone || '',
    organization: profile.organization || '',
    function_title: profile.function_title || '',
  })
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setStatus('idle')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'submitting') return

    setStatus('submitting')
    setError('')

    const { error: updateError } = await updateProfile(user.id, form)

    if (updateError) {
      setError("Une erreur est survenue lors de l'enregistrement. Merci de réessayer.")
      setStatus('idle')
      return
    }

    await refreshProfile()
    setStatus('success')
  }

  return (
    <div>
      <div className="client-page-header">
        <span className="section-eyebrow">Espace client</span>
        <h1>Mon profil</h1>
        <p>Ces informations nous aident à mieux traiter vos demandes.</p>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Email</label>
          <input value={profile?.email || ''} disabled />
        </div>

        <div className="profile-form-row">
          {FIELDS.map((field) => (
            <div className="form-field" key={field.name}>
              <label htmlFor={field.name}>{field.label}</label>
              <input id={field.name} name={field.name} value={form[field.name]} onChange={handleChange} />
            </div>
          ))}
        </div>

        {status === 'success' && <SuccessMessage title="Profil mis à jour." />}
        {error && <p className="form-error form-error--global">{error}</p>}

        <Button type="submit" variant="primary" loading={status === 'submitting'}>
          Enregistrer
        </Button>
      </form>
    </div>
  )
}

export default Profile
