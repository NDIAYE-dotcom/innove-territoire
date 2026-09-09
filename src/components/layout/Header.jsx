import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import AppLogo from '../common/AppLogo'
import Button from '../common/Button'
import useAuth from '../../hooks/useAuth'
import './Header.css'

const NAV_LINKS = [
  { label: 'Accueil', to: '/' },
  { label: 'À propos', to: '/a-propos' },
  { label: "Domaines d'intervention", to: '/domaines' },
  { label: 'Prestations', to: '/prestations' },
  { label: 'Formations', to: '/formations' },
  { label: 'Méthodologie', to: '/#methodologie' },
  { label: 'Contact', to: '/contact' },
]

function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, role, signOut } = useAuth()
  const spaceLink = role === 'superadmin' ? '/admin' : '/client'
  const location = useLocation()

  // Header transparent, superposé à l'image du Hero (voir Hero.css) — uniquement
  // sur l'accueil, tant que la page n'a pas défilé. Redevient opaque dès le
  // scroll ou sur toute autre page (le hero, avec sa photo, est la seule
  // section assez sombre pour porter du texte blanc en confiance).
  const isTransparent = location.pathname === '/' && !isScrolled

  // NavLink ne compare que le pathname : sans ceci, "Accueil" (to="/") et
  // "Méthodologie" (to="/#methodologie") apparaissent actifs en même temps
  // dès qu'on est sur "/", puisque les deux résolvent au même pathname.
  const isNavLinkActive = (link, routerIsActive) => {
    if (link.to.includes('#')) {
      const hash = link.to.split('#')[1]
      return location.pathname === '/' && location.hash === `#${hash}`
    }
    return routerIsActive
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMenuOpen])

  return (
    <header className={`site-header ${isScrolled ? 'site-header--scrolled' : ''} ${isTransparent ? 'site-header--transparent' : ''}`}>
      <div className="container site-header-inner">
        <AppLogo variant={isTransparent ? 'light' : 'dark'} />

        <nav className="site-nav" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `site-nav-link ${isNavLinkActive(link, isActive) ? 'site-nav-link--active' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="site-header-actions">
          {user ? (
            <>
              <NavLink to={spaceLink} className="site-header-client-link">
                Mon espace
              </NavLink>
              <button type="button" className="site-header-client-link" onClick={() => signOut()}>
                Déconnexion
              </button>
            </>
          ) : (
            <NavLink to="/connexion" className="site-header-client-link">
              Votre Espace
            </NavLink>
          )}
          <Button to="/formations" variant="outline" size="sm">
            E-learning
          </Button>
        </div>

        <button
          type="button"
          className={`site-header-toggle ${isMenuOpen ? 'is-open' : ''} ${isTransparent ? 'is-transparent' : ''}`}
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-label="Ouvrir le menu"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`site-header-mobile ${isMenuOpen ? 'is-open' : ''}`}>
        <nav className="site-nav-mobile" aria-label="Navigation mobile">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} onClick={() => setIsMenuOpen(false)} className="site-nav-mobile-link">
              {link.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink to={spaceLink} onClick={() => setIsMenuOpen(false)} className="site-nav-mobile-link">
                Mon espace
              </NavLink>
              <button
                type="button"
                className="site-nav-mobile-link site-nav-mobile-link--button"
                onClick={() => {
                  setIsMenuOpen(false)
                  signOut()
                }}
              >
                Déconnexion
              </button>
            </>
          ) : (
            <NavLink to="/connexion" onClick={() => setIsMenuOpen(false)} className="site-nav-mobile-link">
              Votre Espace
            </NavLink>
          )}
        </nav>
        <div className="site-header-mobile-actions">
          <Button to="/formations" variant="outline" onClick={() => setIsMenuOpen(false)}>
            E-learning
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
