'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Filter } from 'lucide-react'

interface FilterState {
  category: string[]
  priceMin: string
  priceMax: string
  status: string[]
  search: string
}

interface Category {
  id: string
  name: string
  slug: string
}

const statusOptions = [
  { id: 'AVAILABLE', label: 'Available' },
  { id: 'RESERVED', label: 'Reserved' },
  { id: 'SOLD', label: 'Sold' }
]

export default function VehicleFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category')?.split(',') || [],
    priceMin: searchParams.get('priceMin') || '',
    priceMax: searchParams.get('priceMax') || '',
    status: searchParams.get('status')?.split(',') || [],
    search: searchParams.get('search') || ''
  })

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data)
        } else {
          console.error('Failed to fetch categories')
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      } finally {
        setIsLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  // Update filters when URL search params change
  useEffect(() => {
    setFilters({
      category: searchParams.get('category')?.split(',') || [],
      priceMin: searchParams.get('priceMin') || '',
      priceMax: searchParams.get('priceMax') || '',
      status: searchParams.get('status')?.split(',') || [],
      search: searchParams.get('search') || ''
    })
  }, [searchParams])

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters }
    setFilters(updated)
    
    // Build query string
    const params = new URLSearchParams()
    if (updated.category.length) params.set('category', updated.category.join(','))
    if (updated.priceMin) params.set('priceMin', updated.priceMin)
    if (updated.priceMax) params.set('priceMax', updated.priceMax)
    if (updated.status.length) params.set('status', updated.status.join(','))
    if (updated.search) params.set('search', updated.search)
    
    const query = params.toString()
    router.push(`/vehicles${query ? `?${query}` : ''}`, { scroll: false })
  }

  const clearAllFilters = () => {
    const cleared = {
      category: [],
      priceMin: '',
      priceMax: '',
      status: [],
      search: ''
    }
    setFilters(cleared)
    router.push('/vehicles', { scroll: false })
  }

  const toggleCategory = (categorySlug: string) => {
    const newCategories = filters.category.includes(categorySlug)
      ? filters.category.filter(c => c !== categorySlug)
      : [...filters.category, categorySlug]
    updateFilters({ category: newCategories })
  }

  const toggleStatus = (statusId: string) => {
    const newStatus = filters.status.includes(statusId)
      ? filters.status.filter(s => s !== statusId)
      : [...filters.status, statusId]
    updateFilters({ status: newStatus })
  }

  const hasActiveFilters = 
    filters.category.length > 0 || 
    filters.priceMin || 
    filters.priceMax || 
    filters.status.length > 0 || 
    filters.search

  return (
    <>
      {/* Mobile filter toggle */}
      <div className="lg:hidden mb-6">
        <Button
          variant="secondary"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters {hasActiveFilters && `(${
            filters.category.length + 
            filters.status.length + 
            (filters.priceMin ? 1 : 0) + 
            (filters.priceMax ? 1 : 0) + 
            (filters.search ? 1 : 0)
          })`}
        </Button>
      </div>

      {/* Filter panel */}
      <div className={`
        lg:block bg-white rounded-lg p-6 border border-gray-200 shadow-sm
        ${isOpen ? 'block' : 'hidden'}
      `}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Search */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <Input
            type="text"
            placeholder="Search vehicles..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
          />
        </div>

        {/* Categories */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Category</h4>
          <div className="space-y-2">
            {isLoadingCategories ? (
              <div className="animate-pulse space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </div>
                ))}
              </div>
            ) : (
              categories.map((category) => (
                <label key={category.slug} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.category.includes(category.slug)}
                    onChange={() => toggleCategory(category.slug)}
                    className="rounded border-gray-300 text-gray-600"
                  />
                  <span className="text-gray-700 text-sm">{category.name}</span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Price Range</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceMin}
                onChange={(e) => updateFilters({ priceMin: e.target.value })}
              />
            </div>
            <div>
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceMax}
                onChange={(e) => updateFilters({ priceMax: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Availability</h4>
          <div className="space-y-2">
            {statusOptions.map((status) => (
              <label key={status.id} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.status.includes(status.id)}
                  onChange={() => toggleStatus(status.id)}
                  className="rounded border-gray-300 text-gray-600"
                />
                <span className="text-gray-700 text-sm">{status.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Active Filters</h4>
            <div className="flex flex-wrap gap-2">
              {filters.category.map((categorySlug) => {
                const category = categories.find(c => c.slug === categorySlug)
                return (
                  <span
                    key={categorySlug}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200"
                  >
                    {category?.name || categorySlug}
                    <button
                      onClick={() => toggleCategory(categorySlug)}
                      className="ml-1 hover:text-gray-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )
              })}
              {filters.status.map((stat) => {
                const status = statusOptions.find(s => s.id === stat)
                return (
                  <span
                    key={stat}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200"
                  >
                    {status?.label}
                    <button
                      onClick={() => toggleStatus(stat)}
                      className="ml-1 hover:text-gray-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )
              })}
              {(filters.priceMin || filters.priceMax) && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">
                  ${filters.priceMin || '0'} - ${filters.priceMax || '∞'}
                  <button
                    onClick={() => updateFilters({ priceMin: '', priceMax: '' })}
                    className="ml-1 hover:text-gray-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">
                  &ldquo;{filters.search}&rdquo;
                  <button
                    onClick={() => updateFilters({ search: '' })}
                    className="ml-1 hover:text-gray-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  )
}