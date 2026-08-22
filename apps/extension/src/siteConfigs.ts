import type { SiteConfig } from './types'

// Selectors per specs/extension-spec.md.
// - LinkedIn: DOM only (logged-in view has no JSON-LD).
// - Wuzzuf: schema.org JobPosting JSON-LD is primary; these DOM selectors are
//   fallback-only (used if the ld+json tag is missing / fails to parse).
export const siteConfigs: SiteConfig[] = [
  {
    key: 'linkedin',
    hostname: 'linkedin.com',
    useJsonLd: false,
    dom: {
      title: {
        primary: 'a[href*="/jobs/view/"]',
        fallback: '.job-details-jobs-unified-top-card__job-title',
      },
      company: {
        primary: 'a[href*="/company/"]',
        fallback: '.job-details-jobs-unified-top-card__company-name',
      },
      location: {
        // Structural: span sibling of the company link. UNVERIFIED vs live DOM.
        primary: 'a[href*="/company/"] ~ span',
        fallback: 'span._3df0079a._1d9c1239', // hashed, brittle — last resort
      },
      description: {
        primary: '[data-testid="expandable-text-box"]',
      },
    },
  },
  {
    key: 'wuzzuf',
    hostname: 'wuzzuf.net',
    useJsonLd: true,
    dom: {
      title: { primary: 'h1' },
      company: { primary: 'a[href*="/jobs/careers/"]' },
      // NOTE (spec): this element combines company + location text; the DOM
      // path is fallback-only since JSON-LD gives location cleanly. We return
      // its raw text and flag it — no fragile split logic shipped silently.
      location: { primary: 'strong.css-1vlp604' },
      // Structural, order-dependent (3rd/4th <section>). Fallback-only.
      description: { primary: 'section:nth-of-type(3), section:nth-of-type(4)' },
    },
  },
]

export function matchSite(hostname: string): SiteConfig | null {
  const h = hostname.toLowerCase()
  return (
    siteConfigs.find((c) => h === c.hostname || h.endsWith('.' + c.hostname)) ??
    null
  )
}
