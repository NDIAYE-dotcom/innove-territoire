import './DomainCard.css'

function DomainCard({ domain, index }) {
  return (
    <article className="domain-card">
      <span className="domain-card-index">{String(index + 1).padStart(2, '0')}</span>
      <h3 className="domain-card-title">{domain.title}</h3>
      <p className="domain-card-description">{domain.description}</p>
    </article>
  )
}

export default DomainCard
