import { Link } from 'react-router-dom'
import AppLogo from '../common/AppLogo'
import { DOMAINS } from '../../data/institutionalContent'
import useSiteSettings from '../../hooks/useSiteSettings'
import './Footer.css'

const SOCIAL_LINKS = [
  { key: 'social_facebook', label: 'Facebook' },
  { key: 'social_linkedin', label: 'LinkedIn' },
  { key: 'social_twitter', label: 'Twitter / X' },
]

const NAV_LINKS = [
  { label: 'Accueil', to: '/' },
  { label: 'À propos', to: '/a-propos' },
  { label: "Domaines d'intervention", to: '/domaines' },
  { label: 'Prestations', to: '/prestations' },
  { label: 'Formations', to: '/formations' },
  { label: 'Contact', to: '/contact' },
]

const FOOTER_DOMAINS = DOMAINS.slice(0, 4)

function Footer() {
  const year = new Date().getFullYear()
  const settings = useSiteSettings()
  const hasContactInfo = settings.contact_phone || settings.contact_email || settings.contact_address
  const activeSocialLinks = SOCIAL_LINKS.filter((social) => settings[social.key])

  return (
    <footer className="site-footer">
      <div className="container site-footer-grid">
        <div className="site-footer-brand">
          <AppLogo variant="light" />
          <p className="site-footer-tagline">
            Cabinet de conseil et d'ingénierie territoriale, dédié à l'accompagnement des élus locaux, des
            collectivités territoriales et des acteurs du développement local.
          </p>
        </div>

        <div className="site-footer-column">
          <h4 className="site-footer-heading">Navigation</h4>
          <ul>
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer-column">
          <h4 className="site-footer-heading">Domaines d'intervention</h4>
          <ul>
            {FOOTER_DOMAINS.map((domain) => (
              <li key={domain.slug}>
                <Link to="/domaines">{domain.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="site-footer-column">
          <h4 className="site-footer-heading">Contact</h4>
          {hasContactInfo ? (
            <ul className="site-footer-contact-list">
              {settings.contact_phone && (
                <li>
                  <a href={`tel:${settings.contact_phone.replace(/\s+/g, '')}`}>{settings.contact_phone}</a>
                </li>
              )}
              {settings.contact_email && (
                <li>
                  <a href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
                </li>
              )}
              {settings.contact_address && <li className="site-footer-address">{settings.contact_address}</li>}
            </ul>
          ) : (
            <p className="site-footer-note">
              Coordonnées à venir — cette section sera complétée depuis l'espace SuperAdmin.
            </p>
          )}

          {activeSocialLinks.length > 0 && (
            <div className="site-footer-social">
              {activeSocialLinks.map((social) => (
                <a key={social.key} href={settings[social.key]} target="_blank" rel="noreferrer">
                  {social.label}
                </a>
              ))}
            </div>
          )}

          <Link to="/contact" className="site-footer-contact-link">
            Nous contacter →
          </Link>
        </div>
      </div>

      <div className="container site-footer-bottom">
        <p>© {year} Innov'Territoires. Tous droits réservés.</p>
        <div className="site-footer-legal">
          <Link to="/mentions-legales">Mentions légales</Link>
          <Link to="/politique-confidentialite">Politique de confidentialité</Link>
        </div>
      </div>
    </footer>
  )
}

export default Footer
