import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import Button from '../../components/common/Button'
import SuccessMessage from '../../components/common/SuccessMessage'
import useAuth from '../../hooks/useAuth'
import './Auth.css'

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  consent: false,
}

function validate(form) {
  const errors = {}
  if (!form.firstName.trim()) errors.firstName = 'Le prénom est requis.'
  if (!form.lastName.trim()) errors.lastName = 'Le nom est requis.'
  if (!form.email.trim()) {
    errors.email = "L'email est requis."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Veuillez saisir un email valide.'
  }
  if (!form.password) {
    errors.password = 'Le mot de passe est requis.'
  } else if (form.password.length < 8) {
    errors.password = 'Le mot de passe doit contenir au moins 8 caractères.'
  }
  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Les mots de passe ne correspondent pas.'
  }
  if (!form.consent) errors.consent = 'Le consentement est requis pour créer un compte.'
  return errors
}

function getRegisterErrorMessage(error) {
  if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
    return 'Un compte existe déjà avec cet email.'
  }
  if (error.message?.includes('rate limit')) {
    return "Trop de tentatives d'inscription pour le moment. Merci de réessayer dans quelques minutes."
  }
  if (error.message?.includes('invalid')) {
    return "Cette adresse email n'est pas valide."
  }
  return 'Une erreur est survenue lors de la création du compte. Merci de réessayer.'
}

function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [serverError, setServerError] = useState('')

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'submitting') return

    const validationErrors = validate(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setStatus('submitting')
    setServerError('')

    const { data, error } = await signUp({
      email: form.email.trim(),
      password: form.password,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
    })

    if (error) {
      setServerError(getRegisterErrorMessage(error))
      setStatus('idle')
      return
    }

    if (data?.session) {
      navigate('/client', { replace: true })
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
                title="Votre compte a été créé."
                description="Un email de confirmation vous a été envoyé. Cliquez sur le lien qu'il contient pour activer votre compte, puis connectez-vous."
              />
              <div className="auth-footer-links">
                <Link to="/connexion">Aller à la connexion</Link>
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
              <h1>Créer un compte</h1>
              <p>Suivez vos demandes et accédez à vos formations en un seul endroit.</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="auth-row">
                <div className="form-field">
                  <label htmlFor="firstName">Prénom</label>
                  <input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} />
                  {errors.firstName && <span className="form-error">{errors.firstName}</span>}
                </div>
                <div className="form-field">
                  <label htmlFor="lastName">Nom</label>
                  <input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} />
                  {errors.lastName && <span className="form-error">{errors.lastName}</span>}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>

              <div className="auth-row">
                <div className="form-field">
                  <label htmlFor="password">Mot de passe</label>
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
                  <label htmlFor="confirmPassword">Confirmer</label>
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
              </div>

              <div className="form-field form-field--checkbox">
                <label>
                  <input type="checkbox" name="consent" checked={form.consent} onChange={handleChange} />
                  J'accepte que mes informations soient utilisées pour créer et gérer mon compte.
                </label>
                {errors.consent && <span className="form-error">{errors.consent}</span>}
              </div>

              {serverError && <p className="form-error form-error--global">{serverError}</p>}

              <Button type="submit" variant="primary" size="lg" className="auth-submit" loading={status === 'submitting'}>
                Créer mon compte
              </Button>
            </form>

            <div className="auth-footer-links">
              <span>
                Déjà un compte ? <Link to="/connexion">Se connecter</Link>
              </span>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}

export default Register
