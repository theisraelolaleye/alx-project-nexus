import { memo } from 'react'
import Image from 'next/image'
import { MapPin, Clock, Building2, ArrowRight } from 'lucide-react'
import { Job } from '@/types'
import { ViewMode } from './ViewToggle'
import { SafeDateDisplay } from '@/components/common/ClientOnlyDate'

interface JobCardProps {
  job: Job
  onClick?: (job: Job) => void
  viewMode?: ViewMode
}

const JobCard = memo<JobCardProps>(({ job, onClick, viewMode = 'grid' }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(job)
    }
  }

  const getExperienceLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'entry':
      case 'entry-level':
        return 'bg-green-100 text-green-800'
      case 'mid':
      case 'mid-level':
        return 'bg-blue-100 text-blue-800'
      case 'senior':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getJobTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full-time':
        return 'bg-blue-100 text-blue-800'
      case 'part-time':
        return 'bg-orange-100 text-orange-800'
      case 'contract':
        return 'bg-yellow-100 text-yellow-800'
      case 'remote':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Grid view (original layout)
  if (viewMode === 'grid') {
    return (
      <div
        data-testid="job-card"
        data-job-id={job.id}
        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
        onClick={handleClick}
        role="article"
        aria-label={`Job: ${job.title} at ${job.company}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Company Logo */}
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
              {job.logo ? (
                <Image
                  src={job.logo}
                  alt={`${job.company} logo`}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-md object-cover"
                />
              ) : (
                <Building2 className="w-6 h-6 text-white" />
              )}
            </div>

            {/* Job Info */}
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-lg">
                {job.title}
              </h3>
              <p className="text-gray-600 text-sm font-medium">{job.company}</p>
            </div>
          </div>
        </div>

        {/* Location and Posted Date */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <SafeDateDisplay dateString={job.postedDate} />
          </div>
        </div>

        <div className="mb-4 flex items-center gap-2">
          {/* Experience Level */}
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getExperienceLevelColor(job.experienceLevel)}`}>
            {job.experienceLevel}
          </span>

          {/* Job Type Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.type)} whitespace-nowrap`}>
            {job.type}
          </span>
        </div>

        {/* Salary */}
        {job.salary && (
          <div className="mb-4">
            <span className="font-semibold text-gray-900">{job.salary}</span>
          </div>
        )}

        {/* Tags */}
        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {job.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{job.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          className="w-full bg-gray-100 text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-colors group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center gap-2"
          onClick={(e) => {
            e.stopPropagation()
            handleClick()
          }}
        >
          <span>View Details</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    )
  }

  // List view (horizontal layout)
  return (
    <div
      data-testid="job-card"
      data-job-id={job.id}
      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
      onClick={handleClick}
      role="article"
      aria-label={`Job: ${job.title} at ${job.company}`}
    >
      <div className="flex items-center gap-6">
        {/* Company Logo */}
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
          {job.logo ? (
            <Image
              src={job.logo}
              alt={`${job.company} logo`}
              width={40}
              height={40}
              className="w-10 h-10 rounded-md object-cover"
            />
          ) : (
            <Building2 className="w-8 h-8 text-white" />
          )}
        </div>

        {/* Job Info - Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-xl mb-1">
                {job.title}
              </h3>
              <p className="text-gray-600 font-medium mb-2">{job.company}</p>
            </div>

            {/* Salary */}
            {job.salary && (
              <div className="text-right">
                <span className="font-semibold text-gray-900 text-lg">{job.salary}</span>
              </div>
            )}
          </div>

          {/* Location, Date, and Job Type */}
          <div className="flex items-center gap-6 mb-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{job.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <SafeDateDisplay dateString={job.postedDate} />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.type)}`}>
              {job.type}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getExperienceLevelColor(job.experienceLevel)}`}>
              {job.experienceLevel}
            </span>
          </div>

          {/* Tags */}
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-0">
              {job.tags.slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {job.tags.length > 4 && (
                <span className="text-xs text-gray-500">
                  +{job.tags.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="shrink-0">
          <button
            className="bg-gray-100 text-gray-900 py-3 px-6 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-colors group-hover:bg-blue-600 group-hover:text-white flex items-center gap-2"
            onClick={(e) => {
              e.stopPropagation()
              handleClick()
            }}
          >
            <span>View Details</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
})

JobCard.displayName = 'JobCard'

export { JobCard }