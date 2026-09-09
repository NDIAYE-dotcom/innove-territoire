import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import Button from '../../components/common/Button'
import SuccessMessage from '../../components/common/SuccessMessage'
import useAuth from '../../hooks/useAuth'
import { fetchDomains, fetchServices } from '../../services/contentService'
import { createServiceRequest } from '../../services/serviceRequestService'
import { uploadFile } from '../../services/storageService'
import useSiteSettings from '../../hooks/useSiteSettings'
import './Contact.css'

const INITIAL_FORM = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  organization: '',
  functionTitle: '',
  domainId: '',
  serviceId: '',
  subject: '',
  description: '',
  budgetIndicative: '',
  consent: false,
}

const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024 // 10 Mo

function validate(form) {
  const errors = {}

  if (!form.firstName.trim()) errors.firstName = 'Le prénom est requis.'
  if (!form.lastName.trim()) errors.lastName = 'Le nom est requis.'
  if (!form.email.trim()) {
    errors.email = "L'email est requis."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Veuillez saisir un email valide.'
  }
  if (!form.subject.trim()) errors.subject = "L'objet est requis."
  if (!form.description.trim()) {
    errors.description = 'Merci de décrire votre demande.'
  } else if (form.description.trim().length < 20) {
    errors.description = 'Merci de préciser votre demande (20 caractères minimum).'
  }
  if (!form.consent) errors.consent = 'Le consentement est requis pour envoyer ce formulaire.'

  return errors
}

function Contact() {
  const { user, profile } = useAuth()
  const [searchParams] = useSearchParams()
  const settings = useSiteSettings()
  const hasContactInfo = settings.contact_phone || settings.contact_email || settings.contact_address

  const [domains, setDomains] = useState([])
  const [services, setServices] = useState([])

  const [form, setForm] = useState({
    ...INITIAL_FORM,
    firstName: profile?.first_name || '',
    lastName: profile?.last_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    organization: profile?.organization || '',
  })
  const [attachment, setAttachment] = useState(null)
  const [attachmentError, setAttachmentError] = useState('')
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [serverError, setServerError] = useState('')
  const [reference, setReference] = useState(null)

  useEffect(() => {
    fetchDomains().then(({ data }) => setDomains(data ?? []))

    fetchServices().then(({ data }) => {
      const list = data ?? []
      setServices(list)

      const slug = searchParams.get('service')
      const match = slug && list.find((service) => service.slug === slug)
      if (match) {
        setForm((current) => ({
          ...current,
          serviceId: match.id,
          domainId: match.domain_id || current.domainId,
          subject: current.subject || `Demande — ${match.title}`,
        }))
      }
    })
    // Ne dépend que du montage : le paramètre `service` de l'URL n'est lu
    // qu'une fois, au chargement de la page, comme une valeur initiale.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      setAttachment(null)
      setAttachmentError('')
      return
    }

    if (file.size > MAX_ATTACHMENT_SIZE) {
      setAttachmentError('Le fichier ne doit pas dépasser 10 Mo.')
      setAttachment(null)
      event.target.value = ''
      return
    }

    setAttachmentError('')
    setAttachment(file)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (status === 'submitting') return

    const validationErrors = validate(form)
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    setStatus('submitting')
    setServerError('')

    let attachmentUrl = null

    if (attachment) {
      const { path, error: uploadError } = await uploadFile('documents', user?.id || 'anon', attachment)
      if (uploadError) {
        setServerError("L'envoi de la pièce jointe a échoué. Merci de réessayer sans fichier ou avec un autre fichier.")
        setStatus('idle')
        return
      }
      attachmentUrl = path
    }

    const { data, error } = await createServiceRequest({
      first_name: form.firstName.trim(),
      last_name: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      organization: form.organization.trim(),
      function_title: form.functionTitle.trim(),
      service_id: form.serviceId || null,
      domain_id: form.domainId || null,
      subject: form.subject.trim(),
      description: form.description.trim(),
      budget_indicative: form.budgetIndicative.trim(),
      attachment_url: attachmentUrl,
      consent: form.consent,
    })

    if (error || !data) {
      setServerError("Une erreur est survenue lors de l'envoi. Merci de réessayer.")
      setStatus('idle')
      return
    }

    setReference(data.request_number)
    setStatus('success')
  }

  if (status === 'success') {
    return (
      <MainLayout>
        <section className="section contact-confirmation">
          <div className="container">
            <SuccessMessage
              title="Votre demande a bien été enregistrée."
              description={`Référence : ${reference} — notre équipe reviendra vers vous prochainement.${user ? ' Vous pouvez suivre son statut depuis votre espace client.' : ''}`}
            />
          </div>
        </section>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <section className="contact-hero">
        <div className="container">
          <span className="section-eyebrow">Contact</span>
          <h1>Nous contacter</h1>
          <p className="contact-hero-text">
            Une question, un projet territorial à évoquer ? Écrivez-nous, notre équipe vous répondra.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container contact-grid">
          <form className="contact-form" onSubmit={handleSubmit} noValidate>
            <div className="contact-form-row">
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

            <div className="contact-form-row">
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="phone">Téléphone (facultatif)</label>
                <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
              </div>
            </div>

            <div className="contact-form-row">
              <div className="form-field">
                <label htmlFor="organization">Organisation (facultatif)</label>
                <input id="organization" name="organization" value={form.organization} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label htmlFor="functionTitle">Fonction (facultatif)</label>
                <input id="functionTitle" name="functionTitle" value={form.functionTitle} onChange={handleChange} />
              </div>
            </div>

            <div className="contact-form-row">
              <div className="form-field">
                <label htmlFor="domainId">Domaine concerné (facultatif)</label>
                <select id="domainId" name="domainId" value={form.domainId} onChange={handleChange}>
                  <option value="">— Sélectionner —</option>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="serviceId">Prestation souhaitée (facultatif)</label>
                <select id="serviceId" name="serviceId" value={form.serviceId} onChange={handleChange}>
                  <option value="">— Sélectionner —</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="subject">Objet</label>
              <input id="subject" name="subject" value={form.subject} onChange={handleChange} />
              {errors.subject && <span className="form-error">{errors.subject}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="description">Votre message</label>
              <textarea id="description" name="description" rows={6} value={form.description} onChange={handleChange} />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            <div className="form-field">
              <label htmlFor="budgetIndicative">Budget indicatif (facultatif)</label>
              <input id="budgetIndicative" name="budgetIndicative" value={form.budgetIndicative} onChange={handleChange} />
            </div>

            <div className="form-field">
              <label htmlFor="attachment">Pièce jointe (facultatif, 10 Mo max)</label>
              <input id="attachment" name="attachment" type="file" onChange={handleFileChange} />
              {attachmentError && <span className="form-error">{attachmentError}</span>}
            </div>

            <div className="form-field form-field--checkbox">
              <label>
                <input type="checkbox" name="consent" checked={form.consent} onChange={handleChange} />
                J'accepte que mes informations soient utilisées pour traiter ma demande.
              </label>
              {errors.consent && <span className="form-error">{errors.consent}</span>}
            </div>

            {serverError && <p className="form-error form-error--global">{serverError}</p>}

            <Button type="submit" variant="primary" size="lg" loading={status === 'submitting'}>
              Envoyer ma demande
            </Button>
          </form>

          <aside className="contact-info">
            <h2>Coordonnées du cabinet</h2>
            {hasContactInfo ? (
              <ul className="contact-info-list">
                {settings.contact_phone && (
                  <li>
                    <a href={`tel:${settings.contact_phone.replace(/\s+/g, '')}`}>{settings.contact_phone}</a>
                  </li>
                )}
                {settings.contact_email && (
                  <li>
                    <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
                  </li>
                )}
                {settings.contact_address && <li>{settings.contact_address}</li>}
              </ul>
            ) : (
              <p className="contact-info-note">
                Les coordonnées officielles (email, téléphone, adresse) seront publiées ici dès leur validation
                par le cabinet, depuis l'espace SuperAdmin.
              </p>
            )}
          </aside>
        </div>
      </section>
    </MainLayout>
  )
}

export default Contact
