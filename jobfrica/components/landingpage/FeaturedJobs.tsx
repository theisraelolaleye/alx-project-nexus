import { MapPin, Clock, DollarSign, Building2 } from 'lucide-react'

const featuredJobs = [
  {
    id: 1,
    title: 'Senior Frontend Developer',
    company: 'TechCorp Africa',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    salary: '$60,000 - $80,000',
    logo: '/api/placeholder/40/40',
    tags: ['React', 'TypeScript', 'Remote'],
    postedTime: '2 days ago'
  },
  {
    id: 2,
    title: 'Product Manager',
    company: 'Fintech Solutions',
    location: 'Cape Town, South Africa',
    type: 'Full-time',
    salary: '$50,000 - $70,000',
    logo: '/api/placeholder/40/40',
    tags: ['Strategy', 'Analytics', 'Agile'],
    postedTime: '1 day ago'
  },
  {
    id: 3,
    title: 'UX/UI Designer',
    company: 'Creative Studio',
    location: 'Nairobi, Kenya',
    type: 'Contract',
    salary: '$40,000 - $55,000',
    logo: '/api/placeholder/40/40',
    tags: ['Figma', 'Sketch', 'Prototyping'],
    postedTime: '3 days ago'
  },
  {
    id: 4,
    title: 'Data Scientist',
    company: 'Analytics Pro',
    location: 'Accra, Ghana',
    type: 'Full-time',
    salary: '$55,000 - $75,000',
    logo: '/api/placeholder/40/40',
    tags: ['Python', 'Machine Learning', 'SQL'],
    postedTime: '1 week ago'
  },
  {
    id: 5,
    title: 'Marketing Manager',
    company: 'Growth Agency',
    location: 'Cairo, Egypt',
    type: 'Full-time',
    salary: '$35,000 - $50,000',
    logo: '/api/placeholder/40/40',
    tags: ['Digital Marketing', 'SEO', 'Content'],
    postedTime: '4 days ago'
  },
  {
    id: 6,
    title: 'DevOps Engineer',
    company: 'Cloud Systems',
    location: 'Johannesburg, South Africa',
    type: 'Full-time',
    salary: '$65,000 - $85,000',
    logo: '/api/placeholder/40/40',
    tags: ['AWS', 'Docker', 'Kubernetes'],
    postedTime: '5 days ago'
  }
]

export function FeaturedJobs() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Jobs
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover hand-picked opportunities from top companies across Africa looking for talented professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {featuredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-sm text-gray-600">{job.company}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {job.type}
                </span>
              </div>

              {/* Location and Time */}
              <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{job.postedTime}</span>
                </div>
              </div>

              {/* Salary */}
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-gray-900">{job.salary}</span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {job.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Action Button */}
              <button className="w-full bg-gray-100 text-gray-900 py-2 px-4 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Browse All Jobs
          </button>
        </div>
      </div>
    </section>
  )
}