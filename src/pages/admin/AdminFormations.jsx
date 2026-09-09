import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import ConfirmModal from '../../components/common/ConfirmModal'
import StatusBadge from '../../components/dashboard/StatusBadge'
import {
  fetchAllFormations,
  fetchFormationById,
  createFormation,
  updateFormation,
  deleteFormation,
} from '../../services/formationService'
import { uploadFile, getPublicUrl } from '../../services/storageService'
import { slugify } from '../../utils/slugify'
import { FORMATION_STATUS, getStatusMeta } from '../../utils/statusLabels'

const EMPTY_FORM = {
  slug: '',
  title: '',
  short_description: '',
  full_description: '',
  image_url: '',
  objectives: '',
  target_audience: '',
  prerequisites: '',
  level: '',
  duration: '',
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
  seats_total: '',
  price: '',
  status: 'draft',
  instructor_name: '',
}

function AdminFormations() {
  const [state, setState] = useState({ status: 'loading', formations: [] })
  const [editingId, setEditingId] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    fetchAllFormations().then(({ data, error }) => {
      setState(error ? { status: 'error', formations: [] } : { status: 'ready', formations: data ?? [] })
    })
  }

  useEffect(load, [])

  const handleDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    const { error } = await deleteFormation(pendingDelete.id)
    setDeleting(false)
    setPendingDelete(null)
    if (!error) load()
  }

  if (state.status === 'loading') {
    return <Loader fullPage label="Chargement des formations..." />
  }

  if (state.status === 'error') {
    return <ErrorState onRetry={load} />
  }

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <span className="section-eyebrow">SuperAdmin</span>
          <h1>Formations</h1>
          <p>Créez et publiez les formations du catalogue e-learning.</p>
        </div>
        <Button variant="primary" onClick={() => setIsCreating(true)}>
          Nouvelle formation
        </Button>
      </div>

      {state.formations.length === 0 ? (
        <EmptyState title="Aucune formation" description="Créez votre première formation pour l'ouvrir aux clients." />
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Statut</th>
                <th>Niveau</th>
                <th>Dates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {state.formations.map((formation) => {
                const meta = getStatusMeta(FORMATION_STATUS, formation.status)
                return (
                  <tr key={formation.id}>
                    <td>{formation.title}</td>
                    <td>
                      <StatusBadge label={meta.label} tone={meta.tone} />
                    </td>
                    <td>{formation.level || '—'}</td>
                    <td>{formation.start_date || '—'}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" className="admin-link-action" onClick={() => setEditingId(formation.id)}>
                          Modifier
                        </button>
                        <Link to={`/admin/formations/${formation.id}`} className="admin-link-action">
                          Modules &amp; leçons
                        </Link>
                        <button
                          type="button"
                          className="admin-link-action admin-link-action--danger"
                          onClick={() => setPendingDelete(formation)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {isCreating && (
        <FormationFormModal
          isOpen
          onClose={() => setIsCreating(false)}
          onSaved={() => {
            setIsCreating(false)
            load()
          }}
        />
      )}

      {editingId && (
        <FormationFormModal
          isOpen
          formationId={editingId}
          onClose={() => setEditingId(null)}
          onSaved={() => {
            setEditingId(null)
            load()
          }}
        />
      )}

      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer cette formation ?"
        description="Les modules, leçons et inscriptions associés seront supprimés définitivement."
        confirmLabel="Supprimer"
        loading={deleting}
      />
    </div>
  )
}

function FormationFormModal({ isOpen, onClose, onSaved, formationId }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(Boolean(formationId))
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [slugTouched, setSlugTouched] = useState(Boolean(formationId))

  useEffect(() => {
    if (!formationId) return
    fetchFormationById(formationId).then(({ data }) => {
      if (!data) return
      setForm({
        slug: data.slug || '',
        title: data.title || '',
        short_description: data.short_description || '',
        full_description: data.full_description || '',
        image_url: data.image_url || '',
        objectives: (data.objectives || []).join('\n'),
        target_audience: data.target_audience || '',
        prerequisites: data.prerequisites || '',
        level: data.level || '',
        duration: data.duration || '',
        start_date: data.start_date || '',
        end_date: data.end_date || '',
        start_time: data.start_time || '',
        end_time: data.end_time || '',
        seats_total: data.seats_total ?? '',
        price: data.price ?? '',
        status: data.status || 'draft',
        instructor_name: data.instructor_name || '',
      })
      setLoading(false)
    })
  }, [formationId])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => {
      const next = { ...current, [name]: value }
      if (name === 'title' && !slugTouched) {
        next.slug = slugify(value)
      }
      return next
    })
  }

  // slugify() même sur la saisie manuelle : un admin qui colle par erreur
  // une URL (ex. un lien Meet) dans ce champ casserait le routage public
  // (/formations/:slug) au lieu d'un simple slug invalide — vécu en test.
  const handleSlugChange = (event) => {
    setSlugTouched(true)
    setForm((current) => ({ ...current, slug: slugify(event.target.value) }))
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    const { path, error: uploadError } = await uploadFile('formation-assets', 'covers', file)
    setUploading(false)
    if (!uploadError && path) {
      setForm((current) => ({ ...current, image_url: getPublicUrl('formation-assets', path) }))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (saving) return
    if (!form.title.trim() || !form.slug.trim()) {
      setError('Le titre et le slug sont obligatoires.')
      return
    }

    setSaving(true)
    setError('')

    const payload = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      short_description: form.short_description || null,
      full_description: form.full_description || null,
      image_url: form.image_url || null,
      objectives: form.objectives
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
      target_audience: form.target_audience || null,
      prerequisites: form.prerequisites || null,
      level: form.level || null,
      duration: form.duration || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      start_time: form.start_time || null,
      end_time: form.end_time || null,
      seats_total: form.seats_total ? Number(form.seats_total) : null,
      price: form.price ? Number(form.price) : null,
      status: form.status,
      instructor_name: form.instructor_name || null,
    }

    const { error: saveError } = formationId ? await updateFormation(formationId, payload) : await createFormation(payload)

    setSaving(false)

    if (saveError) {
      setError(
        saveError.code === '23505'
          ? 'Ce slug est déjà utilisé par une autre formation.'
          : "Une erreur est survenue lors de l'enregistrement."
      )
      return
    }

    onSaved()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={formationId ? 'Modifier la formation' : 'Nouvelle formation'} size="lg">
      {loading ? (
        <Loader label="Chargement..." />
      ) : (
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="admin-form-row">
            <div>
              <label htmlFor="title">Titre</label>
              <input id="title" name="title" value={form.title} onChange={handleChange} required />
            </div>
            <div>
              <label htmlFor="slug">Slug (URL)</label>
              <input id="slug" name="slug" value={form.slug} onChange={handleSlugChange} required />
            </div>
          </div>

          <div>
            <label htmlFor="short_description">Description courte</label>
            <textarea id="short_description" name="short_description" value={form.short_description} onChange={handleChange} rows={2} />
          </div>

          <div>
            <label htmlFor="full_description">Description complète</label>
            <textarea id="full_description" name="full_description" value={form.full_description} onChange={handleChange} rows={4} />
          </div>

          <div>
            <label htmlFor="objectives">Objectifs (un par ligne)</label>
            <textarea id="objectives" name="objectives" value={form.objectives} onChange={handleChange} rows={3} />
          </div>

          <div className="admin-form-row">
            <div>
              <label htmlFor="target_audience">Public cible</label>
              <input id="target_audience" name="target_audience" value={form.target_audience} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="prerequisites">Prérequis</label>
              <input id="prerequisites" name="prerequisites" value={form.prerequisites} onChange={handleChange} />
            </div>
          </div>

          <div className="admin-form-row">
            <div>
              <label htmlFor="level">Niveau</label>
              <input id="level" name="level" value={form.level} onChange={handleChange} placeholder="Débutant, intermédiaire..." />
            </div>
            <div>
              <label htmlFor="duration">Durée</label>
              <input id="duration" name="duration" value={form.duration} onChange={handleChange} placeholder="3 jours, 12h..." />
            </div>
            <div>
              <label htmlFor="instructor_name">Formateur</label>
              <input id="instructor_name" name="instructor_name" value={form.instructor_name} onChange={handleChange} />
            </div>
          </div>

          <div className="admin-form-row">
            <div>
              <label htmlFor="start_date">Date de début</label>
              <input id="start_date" name="start_date" type="date" value={form.start_date} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="end_date">Date de fin</label>
              <input id="end_date" name="end_date" type="date" value={form.end_date} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="start_time">Heure de début</label>
              <input id="start_time" name="start_time" type="time" value={form.start_time} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="end_time">Heure de fin</label>
              <input id="end_time" name="end_time" type="time" value={form.end_time} onChange={handleChange} />
            </div>
          </div>

          <div className="admin-form-row">
            <div>
              <label htmlFor="seats_total">Places disponibles</label>
              <input id="seats_total" name="seats_total" type="number" min="0" value={form.seats_total} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="price">Prix (FCFA)</label>
              <input id="price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="status">Statut</label>
              <select id="status" name="status" value={form.status} onChange={handleChange}>
                {Object.keys(FORMATION_STATUS).map((key) => (
                  <option key={key} value={key}>
                    {FORMATION_STATUS[key].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="image">Image de couverture</label>
            <input id="image" type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
            {uploading && <Loader label="Envoi de l'image..." size="sm" />}
            {form.image_url && (
              <img src={form.image_url} alt="" style={{ marginTop: 10, maxHeight: 120, borderRadius: 8 }} />
            )}
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
      )}
    </Modal>
  )
}

export default AdminFormations
