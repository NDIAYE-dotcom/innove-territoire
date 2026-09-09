import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import ConfirmModal from '../../components/common/ConfirmModal'
import SuccessMessage from '../../components/common/SuccessMessage'
import {
  fetchFormationById,
  fetchFormationModulesAdmin,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  fetchMeetLink,
  upsertMeetLink,
} from '../../services/formationService'
import { uploadFile } from '../../services/storageService'
import QuizEditorModal from './QuizEditorModal'
import './AdminFormationEditor.css'

function AdminFormationEditor() {
  const { id } = useParams()
  const [formation, setFormation] = useState(null)
  const [modules, setModules] = useState([])
  const [status, setStatus] = useState('loading')
  const [meetLink, setMeetLink] = useState('')
  const [meetLinkSaved, setMeetLinkSaved] = useState(false)
  const [savingMeetLink, setSavingMeetLink] = useState(false)

  const [moduleModal, setModuleModal] = useState(null) // { mode: 'create' | 'edit', module? }
  const [lessonModal, setLessonModal] = useState(null) // { mode, moduleId, lesson? }
  const [pendingDeleteModule, setPendingDeleteModule] = useState(null)
  const [pendingDeleteLesson, setPendingDeleteLesson] = useState(null)
  const [quizModalLesson, setQuizModalLesson] = useState(null)

  const load = () => {
    Promise.all([fetchFormationById(id), fetchFormationModulesAdmin(id), fetchMeetLink(id)]).then(
      ([formationRes, modulesRes, meetRes]) => {
        if (formationRes.error || modulesRes.error) {
          setStatus('error')
          return
        }
        setFormation(formationRes.data)
        setModules(
          (modulesRes.data ?? [])
            .map((m) => ({ ...m, lessons: (m.lessons ?? []).sort((a, b) => a.order_index - b.order_index) }))
            .sort((a, b) => a.order_index - b.order_index)
        )
        setMeetLink(meetRes.data?.meet_link || '')
        setStatus('ready')
      }
    )
  }

  useEffect(load, [id])

  const handleSaveMeetLink = async () => {
    setSavingMeetLink(true)
    const { error } = await upsertMeetLink(id, meetLink.trim())
    setSavingMeetLink(false)
    if (!error) {
      setMeetLinkSaved(true)
      setTimeout(() => setMeetLinkSaved(false), 2500)
    }
  }

  if (status === 'loading') {
    return <Loader fullPage label="Chargement de la formation..." />
  }

  if (status === 'error' || !formation) {
    return <ErrorState onRetry={load} />
  }

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <span className="section-eyebrow">SuperAdmin</span>
          <h1>{formation.title}</h1>
          <p>
            <Link to="/admin/formations" className="admin-link-action">
              ← Retour aux formations
            </Link>
          </p>
        </div>
        <Button variant="primary" onClick={() => setModuleModal({ mode: 'create' })}>
          Ajouter un module
        </Button>
      </div>

      <div className="admin-panel">
        <h2>Lien de la salle de cours (Google Meet)</h2>
        <p style={{ marginBottom: 12, color: 'var(--text-light)', fontSize: '0.88rem' }}>
          Visible uniquement par les inscrits approuvés et vous — jamais public.
        </p>
        <div className="admin-form-row" style={{ alignItems: 'end' }}>
          <div>
            <label htmlFor="meet_link">URL Google Meet</label>
            <input
              id="meet_link"
              value={meetLink}
              onChange={(event) => setMeetLink(event.target.value)}
              placeholder="https://meet.google.com/..."
            />
          </div>
          <Button variant="outline" onClick={handleSaveMeetLink} loading={savingMeetLink}>
            Enregistrer
          </Button>
        </div>
        {meetLinkSaved && <SuccessMessage title="Lien enregistré." />}
      </div>

      {modules.length === 0 ? (
        <EmptyState
          title="Aucun module"
          description="Ajoutez un module pour commencer à structurer cette formation."
          actionLabel="Ajouter un module"
          onAction={() => setModuleModal({ mode: 'create' })}
        />
      ) : (
        modules.map((module) => (
          <div className="admin-panel admin-module-panel" key={module.id}>
            <div className="admin-module-header">
              <div>
                <h2>{module.title}</h2>
                {module.description && <p className="admin-module-description">{module.description}</p>}
              </div>
              <div className="admin-row-actions">
                <button type="button" className="admin-link-action" onClick={() => setLessonModal({ mode: 'create', moduleId: module.id })}>
                  + Leçon
                </button>
                <button type="button" className="admin-link-action" onClick={() => setModuleModal({ mode: 'edit', module })}>
                  Modifier
                </button>
                <button
                  type="button"
                  className="admin-link-action admin-link-action--danger"
                  onClick={() => setPendingDeleteModule(module)}
                >
                  Supprimer
                </button>
              </div>
            </div>

            {module.lessons.length === 0 ? (
              <p className="admin-module-empty">Aucune leçon dans ce module.</p>
            ) : (
              <ul className="admin-lesson-list">
                {module.lessons.map((lesson) => (
                  <li key={lesson.id} className="admin-lesson-item">
                    <div>
                      <span className={`status-badge status-badge--${lesson.status === 'published' ? 'success' : 'muted'}`}>
                        {lesson.status === 'published' ? 'Publiée' : 'Brouillon'}
                      </span>
                      <span className="admin-lesson-title">{lesson.title}</span>
                    </div>
                    <div className="admin-row-actions">
                      <button type="button" className="admin-link-action" onClick={() => setQuizModalLesson(lesson)}>
                        Quiz
                      </button>
                      <button
                        type="button"
                        className="admin-link-action"
                        onClick={() => setLessonModal({ mode: 'edit', moduleId: module.id, lesson })}
                      >
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="admin-link-action admin-link-action--danger"
                        onClick={() => setPendingDeleteLesson(lesson)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))
      )}

      {moduleModal && (
        <ModuleFormModal
          isOpen
          formationId={id}
          module={moduleModal.module}
          nextOrderIndex={modules.length}
          onClose={() => setModuleModal(null)}
          onSaved={() => {
            setModuleModal(null)
            load()
          }}
        />
      )}

      {lessonModal && (
        <LessonFormModal
          isOpen
          formationId={id}
          moduleId={lessonModal.moduleId}
          lesson={lessonModal.lesson}
          nextOrderIndex={(modules.find((m) => m.id === lessonModal.moduleId)?.lessons.length) || 0}
          onClose={() => setLessonModal(null)}
          onSaved={() => {
            setLessonModal(null)
            load()
          }}
        />
      )}

      {quizModalLesson && (
        <QuizEditorModal
          isOpen
          lessonId={quizModalLesson.id}
          lessonTitle={quizModalLesson.title}
          onClose={() => setQuizModalLesson(null)}
        />
      )}

      <ConfirmModal
        isOpen={Boolean(pendingDeleteModule)}
        onClose={() => setPendingDeleteModule(null)}
        onConfirm={async () => {
          await deleteModule(pendingDeleteModule.id)
          setPendingDeleteModule(null)
          load()
        }}
        title="Supprimer ce module ?"
        description="Toutes ses leçons seront supprimées définitivement."
        confirmLabel="Supprimer"
      />

      <ConfirmModal
        isOpen={Boolean(pendingDeleteLesson)}
        onClose={() => setPendingDeleteLesson(null)}
        onConfirm={async () => {
          await deleteLesson(pendingDeleteLesson.id)
          setPendingDeleteLesson(null)
          load()
        }}
        title="Supprimer cette leçon ?"
        confirmLabel="Supprimer"
      />
    </div>
  )
}

function ModuleFormModal({ isOpen, onClose, onSaved, formationId, module, nextOrderIndex }) {
  const [form, setForm] = useState({
    title: module?.title || '',
    description: module?.description || '',
    order_index: module?.order_index ?? nextOrderIndex,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.title.trim()) {
      setError('Le titre est obligatoire.')
      return
    }
    setSaving(true)
    setError('')

    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      order_index: Number(form.order_index) || 0,
      formation_id: formationId,
    }

    const { error: saveError } = module ? await updateModule(module.id, payload) : await createModule(payload)
    setSaving(false)

    if (saveError) {
      setError("Une erreur est survenue lors de l'enregistrement.")
      return
    }
    onSaved()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={module ? 'Modifier le module' : 'Nouveau module'}>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="module_title">Titre</label>
          <input
            id="module_title"
            value={form.title}
            onChange={(event) => setForm((c) => ({ ...c, title: event.target.value }))}
            required
          />
        </div>
        <div>
          <label htmlFor="module_description">Description</label>
          <textarea
            id="module_description"
            value={form.description}
            onChange={(event) => setForm((c) => ({ ...c, description: event.target.value }))}
            rows={2}
          />
        </div>
        <div>
          <label htmlFor="module_order">Ordre d'affichage</label>
          <input
            id="module_order"
            type="number"
            value={form.order_index}
            onChange={(event) => setForm((c) => ({ ...c, order_index: event.target.value }))}
          />
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

function LessonFormModal({ isOpen, onClose, onSaved, formationId, moduleId, lesson, nextOrderIndex }) {
  const [form, setForm] = useState({
    title: lesson?.title || '',
    description: lesson?.description || '',
    content: lesson?.content || '',
    video_url: lesson?.video_url || '',
    pdf_url: lesson?.pdf_url || '',
    external_link: lesson?.external_link || '',
    duration: lesson?.duration || '',
    status: lesson?.status || 'draft',
    order_index: lesson?.order_index ?? nextOrderIndex,
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (field) => (event) => setForm((c) => ({ ...c, [field]: event.target.value }))

  const handlePdfUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    const { path, error: uploadError } = await uploadFile('course-materials', formationId, file)
    setUploading(false)
    if (!uploadError && path) {
      // "course-materials" est un bucket privé (RLS : inscrits approuvés ou
      // SuperAdmin) — on stocke le CHEMIN, pas une URL publique qui serait un
      // lien mort. La salle de cours génère une URL signée à la demande,
      // vérifiée par les policies du bucket au moment de la consultation.
      setForm((c) => ({ ...c, pdf_url: path }))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.title.trim()) {
      setError('Le titre est obligatoire.')
      return
    }
    setSaving(true)
    setError('')

    const payload = {
      title: form.title.trim(),
      description: form.description || null,
      content: form.content || null,
      video_url: form.video_url || null,
      pdf_url: form.pdf_url || null,
      external_link: form.external_link || null,
      duration: form.duration || null,
      status: form.status,
      order_index: Number(form.order_index) || 0,
      module_id: moduleId,
    }

    const { error: saveError } = lesson ? await updateLesson(lesson.id, payload) : await createLesson(payload)
    setSaving(false)

    if (saveError) {
      setError("Une erreur est survenue lors de l'enregistrement.")
      return
    }
    onSaved()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={lesson ? 'Modifier la leçon' : 'Nouvelle leçon'} size="lg">
      <form className="admin-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="lesson_title">Titre</label>
          <input id="lesson_title" value={form.title} onChange={handleChange('title')} required />
        </div>
        <div>
          <label htmlFor="lesson_description">Description courte</label>
          <input id="lesson_description" value={form.description} onChange={handleChange('description')} />
        </div>
        <div>
          <label htmlFor="lesson_content">Contenu (texte de la leçon)</label>
          <textarea id="lesson_content" value={form.content} onChange={handleChange('content')} rows={5} />
        </div>
        <div className="admin-form-row">
          <div>
            <label htmlFor="lesson_video">URL vidéo</label>
            <input id="lesson_video" value={form.video_url} onChange={handleChange('video_url')} placeholder="https://..." />
          </div>
          <div>
            <label htmlFor="lesson_external">Lien externe</label>
            <input id="lesson_external" value={form.external_link} onChange={handleChange('external_link')} placeholder="https://..." />
          </div>
        </div>
        <div>
          <label htmlFor="lesson_pdf_file">Document PDF (privé, réservé aux inscrits)</label>
          <input id="lesson_pdf_file" type="file" accept="application/pdf" onChange={handlePdfUpload} disabled={uploading} />
          {uploading && <Loader label="Envoi du document..." size="sm" />}
          {form.pdf_url && <p style={{ fontSize: '0.82rem', marginTop: 6 }}>Document actuel enregistré ✓</p>}
        </div>
        <div className="admin-form-row">
          <div>
            <label htmlFor="lesson_duration">Durée</label>
            <input id="lesson_duration" value={form.duration} onChange={handleChange('duration')} placeholder="15 min" />
          </div>
          <div>
            <label htmlFor="lesson_order">Ordre d'affichage</label>
            <input id="lesson_order" type="number" value={form.order_index} onChange={handleChange('order_index')} />
          </div>
          <div>
            <label htmlFor="lesson_status">Statut</label>
            <select id="lesson_status" value={form.status} onChange={handleChange('status')}>
              <option value="draft">Brouillon</option>
              <option value="published">Publiée</option>
            </select>
          </div>
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

export default AdminFormationEditor
