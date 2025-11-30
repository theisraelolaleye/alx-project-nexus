Jobfrica is a beginner‑friendly job discovery web app built with Next.js (App Router) that lets users browse job listings, view detailed job information, and quickly express interest via a simple application popup. It integrates with RapidAPI’s JSearch to fetch real job data and uses Zustand for lightweight client state (like caching fetched jobs) to make navigation smooth.

## What You Can Do

- Find jobs: Browse a paginated, filterable list of jobs on `/jobs`.
- View details: See each job’s title, company, location, type, experience level, salary, description, and tags on `/jobs/[id]`.
- Apply (no backend required): Click “Apply” to open a popup and fill in basic info (name, email, phone, cover letter). This is client‑only and does not submit to any server yet.

## Key Technologies

- Next.js 16 (App Router, Turbopack)
- TypeScript
- Zustand (simple client store for jobs)
- RapidAPI JSearch (external jobs data)
- Tailwind CSS (UI styling)

## Project Structure (high‑level)

- `app/jobs/page.tsx`: Jobs list with filters, view toggle, and pagination.
- `app/jobs/[id]/page.tsx`: Job details page; opens the Apply popup.
- `components/jobs/JobList.tsx` & `components/jobs/JobCard.tsx`: UI for listing jobs.
- `components/jobs/ApplyModal.tsx`: Minimal, client‑only application popup.
- `app/api/jobs/route.ts`: Server route proxy to RapidAPI JSearch (search).
- `app/api/job-details/route.ts`: Server route proxy to RapidAPI JSearch (single job details).
- `lib/api.ts`: Simple client helpers (`externalJobsApi`) to call the above routes.
- `store/jobStore.ts`: Persisted Zustand store to cache jobs locally.
- `types/index.ts`: Shared TypeScript types (e.g., `Job`).

## Setup (Beginner Friendly)

1. Install dependencies and start dev server

```bash
npm install
npm run dev
```

2. Configure your RapidAPI key (to fetch real jobs)
   Create `.env.local` in the `jobfrica` folder:

```bash
RAPIDAPI_KEY=your_actual_rapidapi_key_here
```

3. Open the app
   Visit `http://localhost:3000/jobs` to browse jobs.

## How Data Flows

- The Jobs page calls `/api/jobs` → our server route calls RapidAPI JSearch → we transform the response to our `Job` type → the page renders.
- The Details page first checks the job in the Zustand store. If missing, it calls `/api/job-details?id=<job_id>` to fetch full details.
- The Apply popup is client‑only; it validates input and shows a success message without sending data anywhere.

## Notes & Tips

- If remote images fail to load with Next’s `<Image />`, whitelist hosts in `next.config.ts` using `images.remotePatterns`.
- If RapidAPI returns errors (e.g., rate limits), our API routes surface the error details for easier debugging.
- The code aims to stay beginner‑friendly: small helpers, clear types, and minimal state.

## Future Enhancements (Optional)

- Wire the Apply popup to a real backend (e.g., save applications in a database).
- Add more filters (category, remote only) and server‑side pagination.
- Improve accessibility and add loading skeletons across pages.
