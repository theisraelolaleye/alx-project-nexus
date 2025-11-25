import { Job } from '@/types'

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: 'TechCorp Africa',
    location: 'Lagos, Nigeria',
    type: 'Full-time',
    experienceLevel: 'Senior',
    salary: '₦5M - ₦8M/year',
    description: `We are looking for an experienced Senior Frontend Developer to join our dynamic team. You will be responsible for building cutting-edge web applications using modern JavaScript frameworks.

As a Senior Frontend Developer, you will work closely with our design and backend teams to create seamless user experiences. You'll have the opportunity to mentor junior developers and contribute to architectural decisions.

The ideal candidate has a strong portfolio of web applications, deep knowledge of React and modern frontend tooling, and a passion for creating beautiful, performant user interfaces.`,
    requirements: [
      '5+ years of experience in frontend development',
      'Expert knowledge of React, TypeScript, and modern JavaScript',
      'Strong understanding of HTML5, CSS3, and responsive design',
      'Experience with state management libraries (Redux, Zustand, etc.)',
      'Proficiency with build tools and bundlers (Webpack, Vite, etc.)',
      'Experience with testing frameworks (Jest, React Testing Library)',
      'Strong problem-solving and debugging skills',
      'Excellent communication and teamwork abilities',
    ],
    responsibilities: [
      'Develop and maintain high-quality frontend applications',
      'Collaborate with designers to implement pixel-perfect UIs',
      'Write clean, maintainable, and well-documented code',
      'Optimize applications for maximum speed and scalability',
      'Mentor junior developers and conduct code reviews',
      'Participate in architectural decisions and technical planning',
      'Stay up-to-date with emerging frontend technologies',
      'Contribute to improving development processes and best practices',
    ],
    benefits: [
      'Competitive salary with annual performance bonuses',
      'Health insurance coverage for you and your family',
      'Flexible working hours and remote work options',
      'Professional development budget for courses and conferences',
      '25 days of paid vacation plus public holidays',
      'Modern office with ergonomic workstations',
      'Team building activities and company events',
      'Stock options and equity participation',
    ],
    tags: ['React', 'TypeScript', 'Next.js', 'TailwindCSS'],
    postedDate: '2 days ago',
    isRemote: true,
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'Fintech Solutions',
    location: 'Cape Town, South Africa',
    type: 'Full-time',
    experienceLevel: 'Mid-Level',
    salary: '$50,000 - $70,000',
    description: 'Lead product strategy and development for our fintech platform.',
    tags: ['Product Strategy', 'Analytics', 'Agile', 'Fintech'],
    postedDate: '1 day ago'
  },
  {
    id: '3',
    title: 'UX/UI Designer',
    company: 'Creative Studio',
    location: 'Nairobi, Kenya',
    type: 'Contract',
    experienceLevel: 'Mid-Level',
    salary: '$40,000 - $55,000',
    description: 'Design beautiful and functional user interfaces for mobile and web applications.',
    tags: ['Figma', 'Sketch', 'Prototyping', 'User Research'],
    postedDate: '3 days ago'
  },
  {
    id: '4',
    title: 'Data Scientist',
    company: 'Analytics Pro',
    location: 'Accra, Ghana',
    type: 'Full-time',
    experienceLevel: 'Senior',
    salary: '$55,000 - $75,000',
    description: 'Analyze complex datasets and build machine learning models.',
    tags: ['Python', 'Machine Learning', 'SQL', 'TensorFlow'],
    postedDate: '1 week ago'
  },
  {
    id: '5',
    title: 'Marketing Manager',
    company: 'Growth Agency',
    location: 'Cairo, Egypt',
    type: 'Full-time',
    experienceLevel: 'Mid-Level',
    salary: '$35,000 - $50,000',
    description: 'Develop and execute marketing strategies to drive customer acquisition.',
    tags: ['Digital Marketing', 'SEO', 'Content Marketing', 'Analytics'],
    postedDate: '4 days ago'
  },
  {
    id: '6',
    title: 'DevOps Engineer',
    company: 'Cloud Systems',
    location: 'Johannesburg, South Africa',
    type: 'Full-time',
    experienceLevel: 'Senior',
    salary: '$65,000 - $85,000',
    description: 'Manage and optimize cloud infrastructure and deployment pipelines.',
    tags: ['AWS', 'Docker', 'Kubernetes', 'CI/CD'],
    postedDate: '5 days ago'
  },
  {
    id: '7',
    title: 'Junior Software Developer',
    company: 'StartupHub',
    location: 'Remote',
    type: 'Full-time',
    experienceLevel: 'Entry-Level',
    salary: '$30,000 - $40,000',
    description: 'Start your career in software development with our mentorship program.',
    tags: ['JavaScript', 'Node.js', 'Git', 'Mentorship'],
    postedDate: '1 week ago'
  },
  {
    id: '8',
    title: 'Sales Representative',
    company: 'Business Solutions',
    location: 'Casablanca, Morocco',
    type: 'Full-time',
    experienceLevel: 'Entry-Level',
    salary: '$25,000 - $35,000',
    description: 'Build relationships with clients and drive business growth.',
    tags: ['Sales', 'CRM', 'Client Relations', 'B2B'],
    postedDate: '3 days ago'
  },
  {
    id: '9',
    title: 'Customer Support Specialist',
    company: 'TechSupport Inc',
    location: 'Remote',
    type: 'Part-time',
    experienceLevel: 'Entry-Level',
    salary: '$20,000 - $30,000',
    description: 'Provide excellent customer support via chat, email, and phone.',
    tags: ['Customer Service', 'Support', 'Communication', 'Remote'],
    postedDate: '2 days ago'
  }
]

export const categories = [
  'Design',
  'Engineering',
  'Marketing',
  'Sales',
  'Product',
  'Customer Support',
  'Finance',
  'Human Resources'
]

export const locations = [
  'Lagos, Nigeria',
  'Cape Town, South Africa',
  'Nairobi, Kenya',
  'Accra, Ghana',
  'Cairo, Egypt',
  'Johannesburg, South Africa',
  'Casablanca, Morocco',
  'Remote'
]