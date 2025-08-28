import HeroSection from '@/components/hero-section'
import FeaturedVehicles from '@/components/featured-vehicles'
import VehicleCategories from '@/components/vehicle-categories'
import TrustSection from '@/components/trust-section'

export default function Home() {
  return (
    <>
      <HeroSection />
      <VehicleCategories />
      <FeaturedVehicles />
      <TrustSection />
    </>
  )
}
