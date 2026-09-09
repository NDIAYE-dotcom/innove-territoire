import { useNavigate } from 'react-router-dom'
import MainLayout from '../../components/layout/MainLayout'
import AppLogo from '../../components/common/AppLogo'
import Button from '../../components/common/Button'
import './NotFound.css'

function NotFound() {
  const navigate = useNavigate()

  return (
    <MainLayout>
      <section className="not-found">
        <div className="container not-found-inner">
          <AppLogo />
          <p className="not-found-code">404</p>
          <h1>Page introuvable</h1>
          <p className="not-found-text">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <div className="not-found-actions">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Retour
            </Button>
            <Button to="/" variant="primary">
              Retour à l'accueil
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  )
}

export default NotFound
