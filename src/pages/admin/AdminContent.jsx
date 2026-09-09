import { useEffect, useState } from 'react'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import Modal from '../../components/common/Modal'
import Button from '../../components/common/Button'
import ConfirmModal from '../../components/common/ConfirmModal'
import {
  fetchAllSiteSections,
  createSiteSection,
  updateSiteSection,
  deleteSiteSection,
  fetchAllSiteCards,
  createSiteCard,
  updateSiteCard,
  deleteSiteCard,
} from '../../services/cmsService'

function AdminContent() {
  const [state, setState] = useState({ status: 'loading', sections: [], cards: [] })
  const [sectionModal, setSectionModal] = useState(null)
  const [cardModal, setCardModal] = useState(null)
  const [pendingDeleteSection, setPendingDeleteSection] = useState(null)
  const [pendingDeleteCard, setPendingDeleteCard] = useState(null)

  const load = () => {
    Promise.all([fetchAllSiteSections(), fetchAllSiteCards()]).then(([sectionsRes, cardsRes]) => {
      if (sectionsRes.error || cardsRes.error) {
        setState((current) => ({ ...current, status: 'error' }))
        return
      }
      setState({ status: 'ready', sections: sectionsRes.data ?? [], cards: cardsRes.data ?? [] })
    })
  }

  useEffect(load, [])

  if (state.status === 'loading') {
    return <Loader fullPage label="Chargement des contenus..." />
  }

  if (state.status === 'error') {
    return <ErrorState onRetry={load} />
  }

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <span className="section-eyebrow">SuperAdmin</span>
          <h1>Contenus du site</h1>
          <p>
            Blocs de texte et cards administrables. Le branchement sur les pages publiques se fera en Phase 10 — ces
            contenus sont préparés dès maintenant.
          </p>
        </div>
      </div>

      <div className="admin-panel">
        <div className="admin-toolbar" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <h2 style={{ marginBottom: 0 }}>Blocs de texte (sections)</h2>
          <Button variant="outline" size="sm" onClick={() => setSectionModal({ mode: 'create' })}>
            + Ajouter une section
          </Button>
        </div>

        {state.sections.length === 0 ? (
          <EmptyState title="Aucune section" />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Clé</th>
                  <th>Titre</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.sections.map((section) => (
                  <tr key={section.id}>
                    <td>{section.key}</td>
                    <td>{section.title || '—'}</td>
                    <td>{section.is_active ? 'Oui' : 'Non'}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" className="admin-link-action" onClick={() => setSectionModal({ mode: 'edit', section })}>
                          Modifier
                        </button>
                        <button
                          type="button"
                          className="admin-link-action admin-link-action--danger"
                          onClick={() => setPendingDeleteSection(section)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="admin-panel">
        <div className="admin-toolbar" style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <h2 style={{ marginBottom: 0 }}>Cards (avantages, chiffres, actualités...)</h2>
          <Button variant="outline" size="sm" onClick={() => setCardModal({ mode: 'create' })}>
            + Ajouter une card
          </Button>
        </div>

        {state.cards.length === 0 ? (
          <EmptyState title="Aucune card" />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Groupe (section_key)</th>
                  <th>Titre</th>
                  <th>Ordre</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {state.cards.map((card) => (
                  <tr key={card.id}>
                    <td>{card.section_key}</td>
                    <td>{card.title}</td>
                    <td>{card.order_index}</td>
                    <td>{card.is_active ? 'Oui' : 'Non'}</td>
                    <td>
                      <div className="admin-row-actions">
                        <button type="button" className="admin-link-action" onClick={() => setCardModal({ mode: 'edit', card })}>
                          Modifier
                        </button>
                        <button
                          type="button"
                          className="admin-link-action admin-link-action--danger"
                          onClick={() => setPendingDeleteCard(card)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {sectionModal && (
        <SectionFormModal
          isOpen
          section={sectionModal.section}
          onClose={() => setSectionModal(null)}
          onSaved={() => {
            setSectionModal(null)
            load()
          }}
        />
      )}

      {cardModal && (
        <CardFormModal
          isOpen
          card={cardModal.card}
          onClose={() => setCardModal(null)}
          onSaved={() => {
            setCardModal(null)
            load()
          }}
        />
      )}

      <ConfirmModal
        isOpen={Boolean(pendingDeleteSection)}
        onClose={() => setPendingDeleteSection(null)}
        onConfirm={async () => {
          await deleteSiteSection(pendingDeleteSection.id)
          setPendingDeleteSection(null)
          load()
        }}
        title="Supprimer cette section ?"
        confirmLabel="Supprimer"
      />

      <ConfirmModal
        isOpen={Boolean(pendingDeleteCard)}
        onClose={() => setPendingDeleteCard(null)}
        onConfirm={async () => {
          await deleteSiteCard(pendingDeleteCard.id)
          setPendingDeleteCard(null)
          load()
        }}
        title="Supprimer cette card ?"
        confirmLabel="Supprimer"
      />
    </div>
  )
}

function SectionFormModal({ isOpen, onClose, onSaved, section }) {
  const [form, setForm] = useState({
    key: section?.key || '',
    title: section?.title || '',
    subtitle: section?.subtitle || '',
    body: section?.body || '',
    cta_label: section?.cta_label || '',
    cta_link: section?.cta_link || '',
    is_active: section?.is_active ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.key.trim()) {
      setError('La clé est obligatoire (ex: home_hero).')
      return
    }
    setSaving(true)
    setError('')

    const payload = {
      key: form.key.trim(),
      title: form.title || null,
      subtitle: form.subtitle || null,
      body: form.body || null,
      cta_label: form.cta_label || null,
      cta_link: form.cta_link || null,
      is_active: form.is_active,
    }

    const { error: saveError } = section ? await updateSiteSection(section.id, payload) : await createSiteSection(payload)
    setSaving(false)

    if (saveError) {
      setError(saveError.code === '23505' ? 'Cette clé existe déjà.' : "Une erreur est survenue.")
      return
    }
    onSaved()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={section ? 'Modifier la section' : 'Nouvelle section'}>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="section_key">Clé (identifiant stable)</label>
          <input
            id="section_key"
            value={form.key}
            onChange={(event) => setForm((c) => ({ ...c, key: event.target.value }))}
            placeholder="home_hero"
            disabled={Boolean(section)}
            required
          />
        </div>
        <div>
          <label htmlFor="section_title">Titre</label>
          <input id="section_title" value={form.title} onChange={(event) => setForm((c) => ({ ...c, title: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="section_subtitle">Sous-titre</label>
          <input
            id="section_subtitle"
            value={form.subtitle}
            onChange={(event) => setForm((c) => ({ ...c, subtitle: event.target.value }))}
          />
        </div>
        <div>
          <label htmlFor="section_body">Texte</label>
          <textarea id="section_body" value={form.body} onChange={(event) => setForm((c) => ({ ...c, body: event.target.value }))} rows={4} />
        </div>
        <div className="admin-form-row">
          <div>
            <label htmlFor="section_cta_label">Libellé bouton</label>
            <input
              id="section_cta_label"
              value={form.cta_label}
              onChange={(event) => setForm((c) => ({ ...c, cta_label: event.target.value }))}
            />
          </div>
          <div>
            <label htmlFor="section_cta_link">Lien bouton</label>
            <input
              id="section_cta_link"
              value={form.cta_link}
              onChange={(event) => setForm((c) => ({ ...c, cta_link: event.target.value }))}
            />
          </div>
        </div>
        <div className="admin-checkbox-row">
          <input
            id="section_active"
            type="checkbox"
            checked={form.is_active}
            onChange={(event) => setForm((c) => ({ ...c, is_active: event.target.checked }))}
          />
          <label htmlFor="section_active" style={{ marginBottom: 0 }}>
            Active (visible publiquement une fois branchée)
          </label>
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

function CardFormModal({ isOpen, onClose, onSaved, card }) {
  const [form, setForm] = useState({
    section_key: card?.section_key || '',
    title: card?.title || '',
    subtitle: card?.subtitle || '',
    description: card?.description || '',
    image_url: card?.image_url || '',
    icon: card?.icon || '',
    link: card?.link || '',
    order_index: card?.order_index ?? 0,
    is_active: card?.is_active ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.section_key.trim() || !form.title.trim()) {
      setError('Le groupe (section_key) et le titre sont obligatoires.')
      return
    }
    setSaving(true)
    setError('')

    const payload = {
      section_key: form.section_key.trim(),
      title: form.title.trim(),
      subtitle: form.subtitle || null,
      description: form.description || null,
      image_url: form.image_url || null,
      icon: form.icon || null,
      link: form.link || null,
      order_index: Number(form.order_index) || 0,
      is_active: form.is_active,
    }

    const { error: saveError } = card ? await updateSiteCard(card.id, payload) : await createSiteCard(payload)
    setSaving(false)

    if (saveError) {
      setError("Une erreur est survenue.")
      return
    }
    onSaved()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={card ? 'Modifier la card' : 'Nouvelle card'}>
      <form className="admin-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="card_section_key">Groupe (section_key)</label>
          <input
            id="card_section_key"
            value={form.section_key}
            onChange={(event) => setForm((c) => ({ ...c, section_key: event.target.value }))}
            placeholder="home_advantages"
            required
          />
        </div>
        <div>
          <label htmlFor="card_title">Titre</label>
          <input id="card_title" value={form.title} onChange={(event) => setForm((c) => ({ ...c, title: event.target.value }))} required />
        </div>
        <div>
          <label htmlFor="card_subtitle">Sous-titre</label>
          <input id="card_subtitle" value={form.subtitle} onChange={(event) => setForm((c) => ({ ...c, subtitle: event.target.value }))} />
        </div>
        <div>
          <label htmlFor="card_description">Description</label>
          <textarea
            id="card_description"
            value={form.description}
            onChange={(event) => setForm((c) => ({ ...c, description: event.target.value }))}
            rows={3}
          />
        </div>
        <div className="admin-form-row">
          <div>
            <label htmlFor="card_icon">Icône (nom/emoji)</label>
            <input id="card_icon" value={form.icon} onChange={(event) => setForm((c) => ({ ...c, icon: event.target.value }))} />
          </div>
          <div>
            <label htmlFor="card_order">Ordre</label>
            <input
              id="card_order"
              type="number"
              value={form.order_index}
              onChange={(event) => setForm((c) => ({ ...c, order_index: event.target.value }))}
            />
          </div>
        </div>
        <div>
          <label htmlFor="card_link">Lien</label>
          <input id="card_link" value={form.link} onChange={(event) => setForm((c) => ({ ...c, link: event.target.value }))} />
        </div>
        <div className="admin-checkbox-row">
          <input
            id="card_active"
            type="checkbox"
            checked={form.is_active}
            onChange={(event) => setForm((c) => ({ ...c, is_active: event.target.checked }))}
          />
          <label htmlFor="card_active" style={{ marginBottom: 0 }}>
            Active
          </label>
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

export default AdminContent
