import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Job } from '@/types'

type JobState = {
  jobs: Job[]
  lastUpdated?: string
  setJobs: (jobs: Job[]) => void
  upsertJob: (job: Job) => void
  getJobById: (id: string) => Job | undefined
  clear: () => void
}

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      jobs: [],
      lastUpdated: undefined,
      setJobs: (jobs: Job[]) => set({ jobs, lastUpdated: new Date().toISOString() }),
      upsertJob: (job: Job) => {
        const existing = get().jobs
        const idx = existing.findIndex(j => j.id === job.id)
        const next = [...existing]
        if (idx >= 0) next[idx] = job
        else next.push(job)
        set({ jobs: next, lastUpdated: new Date().toISOString() })
      },
      getJobById: (id: string) => get().jobs.find(j => j.id === id),
      clear: () => set({ jobs: [], lastUpdated: undefined })
    }),
    {
      name: 'jobfrica-job-store',
      partialize: (state) => ({ jobs: state.jobs, lastUpdated: state.lastUpdated })
    }
  )
)

