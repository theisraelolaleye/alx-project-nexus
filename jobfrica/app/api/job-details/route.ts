import { NextRequest, NextResponse } from 'next/server'
import type { Job } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('id')

    if (!jobId) {
      return NextResponse.json({ error: 'Missing job id' }, { status: 400 })
    }

    const apiKey = process.env.RAPIDAPI_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing RAPIDAPI_KEY' }, { status: 500 })
    }

    // Some links provide a job_id that is already URL-encoded. Avoid double-encoding.
    const normalizedId = decodeURIComponent(jobId)
    const url = `https://jsearch.p.rapidapi.com/job-details?job_id=${encodeURIComponent(normalizedId)}&country=us`

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        'Accept': 'application/json',
      },
      cache: 'no-store'
    })

    const raw = await response.text()
    if (!response.ok) {
      // Surface RapidAPI error payload to help debug 500s
      return NextResponse.json({ error: `RapidAPI error ${response.status}`, details: raw }, { status: response.status })
    }

    let apiData: any
    try {
      apiData = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON from RapidAPI', details: raw }, { status: 502 })
    }
    const item = Array.isArray(apiData?.data) ? apiData.data[0] : undefined
    if (!item) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    const job: Job = {
      id: item.job_id || jobId,
      title: item.job_title || 'No Title',
      company: item.employer_name || 'Unknown Company',
      companyLogo: item.employer_logo || undefined,
      location: item.job_city && item.job_state ? `${item.job_city}, ${item.job_state}` : item.job_country || 'Remote',
      type: item.job_employment_type || 'Full-time',
      experienceLevel: mapExperienceLevel(item.job_required_experience),
      salary: formatSalary(item),
      description: item.job_description || 'No description available',
      requirements: Array.isArray(item.job_required_skills) ? item.job_required_skills : [],
      responsibilities: [],
      benefits: [],
      logo: item.employer_logo || undefined,
      tags: buildTags(item),
      postedDate: item.job_posted_at_datetime_utc || new Date().toISOString(),
      category: undefined,
      isRemote: !!item.job_is_remote,
    }

    return NextResponse.json({ job })
  } catch (err: any) {
    return NextResponse.json({ error: 'Server error', message: err?.message || String(err) }, { status: 500 })
  }
}

function mapExperienceLevel(experience: any): 'Entry-Level' | 'Mid-Level' | 'Senior' | 'Lead' | 'Executive' {
  const months = experience?.required_experience_in_months
  if (typeof months !== 'number') return 'Entry-Level'
  if (months >= 60) return 'Senior'
  if (months >= 24) return 'Mid-Level'
  return 'Entry-Level'
}

function formatSalary(job: any): string | undefined {
  const min = job.job_salary_min
  const max = job.job_salary_max
  const currency = job.job_salary_currency || 'USD'
  if (typeof min === 'number' && typeof max === 'number') {
    return `${currency} ${min.toLocaleString()} - ${currency} ${max.toLocaleString()}`
  }
  return undefined
}

function buildTags(job: any): string[] {
  const tags: string[] = []
  if (job.job_employment_type) tags.push(job.job_employment_type)
  if (Array.isArray(job.job_required_skills)) tags.push(...job.job_required_skills.slice(0, 3))
  return [...new Set(tags)]
}
