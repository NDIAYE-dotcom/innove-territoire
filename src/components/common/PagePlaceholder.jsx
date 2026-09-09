import './PagePlaceholder.css'

function PagePlaceholder({ eyebrow, title, description }) {
  return (
    <section className="section page-placeholder">
      <div className="container">
        <div className="section-header">
          {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
      </div>
    </section>
  )
}

export default PagePlaceholder
