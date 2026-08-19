import type { ApplicationListItem } from '../lib/api'

// Mock matching GET /applications exactly (specs/api.md).

export const applicationsMock: ApplicationListItem[] = [
  {
    id: 'app-1',
    status: 'INTERVIEW',
    appliedAt: '2026-08-14T09:00:00.000Z',
    job: {
      id: 'job-1',
      title: 'Senior Backend Engineer',
      company: 'Stripe',
      url: 'https://stripe.com/jobs/1',
      location: 'Remote',
    },
  },
  {
    id: 'app-2',
    status: 'OFFER',
    appliedAt: '2026-08-08T09:00:00.000Z',
    job: {
      id: 'job-2',
      title: 'Platform Engineer',
      company: 'Vercel',
      url: 'https://vercel.com/careers/2',
      location: 'Remote',
    },
  },
  {
    id: 'app-3',
    status: 'APPLIED',
    appliedAt: '2026-08-16T09:00:00.000Z',
    job: {
      id: 'job-3',
      title: 'Node.js Developer',
      company: 'Linear',
      url: 'https://linear.app/careers/3',
      location: 'Berlin, DE',
    },
  },
  {
    id: 'app-4',
    status: 'APPLIED',
    appliedAt: '2026-08-15T09:00:00.000Z',
    job: {
      id: 'job-4',
      title: 'Backend Developer',
      company: 'Supabase',
      url: 'https://supabase.com/careers/4',
      location: 'Remote',
    },
  },
  {
    id: 'app-5',
    status: 'SAVED',
    appliedAt: null,
    job: {
      id: 'job-5',
      title: 'Distributed Systems Engineer',
      company: 'Cloudflare',
      url: 'https://cloudflare.com/careers/5',
      location: 'London, UK',
    },
  },
  {
    id: 'app-6',
    status: 'SAVED',
    appliedAt: null,
    job: {
      id: 'job-6',
      title: 'API Platform Engineer',
      company: 'Scrapfly',
      url: 'https://scrapfly.io/careers/6',
      location: 'Remote',
    },
  },
  {
    id: 'app-7',
    status: 'REJECTED',
    appliedAt: '2026-08-02T09:00:00.000Z',
    job: {
      id: 'job-7',
      title: 'Software Engineer, Backend',
      company: 'Datadog',
      url: 'https://datadog.com/careers/7',
      location: 'New York, US',
    },
  },
]
