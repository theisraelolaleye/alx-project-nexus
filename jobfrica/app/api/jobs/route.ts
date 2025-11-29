import { NextRequest, NextResponse } from "next/server";
import type { Job } from "@/types"; // make sure this exists

export async function GET(request: NextRequest) {
  try {
    // 1️⃣ Extract query params
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "developer";
    const page = searchParams.get("page") || "1";
    const location = searchParams.get("location") || "chicago";

    console.log("Fetching jobs from RapidAPI with params:", {
      query,
      page,
      location,
    });

    // 2️⃣ Build the JSearch API URL
    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(
      query
    )}%20jobs%20in%20${encodeURIComponent(
      location
    )}&page=${page}&num_pages=1&country=us&date_posted=all`;

    // 3️⃣ Check for API key
    const apiKey = process.env.RAPIDAPI_KEY;
    if (!apiKey) {
      console.error("❌ Missing RapidAPI key in env variables");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // 4️⃣ Make request to RapidAPI
    const response = await fetch(url, {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        "Accept": "application/json",
      },
      cache: 'no-store'
    });

    const raw = await response.text();
    if (!response.ok) {
      console.error(`RapidAPI error: ${response.status} body=${raw}`);
      return NextResponse.json(
        { error: `RapidAPI error ${response.status}`, details: raw },
        { status: response.status }
      );
    }

    let apiData: any
    try {
      apiData = JSON.parse(raw)
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON from RapidAPI', details: raw },
        { status: 502 }
      )
    }
    const items: any[] = Array.isArray(apiData?.data) ? apiData.data : []

    // Transform API response -> your Job interface (JSearch field mapping)
    const transformedJobs: Job[] = items.map((job: any, index: number) => ({
      id: job.job_id || `job_${index}`,
      title: job.job_title || 'No Title',
      company: job.employer_name || 'Unknown Company',
      companyLogo: job.employer_logo || undefined,
      location: job.job_city && job.job_state
        ? `${job.job_city}, ${job.job_state}`
        : job.job_country || 'Remote',
      type: job.job_employment_type || 'Full-time',
      experienceLevel: mapExperienceLevel(job.job_required_experience),
      salary: formatSalary(job),
      description: job.job_description || 'No description available',
      requirements: Array.isArray(job.job_required_skills) ? job.job_required_skills : [],
      responsibilities: [],
      benefits: [],
      logo: job.employer_logo || undefined,
      tags: buildTags(job),
      postedDate: job.job_posted_at_datetime_utc || new Date().toISOString(),
      category: undefined,
      isRemote: !!job.job_is_remote,
    }))

    console.log(`Successfully transformed ${transformedJobs.length} jobs`);

    // 6️⃣ Return clean filtered jobs
    return NextResponse.json({ jobs: transformedJobs });

  } catch (error: any) {
    console.error("❌ Error fetching jobs:", error.message);
    return NextResponse.json(
      { error: "Unexpected server error", message: error.message },
      { status: 500 }
    );
  }
}

// Simple helpers
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
