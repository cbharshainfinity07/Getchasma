import Hero from '../components/home/Hero'
import FrameFinder from '../components/home/FrameFinder'
import { Marquee, Collections, BestSellers, Spotlight } from '../components/home/Showcase'
import { Lookbook, ProductTabs, Reviews, ServicePromise, Newsletter } from '../components/home/Story'

/**
 * Homepage narrative: hook (hero) > orient (find your frame, collections) > desire (best sellers, signature
 * story, lookbook) > choose (fresh picks) > trust (reviews, promise) > stay in touch (newsletter).
 * Each section uses a different layout family.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <FrameFinder />
      <Collections />
      <BestSellers />
      <Spotlight />
      <Lookbook />
      <ProductTabs />
      <Reviews />
      <ServicePromise />
      <Newsletter />
    </>
  )
}
