import { NextRequest, NextResponse } from 'next/server'

// This would typically import from a shared database connection
// For now, we'll import from the main applications route
const applications: any[] = []

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await context.params

    // In a real application, this would query the database
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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await context.params
    const updateData = await request.json()

    // In a real application, this would update the database
    const applicationIndex = applications.findIndex(app => app.id === applicationId)

    if (applicationIndex === -1) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Update the application
    applications[applicationIndex] = {
      ...applications[applicationIndex],
      ...updateData,
      updatedDate: new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      application: applications[applicationIndex]
    })

  } catch (error) {
    console.error('Error updating application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await context.params

    // In a real application, this would delete from the database
    const applicationIndex = applications.findIndex(app => app.id === applicationId)

    if (applicationIndex === -1) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }

    // Remove the application
    applications.splice(applicationIndex, 1)

    return NextResponse.json({
      success: true,
      message: 'Application deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}