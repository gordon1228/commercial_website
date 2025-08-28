import VehicleGrid from '@/components/vehicle-grid'
import VehicleFilters from '@/components/vehicle-filters'
import { Suspense } from 'react'

export const metadata = {
  title: 'Commercial Vehicles | EliteFleet',
  description: 'Browse our extensive fleet of premium commercial vehicles including trucks, vans, and buses.',
}

export default function VehiclesPage() {
  return (
    <div className="min-h-screen pt-20 bg-background">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
            Commercial Vehicle Fleet
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Discover our comprehensive selection of premium commercial vehicles, each inspected and ready for your business needs.
          </p>
        </div>

        {/* Filters and Grid */}
        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Suspense fallback={<div className="animate-pulse bg-gray-800 h-96 rounded-lg" />}>
              <VehicleFilters />
            </Suspense>
          </div>

          {/* Vehicle Grid */}
          <div className="lg:col-span-3 mt-8 lg:mt-0">
            <Suspense fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-800 aspect-[4/3] rounded-lg mb-4" />
                    <div className="space-y-2">
                      <div className="h-6 bg-gray-800 rounded w-3/4" />
                      <div className="h-8 bg-gray-800 rounded w-1/2" />
                      <div className="h-4 bg-gray-800 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            }>
              <VehicleGrid />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}