'use client'
import axios from 'axios'
import { useState, useMemo, useEffect } from 'react'
import { Filter } from 'lucide-react'
import { JobFilters } from '@/components/jobs/JobFilters'
import { JobList } from '@/components/jobs/JobList'
import { Pagination } from '@/components/jobs/Pagination'
import { ViewToggle, ViewMode } from '@/components/jobs/ViewToggle'
import { externalJobsApi } from '@/lib/api'
import { useJobStore } from '@/store/jobStore'
import { Job } from '@/types'

interface Filters {
  search: string
  category: string
  location: string
  experienceLevel: string
}

const JOBS_PER_PAGE = 6

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const setJobsInStore = useJobStore(state => state.setJobs)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    location: '',
    experienceLevel: ''
  })

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        console.log('Fetching jobs from external API...')
        const jobsData = await externalJobsApi.getJobs({
          query: filters.search || 'developer',
          location: filters.location || 'chicago',
          page: String(currentPage)
        })
        setJobs(jobsData)
        setJobsInStore(jobsData)


        // const response = await axios.get('https://jobdataapi.com/api/jobs/')
        // const data = response.data
        // console.log('Raw jobs data:', data)
        // setJobs(data)



      } catch (error) {
        console.error('Failed to fetch jobs:', error)
        setJobs([])
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [filters.search, filters.location, currentPage])

  // Filter jobs based on current filters using useMemo
  const filteredJobs = useMemo(() => {
    let filtered = [...jobs]

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchTerm) ||
        job.company?.toLowerCase().includes(searchTerm) ||
        job.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(job =>
        job.tags?.some(tag => tag.toLowerCase().includes(filters.category.toLowerCase()))
      )
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(job =>
        job.location?.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    // Experience level filter
    if (filters.experienceLevel) {
      filtered = filtered.filter(job =>
        job.experienceLevel?.toLowerCase().includes(filters.experienceLevel.toLowerCase())
      )
    }

    return filtered
  }, [jobs, filters])

  // Get jobs for current page
  const getCurrentPageJobs = () => {
    const startIndex = (currentPage - 1) * JOBS_PER_PAGE
    const endIndex = startIndex + JOBS_PER_PAGE
    return filteredJobs.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE)

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filters change
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of job list
    window.scrollTo({ top: 300, behavior: 'smooth' })
  }

  const toggleMobileFilters = () => {
    setIsMobileFiltersOpen(!isMobileFiltersOpen)
  }

  return (
    <div className="bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Next Opportunity</h1>
          <p className="text-lg text-gray-600">
            Discover {loading ? '...' : jobs.length} amazing job opportunities
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMobileFilters}
              className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Filters Sidebar */}
          <aside className="hidden lg:block w-80 shrink-0">
            <JobFilters
              onFiltersChange={handleFiltersChange}
            />
          </aside>

          {/* Mobile Filters */}
          <JobFilters
            isMobile={true}
            isOpen={isMobileFiltersOpen}
            onToggle={toggleMobileFilters}
            onFiltersChange={handleFiltersChange}
          />

          {/* Job Listings */}
          <main className="flex-1 min-w-0">
            {/* Header with view toggle */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Job Results
                </h2>
              </div>

              <ViewToggle
                viewMode={viewMode}
                onViewChange={setViewMode}
              />
            </div>

            <JobList
              jobs={getCurrentPageJobs()}
              loading={loading}
              emptyStateMessage="No jobs found. Try adjusting your filters."
              viewMode={viewMode}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}