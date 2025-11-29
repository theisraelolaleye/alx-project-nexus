'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, CheckCircle2, AlertCircle, FileText, Globe, Github, Linkedin } from 'lucide-react'
import { Job, ApplicationFormData, WorkAuthorizationType } from '@/types'
import { externalJobsApi } from '@/lib/api'

export default function JobApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string

  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<ApplicationFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resume: null,
    coverLetter: '',
    portfolio: '',
    linkedIn: '',
    github: '',
    availableStartDate: '',
    expectedSalary: '',
    workAuthorization: 'Citizen',
    isWillingToRelocate: false
  })

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true)
        const jobsData = await externalJobsApi.getJobs()
        const foundJob = jobsData.find((j: Job) => j.id === jobId)
        setJob(foundJob || null)
      } catch (error) {
        console.error('Failed to fetch job:', error)
        setJob(null)
      } finally {
        setLoading(false)
      }
    }

    if (jobId) {
      fetchJob()
    }
  }, [jobId])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.resume) newErrors.resume = 'Resume is required'
    if (!formData.coverLetter.trim()) newErrors.coverLetter = 'Cover letter is required'
    if (!formData.availableStartDate) newErrors.availableStartDate = 'Available start date is required'

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Phone validation
    if (formData.phone && !/^[\+]?[\s0-9\(\)\-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    // Resume file validation
    if (formData.resume) {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowedTypes.includes(formData.resume.type)) {
        newErrors.resume = 'Resume must be a PDF or Word document'
      }
      if (formData.resume.size > 5 * 1024 * 1024) { // 5MB
        newErrors.resume = 'Resume file size must be less than 5MB'
      }
    }

    // URL validations
    if (formData.portfolio && !/^https?:\/\/.+/.test(formData.portfolio)) {
      newErrors.portfolio = 'Portfolio URL must be a valid web address'
    }
    if (formData.linkedIn && !/^https?:\/\/(www\.)?linkedin\.com\//.test(formData.linkedIn)) {
      newErrors.linkedIn = 'LinkedIn URL must be a valid LinkedIn profile'
    }
    if (formData.github && !/^https?:\/\/(www\.)?github\.com\//.test(formData.github)) {
      newErrors.github = 'GitHub URL must be a valid GitHub profile'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof ApplicationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    handleInputChange('resume', file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append('jobId', jobId)
      submitData.append('firstName', formData.firstName)
      submitData.append('lastName', formData.lastName)
      submitData.append('email', formData.email)
      submitData.append('phone', formData.phone)
      submitData.append('coverLetter', formData.coverLetter)
      submitData.append('availableStartDate', formData.availableStartDate)
      submitData.append('workAuthorization', formData.workAuthorization)
      submitData.append('isWillingToRelocate', formData.isWillingToRelocate.toString())

      if (formData.resume) {
        submitData.append('resume', formData.resume)
      }
      if (formData.portfolio) submitData.append('portfolio', formData.portfolio)
      if (formData.linkedIn) submitData.append('linkedIn', formData.linkedIn)
      if (formData.github) submitData.append('github', formData.github)
      if (formData.expectedSalary) submitData.append('expectedSalary', formData.expectedSalary)

      const response = await fetch('/api/applications', {
        method: 'POST',
        body: submitData
      })

      if (!response.ok) {
        throw new Error('Failed to submit application')
      }

      setSubmitted(true)
    } catch (error) {
      console.error('Failed to submit application:', error)
      alert('Failed to submit application. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h1>
          <p className="text-gray-600 mb-4">The job you're trying to apply for could not be found.</p>
          <button
            onClick={() => router.push('/jobs')}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Browse Available Jobs
          </button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-lg shadow-sm p-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for applying to <strong>{job.title}</strong> at <strong>{job.company}</strong>.
            We'll review your application and get back to you soon.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/jobs/${jobId}`)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Job Details
            </button>
            <button
              onClick={() => router.push('/jobs')}
              className="w-full text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Browse More Jobs
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/jobs/${jobId}`)}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Job Details
          </button>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply for {job.title}</h1>
            <p className="text-gray-600 mb-4">{job.company} • {job.location}</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">{job.type}</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">{job.experienceLevel}</span>
              {job.category && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">{job.category}</span>
              )}
            </div>
          </div>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter your email address"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume & Documents</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume * (PDF or Word document, max 5MB)
              </label>
              <div className={`border-2 border-dashed rounded-lg p-6 text-center ${errors.resume ? 'border-red-300' : 'border-gray-300'
                } hover:border-gray-400 transition-colors`}>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                <label htmlFor="resume-upload" className="cursor-pointer">
                  {formData.resume ? (
                    <div className="flex items-center justify-center">
                      <FileText className="w-8 h-8 text-green-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formData.resume.name}</p>
                        <p className="text-xs text-gray-500">
                          {(formData.resume.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          handleInputChange('resume', null)
                        }}
                        className="ml-3 p-1 text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Click to upload your resume</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX files only</p>
                    </div>
                  )}
                </label>
              </div>
              {errors.resume && <p className="text-red-500 text-sm mt-1">{errors.resume}</p>}
            </div>
          </div>

          {/* Cover Letter */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Cover Letter</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter *
              </label>
              <textarea
                value={formData.coverLetter}
                onChange={(e) => handleInputChange('coverLetter', e.target.value)}
                rows={6}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.coverLetter ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              />
              {errors.coverLetter && <p className="text-red-500 text-sm mt-1">{errors.coverLetter}</p>}
              <p className="text-xs text-gray-500 mt-1">
                {formData.coverLetter.length} characters
              </p>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.availableStartDate}
                    onChange={(e) => handleInputChange('availableStartDate', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.availableStartDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                  />
                  {errors.availableStartDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.availableStartDate}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Salary
                  </label>
                  <input
                    type="text"
                    value={formData.expectedSalary}
                    onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., $80,000 - $100,000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work Authorization
                </label>
                <select
                  value={formData.workAuthorization}
                  onChange={(e) => handleInputChange('workAuthorization', e.target.value as WorkAuthorizationType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Citizen">US Citizen</option>
                  <option value="Permanent Resident">Permanent Resident</option>
                  <option value="Work Visa">Work Visa</option>
                  <option value="Student Visa">Student Visa</option>
                  <option value="Requires Sponsorship">Requires Sponsorship</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="willing-relocate"
                  checked={formData.isWillingToRelocate}
                  onChange={(e) => handleInputChange('isWillingToRelocate', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="willing-relocate" className="ml-2 text-sm text-gray-700">
                  I am willing to relocate for this position
                </label>
              </div>
            </div>
          </div>

          {/* Online Presence */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Online Presence (Optional)</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Portfolio Website
                </label>
                <input
                  type="url"
                  value={formData.portfolio}
                  onChange={(e) => handleInputChange('portfolio', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.portfolio ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="https://your-portfolio.com"
                />
                {errors.portfolio && <p className="text-red-500 text-sm mt-1">{errors.portfolio}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Linkedin className="w-4 h-4 inline mr-1" />
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={formData.linkedIn}
                  onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.linkedIn ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
                {errors.linkedIn && <p className="text-red-500 text-sm mt-1">{errors.linkedIn}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Github className="w-4 h-4 inline mr-1" />
                  GitHub Profile
                </label>
                <input
                  type="url"
                  value={formData.github}
                  onChange={(e) => handleInputChange('github', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${errors.github ? 'border-red-500' : 'border-gray-300'
                    }`}
                  placeholder="https://github.com/yourusername"
                />
                {errors.github && <p className="text-red-500 text-sm mt-1">{errors.github}</p>}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => router.push(`/jobs/${jobId}`)}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 font-medium transition-colors flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting Application...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}