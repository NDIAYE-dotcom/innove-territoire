import './Skeleton.css'

function Skeleton({ variant = 'text', width, height, count = 1, className = '' }) {
  const items = Array.from({ length: count })

  return (
    <>
      {items.map((_, index) => (
        <span
          key={index}
          className={`skeleton skeleton--${variant} ${className}`.trim()}
          style={{ width, height }}
          aria-hidden="true"
        />
      ))}
    </>
  )
}

export default Skeleton
