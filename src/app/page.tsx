import HeroSection from '@/components/hero-section'
import ComingSoonSection from '@/components/coming-soon-section'
import FeaturedVehicles from '@/components/featured-vehicles'
import VehicleCategories from '@/components/vehicle-categories'
import TrustSection from '@/components/trust-section'

export default function Home() {
  return (
    <>
      <ComingSoonSection />
      <HeroSection />
      <VehicleCategories />
      <FeaturedVehicles />
      <TrustSection />
    </>
  )
}
