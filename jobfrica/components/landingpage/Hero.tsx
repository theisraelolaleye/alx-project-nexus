import { Search, MapPin } from "lucide-react"

export function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-20 md:py-32 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-gray-100/[0.04] bg-[size:20px_20px]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Find Your Dream Job <span className="text-blue-600">Anywhere</span>
        </h1>

        {/* Subheading */}
        <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
          Browse thousands of jobs, apply in one click, and connect with top companies across Africa and beyond.
        </p>

        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-3 max-w-3xl mx-auto mb-12">
          <div className="flex items-center flex-1 bg-white border border-gray-200 rounded-lg px-4 py-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 shadow-sm">
            <Search className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="Job title or keyword"
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-500"
            />
          </div>

          <div className="flex items-center flex-1 bg-white border border-gray-200 rounded-lg px-4 py-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 shadow-sm">
            <MapPin className="w-5 h-5 text-gray-400 mr-3" />
            <input
              type="text"
              placeholder="City or country"
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-500"
            />
          </div>

          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap shadow-sm">
            Search Jobs
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-600">10,000+</span>
            <span>Active Jobs</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-600">500+</span>
            <span>Companies</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-600">50,000+</span>
            <span>Job Seekers</span>
          </div>
        </div>
      </div>
    </section>
  )
}
