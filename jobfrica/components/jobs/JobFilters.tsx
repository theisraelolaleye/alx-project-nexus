'use client'

import { useState } from 'react'
import { Search, MapPin, Briefcase, X, Filter } from 'lucide-react'
import { JobFilters as Filters } from '@/types'
import { useNavbarHeight } from '@/hooks/useNavbarHeight'

interface JobFiltersProps {
  onFiltersChange: (filters: Filters) => void
  isMobile?: boolean
  isOpen?: boolean
  onToggle?: () => void
}

export function JobFilters({ onFiltersChange, isMobile = false, isOpen = false, onToggle }: JobFiltersProps) {
  const navbarHeight = useNavbarHeight()
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    location: '',
    experienceLevel: ''
  })

  const [error, setError] = useState<string | null>(null)

  const categories = [
    'All Categories',
    'Design',
    'Engineering',
    'Marketing',
    'Sales',
    'Product',
    'Customer Support',
    'Finance',
    'Human Resources'
  ]

  const locations = [
    'All Locations',
    'Lagos, Nigeria',
    'Cape Town, South Africa',
    'Nairobi, Kenya',
    'Accra, Ghana',
    'Cairo, Egypt',
    'Johannesburg, South Africa',
    'Casablanca, Morocco',
    'Remote'
  ]

  const experienceLevels = [
    { value: '', label: 'All Levels' },
    { value: 'entry', label: 'Entry-Level' },
    { value: 'mid', label: 'Mid-Level' },
    { value: 'senior', label: 'Senior' }
  ]

  const handleFilterChange = (key: string, value: string) => {
    try {
      const newFilters = { ...filters, [key]: value }
      setFilters(newFilters)
      onFiltersChange(newFilters)
      setError(null)
    } catch (err) {
      setError('Failed to apply filter. Please try again.')
      console.error('Filter error:', err)
    }
  }

  const handleReset = () => {
    const resetFilters: Filters = {
      search: '',
      category: '',
      location: '',
      experienceLevel: ''
    }
    setFilters(resetFilters)
    onFiltersChange(resetFilters)
  }

  const filterContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5" aria-hidden="true" />
          Filter Jobs
        </h2>
        {isMobile && onToggle && (
          <button
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm" role="alert">
          {error}
        </div>
      )}

      {/* Search Input */}
      <div className="space-y-2">
        <label htmlFor="job-search" className="block text-sm font-medium text-gray-700">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <input
            id="job-search"
            type="text"
            placeholder="Search by title or keyword"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            aria-describedby="search-description"
          />
          <div id="search-description" className="sr-only">
            Enter job title or keywords to filter job listings
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <select
            id="category-select"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
            aria-describedby="category-description"
          >
            {categories.map((category) => (
              <option key={category} value={category === 'All Categories' ? '' : category}>
                {category}
              </option>
            ))}
          </select>
          <div id="category-description" className="sr-only">
            Select a job category to filter results
          </div>
        </div>
      </div>

      {/* Location Filter */}
      <div className="space-y-2">
        <label htmlFor="location-select" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
          <select
            id="location-select"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none bg-white"
            aria-describedby="location-description"
          >
            {locations.map((location) => (
              <option key={location} value={location === 'All Locations' ? '' : location}>
                {location}
              </option>
            ))}
          </select>
          <div id="location-description" className="sr-only">
            Select a location to filter job results
          </div>
        </div>
      </div>

      {/* Experience Level */}
      <fieldset className="space-y-3">
        <legend className="block text-sm font-medium text-gray-700">
          Experience Level
        </legend>
        <div className="space-y-2" role="radiogroup" aria-describedby="experience-description">
          {experienceLevels.map((level) => (
            <label key={level.value} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="experienceLevel"
                value={level.value}
                checked={filters.experienceLevel === level.value}
                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                aria-describedby="experience-description"
              />
              <span className="ml-2 text-sm text-gray-700">{level.label}</span>
            </label>
          ))}
        </div>
        <div id="experience-description" className="sr-only">
          Select your experience level to filter relevant jobs
        </div>
      </fieldset>

      {/* Reset Button */}
      <button
        onClick={handleReset}
        className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        aria-describedby="reset-description"
      >
        Reset Filters
      </button>
      <div id="reset-description" className="sr-only">
        Clear all active filters and reset the search
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onToggle} />
        <div className="fixed top-0 left-0 right-0 bg-white p-6 max-h-screen overflow-y-auto">
          {filterContent}
        </div>
      </div>
    )
  }

  return (
    <div
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-fit sticky"
      style={{ top: `${navbarHeight + 24}px` }}
    >
      {filterContent}
    </div>
  )
}