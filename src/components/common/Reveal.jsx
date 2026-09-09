import useInView from '../../hooks/useInView'

// Enveloppe générique de révélation au scroll — voir useInView.js et
// .reveal/.reveal--* dans src/styles/animations.css.
function Reveal({ children, direction = 'up', delay = 0, as: Tag = 'div', className = '' }) {
  const [ref, isInView] = useInView()

  return (
    <Tag
      ref={ref}
      className={`reveal reveal--${direction} ${isInView ? 'is-visible' : ''} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}

export default Reveal
