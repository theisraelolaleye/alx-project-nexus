'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Calendar,
  Users,
  Share2,
  Bookmark,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react'
import { Job } from '@/types'
import { externalJobsApi } from '@/lib/api'
import { useJobStore } from '@/store/jobStore'

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const getJobById = useJobStore(state => state.getJobById)
  const upsertJob = useJobStore(state => state.upsertJob)
  const [isSaved, setIsSaved] = useState(false)
  const [allJobs, setAllJobs] = useState<Job[]>([])

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        // Try store first for instant detail rendering
        const existing = getJobById(jobId)
        if (existing) {
          setJob(existing)
          setLoading(false)
          return
        }

        // Fetch full details for this job id via API
        const detailedJob = await externalJobsApi.getJobDetails(jobId)
        if (detailedJob) {
          upsertJob(detailedJob)
          setJob(detailedJob)
          setLoading(false)
          return
        }

        // As a final fallback: fetch list and find by id
        const jobsData = await externalJobsApi.getJobs()
        setAllJobs(jobsData)
        const foundJob = jobsData.find((j: Job) => j.id === jobId)
        if (foundJob) upsertJob(foundJob)
        setJob(foundJob || null)
      } catch (error) {
        console.error('Failed to fetch jobs:', error)
        setJob(null)
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchJobs()
    }
  }, [jobId])

  const handleApply = () => {
    // TODO: Implement apply logic
    console.log('Apply to job:', jobId)
    router.push(`/jobs/${jobId}/apply`)
  }

  const handleSave = () => {
    setIsSaved(!isSaved)
    // TODO: Implement save job logic
    console.log('Save job:', jobId, !isSaved)
  }

  const handleShare = () => {
    // Share functionality
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Check out this job: ${job?.title} at ${job?.company}`,
        url: window.location.href
      }).catch(console.error)
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="bg-white rounded-lg p-8 space-y-4">
              <div className="h-10 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-1/2" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you&apos;re looking for doesn&apos;t exist or has been removed.</p>
          <button
            onClick={() => router.push('/jobs')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Jobs
        </button>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Job Details - Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Card */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-start gap-4 mb-6">
                {job.companyLogo ? (
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                )}

                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-4 flex-wrap">
                    <span className="flex items-center">
                      <Building2 className="w-4 h-4 mr-1" />
                      {job.company}
                    </span>
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {job.postedDate}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      {job.type}
                    </span>
                    {job.isRemote && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                        Remote
                      </span>
                    )}
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {job.salary}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleApply}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Apply Now
                </button>
                <button
                  onClick={handleSave}
                  className={`p-3 border rounded-lg transition-colors ${isSaved
                    ? 'border-blue-600 text-blue-600 bg-blue-50'
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                    }`}
                  title={isSaved ? 'Saved' : 'Save job'}
                >
                  <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 border border-gray-300 text-gray-600 rounded-lg hover:border-gray-400 transition-colors"
                  title="Share job"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Job Description</h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Requirements */}
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Requirements</h2>
                <ul className="space-y-3">
                  {job.requirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mr-3 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Responsibilities */}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Responsibilities</h2>
                <ul className="space-y-3">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mr-3 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Benefits & Perks</h2>
                <ul className="space-y-3">
                  {job.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="w-5 h-5 text-purple-600 mr-3 shrink-0 mt-0.5" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills/Tags */}
            {job.tags && job.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Right Column */}
          <div className="space-y-6">
            {/* Job Overview */}
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Job Overview</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mr-3 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Posted</p>
                    <p className="text-sm font-medium text-gray-900">{job.postedDate}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Briefcase className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Job Type</p>
                    <p className="text-sm font-medium text-gray-900">{job.type}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-sm font-medium text-gray-900">{job.location}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <DollarSign className="w-5 h-5 text-gray-400 mr-3 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Salary Range</p>
                    <p className="text-sm font-medium text-gray-900">{job.salary}</p>
                  </div>
                </div>

                {job.experienceLevel && (
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-gray-400 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Experience Level</p>
                      <p className="text-sm font-medium text-gray-900">{job.experienceLevel}</p>
                    </div>
                  </div>
                )}

                {job.category && (
                  <div className="flex items-start">
                    <Briefcase className="w-5 h-5 text-gray-400 mr-3 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Category</p>
                      <p className="text-sm font-medium text-gray-900">{job.category}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={handleApply}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Apply for this Job
                </button>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">About {job.company}</h3>
              <div className="flex items-center gap-4 mb-4">
                {job.companyLogo ? (
                  <img
                    src={job.companyLogo}
                    alt={job.company}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-blue-600" />
                  </div>
                )}
                <div>
                  <p className="font-medium text-gray-900">{job.company}</p>
                  <p className="text-sm text-gray-600">{job.location}</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Learn more about the company and explore other opportunities.
              </p>
              <button
                onClick={() => router.push(`/companies`)}
                className="w-full text-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors"
              >
                View Company Profile
              </button>
            </div>

            {/* Share Section */}
            <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Share this Job</h3>
              <p className="text-sm text-gray-600 mb-4">
                Help someone find their dream job
              </p>
              <button
                onClick={handleShare}
                className="w-full bg-white border border-blue-200 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 text-sm font-medium transition-colors flex items-center justify-center"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Job
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}