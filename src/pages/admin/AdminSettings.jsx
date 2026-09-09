import { useEffect, useState } from 'react'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import SuccessMessage from '../../components/common/SuccessMessage'
import { fetchAllSiteSettings, upsertSiteSetting } from '../../services/cmsService'

// Champs institutionnels attendus (téléphone, adresse, réseaux...) : absents du
// document source Cabinet Innov.pdf, donc jamais inventés dans le code — c'est
// précisément l'écran où le cabinet les renseigne lui-même.
const KNOWN_SETTINGS = [
  { key: 'contact_phone', label: 'Téléphone' },
  { key: 'contact_email', label: 'Email de contact' },
  { key: 'contact_address', label: 'Adresse' },
  { key: 'site_tagline', label: 'Slogan / accroche' },
  { key: 'social_facebook', label: 'Facebook' },
  { key: 'social_linkedin', label: 'LinkedIn' },
  { key: 'social_twitter', label: 'Twitter / X' },
]

function AdminSettings() {
  const [state, setState] = useState({ status: 'loading', settings: [] })
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [customModal, setCustomModal] = useState(false)

  const load = () => {
    fetchAllSiteSettings().then(({ data, error }) => {
      if (error) {
        setState({ status: 'error', settings: [] })
        return
      }
      const settings = data ?? []
      setState({ status: 'ready', settings })
      const nextForm = {}
      KNOWN_SETTINGS.forEach(({ key }) => {
        const row = settings.find((s) => s.key === key)
        nextForm[key] = typeof row?.value === 'string' ? row.value : row?.value ?? ''
      })
      setForm(nextForm)
    })
  }

  useEffect(load, [])

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setSaved(false)
    await Promise.all(KNOWN_SETTINGS.map(({ key }) => upsertSiteSetting(key, form[key] || '')))
    setSaving(false)
    setSaved(true)
    load()
  }

  if (state.status === 'loading') {
    return <Loader fullPage label="Chargement des paramètres..." />
  }

  if (state.status === 'error') {
    return <ErrorState onRetry={load} />
  }

  const customSettings = state.settings.filter((s) => !KNOWN_SETTINGS.some((k) => k.key === s.key))

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <span className="section-eyebrow">SuperAdmin</span>
          <h1>Paramètres du site</h1>
          <p>Coordonnées et informations générales — non fournies dans le document institutionnel source.</p>
        </div>
      </div>

      <form className="admin-panel admin-form" onSubmit={handleSave}>
        <h2>Coordonnées &amp; réseaux</h2>
        <div className="admin-form-row">
          {KNOWN_SETTINGS.map(({ key, label }) => (
            <div key={key}>
              <label htmlFor={key}>{label}</label>
              <input
                id={key}
                value={form[key] || ''}
                onChange={(event) => setForm((c) => ({ ...c, [key]: event.target.value }))}
              />
            </div>
          ))}
        </div>
        {saved && <SuccessMessage title="Paramètres enregistrés." />}
        <div className="admin-form-actions">
          <Button type="submit" variant="primary" loading={saving}>
            Enregistrer
          </Button>
        </div>
      </form>

      <div className="admin-panel">
        <div className="admin-toolbar" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <h2 style={{ marginBottom: 0 }}>Paramètres personnalisés</h2>
          <Button variant="outline" size="sm" onClick={() => setCustomModal(true)}>
            + Ajouter un paramètre
          </Button>
        </div>
        {customSettings.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontSize: '0.88rem' }}>Aucun paramètre personnalisé.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Clé</th>
                  <th>Valeur</th>
                </tr>
              </thead>
              <tbody>
                {customSettings.map((setting) => (
                  <tr key={setting.key}>
                    <td>{setting.key}</td>
                    <td className="admin-table-wrap-cell">
                      {typeof setting.value === 'string' ? setting.value : JSON.stringify(setting.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {customModal && (
        <CustomSettingModal
          isOpen
          onClose={() => setCustomModal(false)}
          onSaved={() => {
            setCustomModal(false)
            load()
          }}
        />
      )}
    </div>
  )
}

function CustomSettingModal({ isOpen, onClose, onSaved }) {
  const [key, setKey] = useState('')
  const [value, setValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!key.trim()) {
      setError('La clé est obligatoire.')
      return
    }
    setSaving(true)
    setError('')
    const { error: saveError } = await upsertSiteSetting(key.trim(), value)
    setSaving(false)
    if (saveError) {
      setError("Une erreur est survenue.")
      return
    }
    onSaved()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau paramètre">
      <form className="admin-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="setting_key">Clé</label>
          <input id="setting_key" value={key} onChange={(event) => setKey(event.target.value)} placeholder="site_name" required />
        </div>
        <div>
          <label htmlFor="setting_value">Valeur</label>
          <textarea id="setting_value" value={value} onChange={(event) => setValue(event.target.value)} rows={3} />
        </div>
        {error && <p className="form-error form-error--global">{error}</p>}
        <div className="admin-form-actions">
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" loading={saving}>
            Enregistrer
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AdminSettings
