import {
  Palette,
  Code,
  Megaphone,
  TrendingUp,
  Package,
  Headphones,
  DollarSign,
  Users
} from 'lucide-react'

const categories = [
  {
    id: 1,
    name: 'Design',
    icon: Palette,
    jobCount: '1,234',
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 2,
    name: 'Engineering',
    icon: Code,
    jobCount: '2,156',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 3,
    name: 'Marketing',
    icon: Megaphone,
    jobCount: '987',
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 4,
    name: 'Sales',
    icon: TrendingUp,
    jobCount: '1,456',
    color: 'from-purple-500 to-violet-500'
  },
  {
    id: 5,
    name: 'Product',
    icon: Package,
    jobCount: '743',
    color: 'from-orange-500 to-amber-500'
  },
  {
    id: 6,
    name: 'Customer Support',
    icon: Headphones,
    jobCount: '532',
    color: 'from-indigo-500 to-blue-500'
  },
  {
    id: 7,
    name: 'Finance',
    icon: DollarSign,
    jobCount: '678',
    color: 'from-teal-500 to-cyan-500'
  },
  {
    id: 8,
    name: 'Human Resources',
    icon: Users,
    jobCount: '345',
    color: 'from-red-500 to-pink-500'
  }
]

export function Categories() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Explore by Category
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover opportunities across various industries and find the perfect role that matches your skills.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((category) => {
            const IconComponent = category.icon
            return (
              <div
                key={category.id}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer group"
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${category.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {category.jobCount} jobs
                </p>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <button className="bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-colors">
            View All Categories
          </button>
        </div>
      </div>
    </section>
  )
}