import './StatusBadge.css'

function StatusBadge({ label, tone = 'muted' }) {
  return <span className={`status-badge status-badge--${tone}`}>{label}</span>
}

export default StatusBadge
