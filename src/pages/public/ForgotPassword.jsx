import { useState } from 'react'
import { Link } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import Button from '../../components/common/Button'
import SuccessMessage from '../../components/common/SuccessMessage'
import useAuth from '../../hooks/useAuth'
import './Auth.css'

function ForgotPassword() {
  const { requestPasswordReset } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'submitting') return

    if (!email.trim()) {
      setError("L'email est requis.")
      return
    }

    setStatus('submitting')
    setError('')

    const { error: requestError } = await requestPasswordReset(email.trim())

    if (requestError) {
      setError(
        requestError.message?.includes('rate limit')
          ? "Trop de tentatives. Merci de réessayer dans quelques minutes."
          : 'Une erreur est survenue. Merci de réessayer.'
      )
      setStatus('idle')
      return
    }

    setStatus('success')
  }

  if (status === 'success') {
    return (
      <MainLayout>
        <section className="auth-section">
          <div className="container">
            <div className="auth-card">
              <SuccessMessage
                title="Email envoyé."
                description="Si un compte existe avec cette adresse, vous recevrez un lien pour réinitialiser votre mot de passe."
              />
              <div className="auth-footer-links">
                <Link to="/connexion">Retour à la connexion</Link>
              </div>
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
              <h1>Mot de passe oublié</h1>
              <p>Indiquez votre email, nous vous enverrons un lien de réinitialisation.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                {error && <span className="form-error">{error}</span>}
              </div>

              <Button type="submit" variant="primary" size="lg" className="auth-submit" loading={status === 'submitting'}>
                Envoyer le lien
              </Button>
            </form>

            <div className="auth-footer-links">
              <Link to="/connexion">Retour à la connexion</Link>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}

export default ForgotPassword
