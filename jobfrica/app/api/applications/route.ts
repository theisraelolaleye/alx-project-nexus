import { NextRequest, NextResponse } from 'next/server'
import { JobApplication, ApplicationStatus } from '@/types'

// In a real application, this would connect to a database
const applications: JobApplication[] = []

let applicationIdCounter = 1

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    // Extract form data
    const jobId = formData.get('jobId') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const coverLetter = formData.get('coverLetter') as string
    const portfolio = formData.get('portfolio') as string || undefined
    const linkedIn = formData.get('linkedIn') as string || undefined
    const github = formData.get('github') as string || undefined
    const availableStartDate = formData.get('availableStartDate') as string
    const expectedSalary = formData.get('expectedSalary') as string || undefined
    const workAuthorization = formData.get('workAuthorization') as any
    const isWillingToRelocate = formData.get('isWillingToRelocate') === 'true'
    const resume = formData.get('resume') as File

    // Validate required fields
    if (!jobId || !firstName || !lastName || !email || !phone || !coverLetter || !availableStartDate || !resume) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // In a real application, you would:
    // 1. Upload the resume file to cloud storage (AWS S3, Cloudinary, etc.)
    // 2. Save the application to a database
    // 3. Send confirmation emails
    // 4. Integrate with applicant tracking systems

    // For now, we'll simulate file upload and storage
    const resumeUrl = `https://storage.jobfrica.com/resumes/${Date.now()}-${resume.name}`

    // Create application object
    const application: JobApplication = {
      id: `app_${applicationIdCounter++}`,
      jobId,
      applicantId: `applicant_${Date.now()}`, // In real app, this would be user ID
      firstName,
      lastName,
      email,
      phone,
      resume: resumeUrl,
      coverLetter,
      portfolio,
      linkedIn,
      github,
      availableStartDate,
      expectedSalary,
      workAuthorization,
      isWillingToRelocate,
      appliedDate: new Date().toISOString(),
      status: 'pending' as ApplicationStatus
    }

    // Store application (in real app, this would go to database)
    applications.push(application)

    console.log('📝 New application received:', {
      applicationId: application.id,
      jobId: application.jobId,
      applicant: `${application.firstName} ${application.lastName}`,
      email: application.email
    })

    // In a real application, you would send confirmation emails here
    // await sendConfirmationEmail(application)
    // await notifyHRTeam(application)

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      message: 'Application submitted successfully'
    })

  } catch (error) {
    console.error('Error processing application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const email = searchParams.get('email')

    let filteredApplications = applications

    // Filter by job ID if provided
    if (jobId) {
      filteredApplications = filteredApplications.filter(app => app.jobId === jobId)
    }

    // Filter by email if provided (for checking if user already applied)
    if (email) {
      filteredApplications = filteredApplications.filter(app => app.email === email)
    }

    // Return applications without sensitive data
    const publicApplications = filteredApplications.map(app => ({
      id: app.id,
      jobId: app.jobId,
      firstName: app.firstName,
      lastName: app.lastName,
      appliedDate: app.appliedDate,
      status: app.status
    }))

    return NextResponse.json(publicApplications)

  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET specific application details
export async function GET_APPLICATION(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const applicationId = params.id
    const application = applications.find(app => app.id === applicationId)

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(application)

  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}