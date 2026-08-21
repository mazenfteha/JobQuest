import type { SiteConfig } from './types'

// Selectors per specs/extension-spec.md. Priority order (see spec): URL-pattern
// selectors > data-testid/semantic > structural > hashed classes (fragile).
export const siteConfigs: SiteConfig[] = [
  {
    key: 'linkedin',
    hostname: 'linkedin.com',
    title: {
      primary: 'a[href*="/jobs/view/"]',
      fallback: '.job-details-jobs-unified-top-card__job-title',
    },
    company: {
      primary: 'a[href*="/company/"]',
      fallback: '.job-details-jobs-unified-top-card__company-name',
    },
    location: {
      // Structural: span following the company link. UNVERIFIED against live
      // DOM — flag if it doesn't match rather than trusting the hashed fallback.
      primary: 'a[href*="/company/"] ~ span',
      fallback: 'span._3df0079a._1d9c1239', // hashed, brittle — last resort
    },
    description: {
      primary: '[data-testid="expandable-text-box"]',
    },
  },
  {
    key: 'wuzzuf',
    hostname: 'wuzzuf.net',
    // TODO: selectors pending DevTools inspection (extension-spec.md). Empty
    // selectors → extraction yields blanks → user fills the Review form.
    title: { primary: '' },
    company: { primary: '' },
    location: { primary: '' },
    description: { primary: '' },
  },
]

export function matchSite(hostname: string): SiteConfig | null {
  const h = hostname.toLowerCase()
  return (
    siteConfigs.find((c) => h === c.hostname || h.endsWith('.' + c.hostname)) ??
    null
  )
}
