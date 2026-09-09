import MainLayout from '../../components/layout/MainLayout'
import PagePlaceholder from '../../components/common/PagePlaceholder'

function LegalNotice() {
  return (
    <MainLayout>
      <PagePlaceholder
        eyebrow="Informations légales"
        title="Mentions légales"
        description="Contenu à renseigner depuis l'espace SuperAdmin."
      />
    </MainLayout>
  )
}

export default LegalNotice
