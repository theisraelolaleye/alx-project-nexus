import { Search, FileText, CheckCircle } from 'lucide-react'

const steps = [
  {
    id: 1,
    icon: Search,
    title: 'Search Jobs',
    description: 'Browse through thousands of job opportunities from top companies across Africa. Use our advanced filters to find the perfect match.',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 2,
    icon: FileText,
    title: 'Apply Easily',
    description: 'Submit your application with just one click. Our streamlined process makes it simple to apply to multiple positions.',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 3,
    icon: CheckCircle,
    title: 'Get Hired',
    description: 'Connect directly with employers, schedule interviews, and land your dream job. We support you throughout the entire process.',
    color: 'from-purple-500 to-pink-500'
  }
]

export function HowItWorks() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Finding your next opportunity has never been easier. Follow these simple steps to kickstart your career journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection lines for desktop */}
          <div className="hidden md:block absolute top-20 left-1/3 right-1/3 h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 transform -translate-y-1/2"></div>

          {steps.map((step, index) => {
            const IconComponent = step.icon
            return (
              <div key={step.id} className="text-center relative">
                {/* Step number badge */}
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white border-4 border-blue-100 rounded-full flex items-center justify-center z-10">
                  <span className="text-sm font-bold text-blue-600">{step.id}</span>
                </div>

                {/* Icon container */}
                <div className={`inline-flex p-6 rounded-2xl bg-gradient-to-br ${step.color} mb-6 shadow-lg`}>
                  <IconComponent className="w-12 h-12 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center mt-8 mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Get Started Now
          </button>
        </div>
      </div>
    </section>
  )
}