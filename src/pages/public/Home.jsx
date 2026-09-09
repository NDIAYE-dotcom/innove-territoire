import MainLayout from '../../components/layout/MainLayout'
import Hero from '../../components/home/Hero'
import Indicators from '../../components/home/Indicators'
import Presentation from '../../components/home/Presentation'
import DomainsPreview from '../../components/home/DomainsPreview'
import ServicesPreview from '../../components/home/ServicesPreview'
import Methodology from '../../components/home/Methodology'
import WhyUs from '../../components/home/WhyUs'
import FormationsPreview from '../../components/home/FormationsPreview'
import CtaBanner from '../../components/home/CtaBanner'
import useScrollToHash from '../../hooks/useScrollToHash'

function Home() {
  useScrollToHash()

  return (
    <MainLayout>
      <Hero />
      <Indicators />
      <Presentation />
      <DomainsPreview />
      <ServicesPreview />
      <Methodology />
      <WhyUs />
      <FormationsPreview />
      <CtaBanner />
    </MainLayout>
  )
}

export default Home
