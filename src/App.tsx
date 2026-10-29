import { Contact } from './components/Contact'
import { Customers } from './components/Customers'
import { Features } from './components/Features'
import { FinalCta } from './components/FinalCta'
import { Footer } from './components/Footer'
import { Hero } from './components/Hero'
import { HowItWorks } from './components/HowItWorks'
import { Navbar } from './components/Navbar'
import { Pricing } from './components/Pricing'
import { SavingsCalculator } from './components/SavingsCalculator'
import { TrustBar } from './components/TrustBar'
import { WhatsNew } from './components/WhatsNew'
import { BUILD_INFO } from './config'
import rawReleases from './data/releases.json'
import { parseReleases } from './lib/releases'

const RELEASES = parseReleases(rawReleases)

/** The Trackwell marketing site: one page, one section per component, top to bottom. */
export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar build={BUILD_INFO} />
      <main className="flex-1">
        <Hero />
        <TrustBar />
        <HowItWorks />
        <Features />
        <Customers />
        <SavingsCalculator />
        <Pricing />
        <WhatsNew releases={RELEASES} />
        <FinalCta />
        <Contact />
      </main>
      <Footer build={BUILD_INFO} />
    </div>
  )
}
