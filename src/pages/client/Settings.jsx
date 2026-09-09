import { useState } from 'react'
import SuccessMessage from '../../components/common/SuccessMessage'
import Button from '../../components/common/Button'
import useAuth from '../../hooks/useAuth'
import './Settings.css'

function validate(form) {
  const errors = {}
  if (!form.password) {
    errors.password = 'Le mot de passe est requis.'
  } else if (form.password.length < 8) {
    errors.password = 'Le mot de passe doit contenir au moins 8 caractères.'
  }
  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas.'
  }
  return errors
}

function Settings() {
  const { updatePassword } = useAuth()
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [serverError, setServerError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'submitting') return

    const validationErrors = validate(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setStatus('submitting')
    setServerError('')

    const { error } = await updatePassword(form.password)

    if (error) {
      setServerError("Une erreur est survenue lors de la mise à jour. Merci de réessayer.")
      setStatus('idle')
      return
    }

    setForm({ password: '', confirmPassword: '' })
    setStatus('success')
  }

  return (
    <div>
      <div className="client-page-header">
        <span className="section-eyebrow">Espace client</span>
        <h1>Paramètres</h1>
        <p>Modifiez votre mot de passe de connexion.</p>
      </div>

      <form className="settings-form" onSubmit={handleSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="password">Nouveau mot de passe</label>
          <input id="password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} />
          {errors.password && <span className="form-error">{errors.password}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={handleChange}
          />
          {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
        </div>

        {status === 'success' && <SuccessMessage title="Mot de passe mis à jour." />}
        {serverError && <p className="form-error form-error--global">{serverError}</p>}

        <Button type="submit" variant="primary" loading={status === 'submitting'}>
          Mettre à jour
        </Button>
      </form>
    </div>
  )
}

export default Settings
