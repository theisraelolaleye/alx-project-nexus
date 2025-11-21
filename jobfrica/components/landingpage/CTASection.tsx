import { ArrowRight, Briefcase } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-16 bg-blue-600 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '60px 60px'
      }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Icon */}
        <div className="inline-flex p-4 bg-white/10 rounded-2xl mb-6">
          <Briefcase className="w-12 h-12 text-white" />
        </div>

        {/* Headline */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
          Start Your Career Journey <span className="text-blue-100">Today</span>
        </h2>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
          Join thousands of professionals who have found their dream jobs through JobFrica.
          Your next opportunity is just a click away.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center max-w-md mx-auto">
          <button className="w-full md:w-auto bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-lg">
            <span>Browse Jobs</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button className="w-full md:w-auto bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
            Post a Job
          </button>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white mb-2">10K+</div>
            <div className="text-blue-100 text-sm">Active Jobs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white mb-2">500+</div>
            <div className="text-blue-100 text-sm">Companies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white mb-2">50K+</div>
            <div className="text-blue-100 text-sm">Job Seekers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-white mb-2">95%</div>
            <div className="text-blue-100 text-sm">Success Rate</div>
          </div>
        </div>
      </div>
    </section>
  )
}