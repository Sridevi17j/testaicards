import { useRef } from 'react'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Header from '../components/Header'
import CardGrid from '../components/SampleCards'
import SamplePrompts from '../components/SamplePrompts'
import PlansAndPricing from '../components/PlansandPricing'
import Hero from '../components/Hero'

//const DynamicHero = dynamic(() => import('../components/Hero'), { ssr: false })

export default function Home() {
  const cardGridRef = useRef(null)
  const promptsRef = useRef(null)
  const plansandpricingRef = useRef(null)

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div>
      <Head>
        <title>AICardify - AI-generated greeting cards</title>
        <meta name="description" content="AICards generates greeting cards for all your occasions" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header 
        scrollToCards={() => scrollToSection(cardGridRef)} 
        scrollToPrompts={() => scrollToSection(promptsRef)}
        scrollToPlansandPricing={() => scrollToSection(plansandpricingRef)}
      />
      <main className="bg-gradient-to-br from-gray-900 to-blue-900">
  <Hero />
  <div ref={cardGridRef} className="bg-white">
    <CardGrid />
  </div>
  <div ref={promptsRef} className="bg-gray-100">
    <SamplePrompts />
  </div>
  <div ref={plansandpricingRef} className="bg-white">
    <PlansAndPricing />
  </div>
</main>
    </div>
  )
}