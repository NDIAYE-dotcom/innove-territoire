import Button from './Button'
import './EmptyState.css'

function EmptyState({ title, description, actionLabel, onAction, actionTo, icon }) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {(onAction || actionTo) && actionLabel && (
        <Button variant="outline" size="sm" onClick={onAction} to={actionTo}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
