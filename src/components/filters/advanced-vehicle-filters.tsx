'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { 
  Filter, Search, X, ChevronDown, ChevronUp, 
  SlidersHorizontal, RotateCcw, Check, MapPin,
  Calendar, DollarSign, Fuel, Gauge, Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessibleInput, AccessibleSelect, AccessibleCheckbox } from '@/components/accessibility/accessible-form'
import { ResponsiveContainer, ResponsiveStack } from '@/components/ui/responsive-container'
import { TouchButton } from '@/components/navigation/mobile-nav'
import { cn } from '@/lib/utils'

interface FilterOption {
  id: string
  label: string
  value: string
  count?: number
}

interface FilterSection {
  id: string
  label: string
  type: 'select' | 'multiselect' | 'range' | 'search' | 'checkbox'
  options?: FilterOption[]
  min?: number
  max?: number
  step?: number
  placeholder?: string
  icon?: React.ComponentType<{ className?: string }>
}

interface FilterState {
  [key: string]: string | string[] | number[] | boolean
}

interface AdvancedVehicleFiltersProps {
  onFilterChange?: (filters: FilterState) => void
  initialFilters?: FilterState
  className?: string
  showMobileToggle?: boolean
}

// Mock filter sections - in real app, fetch from API
const filterSections: FilterSection[] = [
  {
    id: 'search',
    label: 'Search',
    type: 'search',
    placeholder: 'Search vehicles...',
    icon: Search
  },
  {
    id: 'category',
    label: 'Category',
    type: 'multiselect',
    icon: MapPin,
    options: [
      { id: 'electric', label: 'Electric Trucks', value: 'electric', count: 24 },
      { id: 'diesel', label: 'Diesel Trucks', value: 'diesel', count: 45 },
      { id: 'van', label: 'Commercial Vans', value: 'van', count: 18 },
      { id: 'heavy-duty', label: 'Heavy Duty', value: 'heavy-duty', count: 12 }
    ]
  },
  {
    id: 'price',
    label: 'Price Range',
    type: 'range',
    min: 0,
    max: 500000,
    step: 5000,
    icon: DollarSign
  },
  {
    id: 'year',
    label: 'Year Range',
    type: 'range',
    min: 2015,
    max: 2025,
    step: 1,
    icon: Calendar
  },
  {
    id: 'fuelType',
    label: 'Fuel Type',
    type: 'multiselect',
    icon: Fuel,
    options: [
      { id: 'electric', label: 'Electric', value: 'electric', count: 24 },
      { id: 'diesel', label: 'Diesel', value: 'diesel', count: 45 },
      { id: 'hybrid', label: 'Hybrid', value: 'hybrid', count: 8 },
      { id: 'gasoline', label: 'Gasoline', value: 'gasoline', count: 15 }
    ]
  },
  {
    id: 'transmission',
    label: 'Transmission',
    type: 'select',
    icon: Gauge,
    options: [
      { id: 'any', label: 'Any Transmission', value: '' },
      { id: 'manual', label: 'Manual', value: 'manual', count: 32 },
      { id: 'automatic', label: 'Automatic', value: 'automatic', count: 58 }
    ]
  },
  {
    id: 'seatingCapacity',
    label: 'Seating Capacity',
    type: 'select',
    icon: Users,
    options: [
      { id: 'any', label: 'Any Capacity', value: '' },
      { id: '2', label: '2 Seats', value: '2', count: 45 },
      { id: '3', label: '3 Seats', value: '3', count: 28 },
      { id: '5plus', label: '5+ Seats', value: '5+', count: 17 }
    ]
  },
  {
    id: 'featured',
    label: 'Featured Only',
    type: 'checkbox'
  },
  {
    id: 'available',
    label: 'Available Only',
    type: 'checkbox'
  }
]

export function AdvancedVehicleFilters({ 
  onFilterChange, 
  initialFilters = {},
  className,
  showMobileToggle = true 
}: AdvancedVehicleFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [activeFilterCount, setActiveFilterCount] = useState(0)

  // Initialize filters from URL params
  useEffect(() => {
    const urlFilters: FilterState = {}
    
    for (const [key, value] of searchParams.entries()) {
      const section = filterSections.find(s => s.id === key)
      if (section) {
        if (section.type === 'multiselect') {
          urlFilters[key] = value.split(',').filter(Boolean)
        } else if (section.type === 'range') {
          const [min, max] = value.split('-').map(Number)
          urlFilters[key] = [min || section.min || 0, max || section.max || 1000000]
        } else if (section.type === 'checkbox') {
          urlFilters[key] = value === 'true'
        } else {
          urlFilters[key] = value
        }
      }
    }
    
    setFilters({ ...initialFilters, ...urlFilters })
  }, [searchParams, initialFilters])

  // Count active filters
  useEffect(() => {
    let count = 0
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'search' && value) count++
      else if (Array.isArray(value) && value.length > 0) count++
      else if (typeof value === 'boolean' && value) count++
      else if (typeof value === 'string' && value) count++
      else if (Array.isArray(value) && value.length === 2) {
        const section = filterSections.find(s => s.id === key)
        if (section && section.type === 'range') {
          const [min, max] = value as number[]
          if (min !== (section.min || 0) || max !== (section.max || 1000000)) {
            count++
          }
        }
      }
    })
    setActiveFilterCount(count)
  }, [filters])

  // Update URL and trigger filter change
  const updateFilters = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
    
    // Update URL
    const params = new URLSearchParams()
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        if (filterSections.find(s => s.id === key)?.type === 'range') {
          const [min, max] = value as number[]
          const section = filterSections.find(s => s.id === key)
          if (min !== (section?.min || 0) || max !== (section?.max || 1000000)) {
            params.set(key, `${min}-${max}`)
          }
        } else {
          params.set(key, value.join(','))
        }
      } else if (typeof value === 'boolean' && value) {
        params.set(key, 'true')
      } else if (typeof value === 'string' && value) {
        params.set(key, value)
      }
    })
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    onFilterChange?.(newFilters)
  }, [router, pathname, onFilterChange])

  const handleFilterChange = (sectionId: string, value: any) => {
    const newFilters = { ...filters, [sectionId]: value }
    updateFilters(newFilters)
  }

  const clearAllFilters = () => {
    updateFilters({})
  }

  const clearFilter = (sectionId: string) => {
    const { [sectionId]: removed, ...newFilters } = filters
    updateFilters(newFilters)
  }

  // Render different filter types
  const renderFilter = (section: FilterSection) => {
    const Icon = section.icon

    switch (section.type) {
      case 'search':
        return (
          <div className="relative">
            <AccessibleInput
              type="text"
              placeholder={section.placeholder}
              value={(filters[section.id] as string) || ''}
              onChange={(e) => handleFilterChange(section.id, e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        )

      case 'select':
        return (
          <AccessibleSelect
            options={section.options || []}
            value={(filters[section.id] as string) || ''}
            onChange={(e) => handleFilterChange(section.id, e.target.value)}
            placeholder="Select option..."
          />
        )

      case 'multiselect':
        return (
          <div className="space-y-2">
            {section.options?.map((option) => {
              const isSelected = (filters[section.id] as string[] || []).includes(option.value)
              return (
                <div
                  key={option.id}
                  className={cn(
                    'flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors',
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                  onClick={() => {
                    const current = (filters[section.id] as string[]) || []
                    const newValue = isSelected
                      ? current.filter(v => v !== option.value)
                      : [...current, option.value]
                    handleFilterChange(section.id, newValue)
                  }}
                >
                  <div className="flex items-center">
                    <div className={cn(
                      'w-4 h-4 border-2 rounded mr-3 flex items-center justify-center',
                      isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                    )}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  {option.count && (
                    <Badge variant="secondary" className="text-xs">
                      {option.count}
                    </Badge>
                  )}
                </div>
              )
            })}
          </div>
        )

      case 'range':
        const [min, max] = (filters[section.id] as number[]) || [section.min || 0, section.max || 1000000]
        return (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Min</label>
                <AccessibleInput
                  type="number"
                  min={section.min}
                  max={section.max}
                  step={section.step}
                  value={min}
                  onChange={(e) => {
                    const newMin = Number(e.target.value)
                    handleFilterChange(section.id, [newMin, max])
                  }}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Max</label>
                <AccessibleInput
                  type="number"
                  min={section.min}
                  max={section.max}
                  step={section.step}
                  value={max}
                  onChange={(e) => {
                    const newMax = Number(e.target.value)
                    handleFilterChange(section.id, [min, newMax])
                  }}
                />
              </div>
            </div>
            
            {/* Range slider visualization */}
            <div className="px-2">
              <div className="text-xs text-gray-500 flex justify-between mb-1">
                <span>${section.min?.toLocaleString()}</span>
                <span>${section.max?.toLocaleString()}</span>
              </div>
              <div className="text-sm text-center font-medium text-blue-600">
                ${min?.toLocaleString()} - ${max?.toLocaleString()}
              </div>
            </div>
          </div>
        )

      case 'checkbox':
        return (
          <AccessibleCheckbox
            label={section.label}
            checked={(filters[section.id] as boolean) || false}
            onChange={(e) => handleFilterChange(section.id, e.target.checked)}
          />
        )

      default:
        return null
    }
  }

  // Active filters display
  const ActiveFilters = () => {
    if (activeFilterCount === 0) return null

    return (
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-sm font-medium text-gray-700">Active filters:</span>
        {Object.entries(filters).map(([key, value]) => {
          const section = filterSections.find(s => s.id === key)
          if (!section || !value) return null

          let displayValue = ''
          if (typeof value === 'string' && value) {
            displayValue = value
          } else if (Array.isArray(value) && value.length > 0) {
            if (section.type === 'range') {
              const [min, max] = value as number[]
              displayValue = `${min?.toLocaleString()}-${max?.toLocaleString()}`
            } else {
              displayValue = value.join(', ')
            }
          } else if (typeof value === 'boolean' && value) {
            displayValue = section.label
          }

          if (!displayValue) return null

          return (
            <Badge 
              key={key} 
              variant="secondary" 
              className="flex items-center gap-1 pr-1 cursor-pointer hover:bg-gray-200"
              onClick={() => clearFilter(key)}
            >
              <span className="text-xs">
                {section.label}: {displayValue}
              </span>
              <X className="h-3 w-3" />
            </Badge>
          )
        })}
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-xs h-6 px-2"
        >
          Clear all
        </Button>
      </div>
    )
  }

  // Mobile filters
  if (showMobileToggle) {
    return (
      <>
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6">
          <ResponsiveStack direction={{ default: 'row' }} justify="between" align="center">
            <TouchButton
              variant="secondary"
              size="md"
              onClick={() => setIsMobileOpen(true)}
              className="flex items-center"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 bg-blue-600 text-white">
                  {activeFilterCount}
                </Badge>
              )}
            </TouchButton>
            
            {activeFilterCount > 0 && (
              <TouchButton
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear
              </TouchButton>
            )}
          </ResponsiveStack>
        </div>

        {/* Mobile Filter Modal */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileOpen(false)} />
            <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-lg max-h-[90vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Filter Vehicles</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="overflow-y-auto p-4 space-y-6" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                {filterSections.map((section) => (
                  <div key={section.id}>
                    <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                      {section.icon && <section.icon className="h-4 w-4 mr-2" />}
                      {section.label}
                    </h3>
                    {renderFilter(section)}
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-3">
                  <TouchButton
                    variant="secondary"
                    size="md"
                    onClick={clearAllFilters}
                    className="flex-1"
                  >
                    Clear All
                  </TouchButton>
                  <TouchButton
                    variant="primary"
                    size="md"
                    onClick={() => setIsMobileOpen(false)}
                    className="flex-1"
                  >
                    Apply Filters
                  </TouchButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters (Mobile) */}
        <div className="lg:hidden">
          <ActiveFilters />
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:block">
          <Card className={className}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-lg">
                <span className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Filters
                </span>
                {activeFilterCount > 0 && (
                  <Badge className="bg-blue-600 text-white">
                    {activeFilterCount}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ActiveFilters />
              {filterSections.map((section) => (
                <div key={section.id}>
                  <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    {section.icon && <section.icon className="h-4 w-4 mr-2" />}
                    {section.label}
                  </h3>
                  {renderFilter(section)}
                </div>
              ))}
              
              <div className="pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="w-full"
                  disabled={activeFilterCount === 0}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    )
  }

  // Default desktop-only filters
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </span>
          {activeFilterCount > 0 && (
            <Badge className="bg-blue-600 text-white">
              {activeFilterCount}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ActiveFilters />
        {filterSections.map((section) => (
          <div key={section.id}>
            <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
              {section.icon && <section.icon className="h-4 w-4 mr-2" />}
              {section.label}
            </h3>
            {renderFilter(section)}
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllFilters}
            className="w-full"
            disabled={activeFilterCount === 0}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}