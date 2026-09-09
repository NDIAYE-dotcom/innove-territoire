import Modal from './Modal'
import Button from './Button'
import './ConfirmModal.css'

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmer cette action',
  description = 'Cette action est irréversible.',
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'danger',
  loading = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <p className="confirm-modal-description">{description}</p>
      <div className="confirm-modal-actions">
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button variant={variant} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

export default ConfirmModal
