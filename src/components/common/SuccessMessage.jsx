import './SuccessMessage.css'

function SuccessMessage({ title, description }) {
  return (
    <div className="success-message" role="status">
      <div className="success-message-icon" aria-hidden="true">✓</div>
      <div>
        <p className="success-message-title">{title}</p>
        {description && <p className="success-message-description">{description}</p>}
      </div>
    </div>
  )
}

export default SuccessMessage
