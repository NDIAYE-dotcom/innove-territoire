import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function useScrollToHash() {
  const { hash } = useLocation()

  useEffect(() => {
    if (!hash) return

    const target = document.querySelector(hash)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [hash])
}

export default useScrollToHash
