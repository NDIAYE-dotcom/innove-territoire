import { Link } from 'react-router-dom'
import './Button.css'

function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...rest
}) {
  const classes = `btn btn--${variant} btn--${size} ${loading ? 'btn--loading' : ''} ${className}`.trim()

  const content = (
    <>
      {loading && <span className="btn-spinner" aria-hidden="true" />}
      <span className="btn-label">{children}</span>
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} onClick={onClick} {...rest}>
      {content}
    </button>
  )
}

export default Button
