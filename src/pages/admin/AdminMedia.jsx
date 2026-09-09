import { useEffect, useState } from 'react'
import EmptyState from '../../components/common/EmptyState'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import ConfirmModal from '../../components/common/ConfirmModal'
import { listMediaFiles, deleteMediaFile, uploadFile, getPublicUrl } from '../../services/storageService'
import './AdminMedia.css'

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']

function isImage(name) {
  const ext = name.split('.').pop()?.toLowerCase()
  return IMAGE_EXTENSIONS.includes(ext)
}

function AdminMedia() {
  const [state, setState] = useState({ status: 'loading', files: [] })
  const [uploading, setUploading] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [copiedName, setCopiedName] = useState(null)

  const load = () => {
    listMediaFiles('uploads').then(({ data, error }) => {
      setState(error ? { status: 'error', files: [] } : { status: 'ready', files: data.filter((f) => f.id) })
    })
  }

  useEffect(load, [])

  const handleUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    await uploadFile('site-assets', 'uploads', file)
    setUploading(false)
    event.target.value = ''
    load()
  }

  const handleCopy = async (path) => {
    const url = getPublicUrl('site-assets', path)
    try {
      await navigator.clipboard.writeText(url)
      setCopiedName(path)
      setTimeout(() => setCopiedName(null), 2000)
    } catch {
      // Presse-papiers indisponible (contexte non sécurisé) : l'URL reste affichée dans le champ.
    }
  }

  const handleDelete = async () => {
    if (!pendingDelete) return
    await deleteMediaFile(`uploads/${pendingDelete.name}`)
    setPendingDelete(null)
    load()
  }

  if (state.status === 'loading') {
    return <Loader fullPage label="Chargement des médias..." />
  }

  if (state.status === 'error') {
    return <ErrorState onRetry={load} />
  }

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <span className="section-eyebrow">SuperAdmin</span>
          <h1>Médiathèque</h1>
          <p>Images et documents publics du site (logo, visuels institutionnels...).</p>
        </div>
        <label className="btn btn--primary btn--md">
          <span className="btn-label">{uploading ? 'Envoi...' : 'Importer un fichier'}</span>
          <input type="file" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
        </label>
      </div>

      {state.files.length === 0 ? (
        <EmptyState title="Aucun média" description="Importez un premier fichier pour commencer." />
      ) : (
        <div className="admin-media-grid">
          {state.files.map((file) => {
            const url = getPublicUrl('site-assets', `uploads/${file.name}`)
            return (
              <div className="admin-media-card" key={file.id || file.name}>
                <div className="admin-media-preview">
                  {isImage(file.name) ? <img src={url} alt={file.name} /> : <span className="admin-media-file-icon">📄</span>}
                </div>
                <p className="admin-media-name" title={file.name}>
                  {file.name}
                </p>
                <div className="admin-row-actions">
                  <button type="button" className="admin-link-action" onClick={() => handleCopy(`uploads/${file.name}`)}>
                    {copiedName === `uploads/${file.name}` ? 'Copié !' : 'Copier le lien'}
                  </button>
                  <button
                    type="button"
                    className="admin-link-action admin-link-action--danger"
                    onClick={() => setPendingDelete(file)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={handleDelete}
        title="Supprimer ce fichier ?"
        description="Cette action est irréversible. Si ce fichier est utilisé sur le site, l'image cassera."
        confirmLabel="Supprimer"
      />
    </div>
  )
}

export default AdminMedia
