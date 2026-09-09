import './Loader.css'

function Loader({ size = 'md', label = 'Chargement...', fullPage = false }) {
  const spinner = (
    <div className={`loader loader--${size}`} role="status" aria-live="polite">
      <span className="loader-ring" aria-hidden="true" />
      {label && <span className="loader-label">{label}</span>}
    </div>
  )

  if (fullPage) {
    return <div className="loader-fullpage">{spinner}</div>
  }

  return spinner
}

export default Loader
