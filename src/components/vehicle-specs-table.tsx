'use client'

import React from 'react'
import { Car, Gauge, Settings, Shield, Zap, Weight } from 'lucide-react'

interface VehicleSpecsProps {
  specs: Record<string, unknown>
  vehicleName: string
}

export default function VehicleSpecsTable({ specs, vehicleName }: VehicleSpecsProps) {
  // Define specification categories with their fields
  const specCategories = [
    {
      title: 'Engine Specifications',
      icon: Zap,
      color: 'from-gray-700 to-gray-800',
      fields: [
        { key: 'engine', label: 'Engine Type' },
        { key: 'displacement', label: 'Engine Displacement' },
        { key: 'horsepower', label: 'Maximum Power' },
        { key: 'torque', label: 'Maximum Torque' },
        { key: 'fuel', label: 'Fuel Economy' },
        { key: 'fuelCapacity', label: 'Fuel Tank Capacity' }
      ]
    },
    {
      title: 'Transmission & Drivetrain',
      icon: Settings,
      color: 'from-slate-700 to-slate-800',
      fields: [
        { key: 'transmission', label: 'Transmission' },
        { key: 'drivetrain', label: 'Drivetrain' }
      ]
    },
    {
      title: 'Capacity & Weight',
      icon: Weight,
      color: 'from-zinc-700 to-zinc-800',
      fields: [
        { key: 'capacity', label: 'Seating Capacity' },
        { key: 'seatingCapacity', label: 'Total Seats' },
        { key: 'weight', label: 'Vehicle Weight' }
      ]
    },
    {
      title: 'Interior & Comfort',
      icon: Car,
      color: 'from-stone-700 to-stone-800',
      fields: [
        { key: 'interior', label: 'Interior Features' },
        { key: 'comfort', label: 'Comfort Features' },
        { key: 'airConditioning', label: 'Climate Control' },
        { key: 'upholstery', label: 'Upholstery' },
        { key: 'dashboard', label: 'Dashboard Features' },
        { key: 'infotainment', label: 'Infotainment System' },
        { key: 'storage', label: 'Storage' },
        { key: 'cabinSpace', label: 'Cabin Space' },
        { key: 'legRoom', label: 'Leg Room' }
      ]
    },
    {
      title: 'Safety Features',
      icon: Shield,
      color: 'from-neutral-700 to-neutral-800',
      fields: [
        { key: 'abs', label: 'Anti-lock Braking System' },
        { key: 'esc', label: 'Electronic Stability Control' },
        { key: 'tcs', label: 'Traction Control System' },
        { key: 'brakes', label: 'Braking System' },
        { key: 'airbags', label: 'Airbag System' },
        { key: 'seatbelts', label: 'Seatbelt System' },
        { key: 'safety', label: 'Safety Features' },
        { key: 'safetyRating', label: 'Safety Rating' },
        { key: 'rating', label: 'Overall Rating' }
      ]
    },
    {
      title: 'Technology & Features',
      icon: Gauge,
      color: 'from-gray-700 to-gray-800',
      fields: [
        { key: 'technology', label: 'Technology Features' },
        { key: 'features', label: 'Special Features' }
      ]
    }
  ]

  // Filter out empty categories
  const populatedCategories = specCategories.map(category => ({
    ...category,
    fields: category.fields.filter(field => specs[field.key] && specs[field.key].toString().trim() !== '')
  })).filter(category => category.fields.length > 0)

  if (populatedCategories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-8">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-full p-6 mb-6">
          <Car className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Specifications Available</h3>
        <p className="text-gray-500 text-center max-w-md">
          No specifications are currently available for this vehicle.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
        <h3 className="text-2xl font-bold text-black flex items-center">
          <Gauge className="h-7 w-7 mr-3 text-gray-600" />
          {vehicleName} Specifications
        </h3>
        <p className="text-gray-600 mt-2">Detailed technical specifications and features</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-800 to-gray-900">
              <th className="px-6 py-4 text-left font-bold text-white text-sm uppercase tracking-wide w-1/3">
                SPECIFICATION
              </th>
              <th className="px-6 py-4 text-left font-bold text-white text-sm uppercase tracking-wide">
                VALUE
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {populatedCategories.map((category, categoryIndex) => {
              const Icon = category.icon
              return (
                <React.Fragment key={categoryIndex}>
                  {/* Category Header */}
                  <tr>
                    <td colSpan={2} className={`bg-gradient-to-r ${category.color} px-6 py-4`}>
                      <div className="flex items-center text-white">
                        <Icon className="h-6 w-6 mr-3" />
                        <span className="text-lg font-bold uppercase tracking-wide">{category.title}</span>
                      </div>
                    </td>
                  </tr>
                  {/* Specification Rows */}
                  {category.fields.map((field, fieldIndex) => (
                    <tr key={fieldIndex} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="sticky left-0 z-10 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 font-semibold text-black border-r border-gray-200">
                        <div className="flex items-center">
                          <span className="w-2 h-2 bg-gray-600 rounded-full mr-3"></span>
                          {field.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-black">
                        <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
                          {specs[field.key]}
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}