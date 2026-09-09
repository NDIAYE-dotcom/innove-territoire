import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import Button from '../../components/common/Button'
import SuccessMessage from '../../components/common/SuccessMessage'
import useAuth from '../../hooks/useAuth'
import './Auth.css'

function validate(form) {
  const errors = {}
  if (!form.email.trim()) errors.email = "L'email est requis."
  if (!form.password) errors.password = 'Le mot de passe est requis.'
  return errors
}

function Login() {
  const { signIn, user, role, loading, deactivatedNotice, clearDeactivatedNotice } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname
  const justConfirmed = new URLSearchParams(location.search).get('confirmed') === '1'

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    if (!loading && user) {
      navigate(from || (role === 'superadmin' ? '/admin' : '/client'), { replace: true })
    }
  }, [loading, user, role, from, navigate])

  useEffect(() => clearDeactivatedNotice, [clearDeactivatedNotice])

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

    const { error } = await signIn({ email: form.email.trim(), password: form.password })

    if (error) {
      setServerError(
        error.message === 'Invalid login credentials'
          ? 'Email ou mot de passe incorrect.'
          : "Une erreur est survenue lors de la connexion. Merci de réessayer."
      )
      setStatus('idle')
      return
    }

    // La redirection est gérée par l'effet ci-dessus une fois la session chargée.
  }

  return (
    <MainLayout>
      <section className="auth-section">
        <div className="container">
          <div className="auth-card">
            <div className="auth-card-header">
              <span className="section-eyebrow">Espace client</span>
              <h1>Connexion</h1>
              <p>Accédez à votre espace pour suivre vos demandes et vos formations.</p>
            </div>

            {justConfirmed && (
              <SuccessMessage
                title="Email confirmé."
                description="Votre compte est activé, vous pouvez maintenant vous connecter."
              />
            )}

            {deactivatedNotice && (
              <p className="form-error form-error--global">
                Votre compte a été désactivé. Contactez le cabinet si vous pensez qu'il s'agit d'une erreur.
              </p>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="password">Mot de passe</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                />
                {errors.password && <span className="form-error">{errors.password}</span>}
              </div>

              {serverError && <p className="form-error form-error--global">{serverError}</p>}

              <Button type="submit" variant="primary" size="lg" className="auth-submit" loading={status === 'submitting'}>
                Se connecter
              </Button>
            </form>

            <div className="auth-footer-links">
              <Link to="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
              <span>
                Pas encore de compte ? <Link to="/inscription">Créer un compte</Link>
              </span>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}

export default Login
