import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import Button from '../../components/common/Button'
import SuccessMessage from '../../components/common/SuccessMessage'
import ErrorState from '../../components/common/ErrorState'
import Loader from '../../components/common/Loader'
import useAuth from '../../hooks/useAuth'
import './Auth.css'

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

function ResetPassword() {
  const { user, loading, updatePassword } = useAuth()
  const navigate = useNavigate()

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

    setStatus('success')
  }

  if (loading) {
    return (
      <MainLayout>
        <section className="auth-section">
          <Loader fullPage label="Vérification du lien..." />
        </section>
      </MainLayout>
    )
  }

  if (!user) {
    return (
      <MainLayout>
        <section className="auth-section">
          <div className="container">
            <div className="auth-card">
              <ErrorState
                title="Lien invalide ou expiré"
                description="Merci de refaire une demande de réinitialisation de mot de passe."
              />
              <div className="auth-footer-links">
                <Link to="/mot-de-passe-oublie">Demander un nouveau lien</Link>
              </div>
            </div>
          </div>
        </section>
      </MainLayout>
    )
  }

  if (status === 'success') {
    return (
      <MainLayout>
        <section className="auth-section">
          <div className="container">
            <div className="auth-card">
              <SuccessMessage title="Mot de passe mis à jour." description="Vous pouvez maintenant accéder à votre espace." />
              <Button variant="primary" size="lg" className="auth-submit" onClick={() => navigate('/client', { replace: true })}>
                Accéder à mon espace
              </Button>
            </div>
          </div>
        </section>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <section className="auth-section">
        <div className="container">
          <div className="auth-card">
            <div className="auth-card-header">
              <span className="section-eyebrow">Espace client</span>
              <h1>Nouveau mot de passe</h1>
              <p>Choisissez un nouveau mot de passe pour votre compte.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label htmlFor="password">Nouveau mot de passe</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                />
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

              {serverError && <p className="form-error form-error--global">{serverError}</p>}

              <Button type="submit" variant="primary" size="lg" className="auth-submit" loading={status === 'submitting'}>
                Mettre à jour le mot de passe
              </Button>
            </form>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}

export default ResetPassword
