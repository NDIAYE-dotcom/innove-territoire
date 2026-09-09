import Button from './Button'
import './ErrorState.css'

function ErrorState({
  title = 'Une erreur est survenue',
  description = "Impossible de charger ces informations pour le moment. Merci de réessayer.",
  onRetry,
}) {
  return (
    <div className="error-state">
      <div className="error-state-icon" aria-hidden="true">!</div>
      <h3 className="error-state-title">{title}</h3>
      <p className="error-state-description">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Réessayer
        </Button>
      )}
    </div>
  )
}

export default ErrorState
