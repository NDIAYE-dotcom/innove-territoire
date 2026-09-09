import { useEffect, useRef, useState } from 'react'

// Déclenchement unique (disconnect après la première intersection) : une
// animation de révélation qui se répéterait à chaque scroll vers le haut/bas
// serait plus distrayante qu'élégante.
export default function useInView() {
  const ref = useRef(null)
  const [isInView, setIsInView] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return undefined

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return [ref, isInView]
}
