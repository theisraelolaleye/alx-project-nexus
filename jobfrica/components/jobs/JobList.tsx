import { Search } from 'lucide-react'
import { JobCard } from './JobCard'
import { Job } from '@/types'
import { ViewMode } from './ViewToggle'

interface JobListProps {
  jobs: Job[]
  loading?: boolean
  emptyStateMessage?: string
  viewMode?: ViewMode
}

export function JobList({ jobs, loading = false, emptyStateMessage = "No jobs found. Try adjusting your filters.", viewMode = 'grid' }: JobListProps) {
  const handleJobClick = (job: Job) => {
    // Navigate to job details page or open modal
    console.log('Job clicked:', job)
    // In a real app, you would navigate to /jobs/[id] or open a modal
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded w-2/3 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="w-20 h-6 bg-gray-200 rounded-full" />
            </div>
            <div className="flex gap-4 mb-4">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
            <div className="h-6 bg-gray-200 rounded w-24 mb-4" />
            <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
            <div className="flex gap-2 mb-4">
              <div className="h-6 bg-gray-200 rounded w-16" />
              <div className="h-6 bg-gray-200 rounded w-20" />
              <div className="h-6 bg-gray-200 rounded w-18" />
            </div>
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (jobs.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
        <p className="text-gray-600 max-w-sm mx-auto">
          {emptyStateMessage}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results count */}

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'}
        </p>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Sort by:</span>
          <select className="border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
            <option value="recent">Most Recent</option>
            <option value="relevance">Relevance</option>
            <option value="salary">Salary</option>
          </select>
        </div>
      </div>

      {/* Job Cards Grid/List */}
      <div className={
        viewMode === 'grid'
          ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
          : "space-y-4"
      }>
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onClick={handleJobClick}
            viewMode={viewMode}
          />
        ))}


      </div>
    </div>
  )
}