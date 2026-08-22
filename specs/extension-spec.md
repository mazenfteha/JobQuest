# Extension Spec — JobQuest

## Scope (v1)

Real field extraction on **LinkedIn** and **Wuzzuf** job posting pages.
Any other site → manual fallback form (empty fields, user fills in
title/company/url themselves, url pre-filled from the current tab).

## Manifest (MV3)

- `manifest_version: 3`
- `action` → popup (`popup.html`)
- `permissions`: `activeTab`, `storage`
- `host_permissions`: `https://www.linkedin.com/*`, `https://wuzzuf.net/*`,
  plus your deployed backend's origin
- No content script on every page — inject on-demand via
  `chrome.scripting.executeScript` when the popup opens, scoped to the
  active tab

## Extraction strategy (per-site, confirmed via DevTools)

Findings differ meaningfully between the two sites:

- **LinkedIn** (logged-in Voyager view): no `ld+json` present — confirmed,
  deep search came back empty. DOM selectors only.
- **Wuzzuf**: exposes `application/ld+json` JobPosting schema — use it
  as primary. DOM selectors are fallback only, for if the script tag is
  missing/malformed on a given page.

Selector-priority rule (for DOM extraction, both sites):
1. JSON-LD (Wuzzuf only) — most reliable, always try first when available
2. URL-pattern selectors (`a[href*="..."]`) — stable structural hook
3. `data-testid` / semantic attributes — intentional hooks
4. Hashed/generated class names (e.g. `_9840af22`, `.css-gkdl1m`) —
   last-resort fallback only, expected to break on redesigns/rebuilds

## Site configs

\`\`\`ts
// siteConfigs.ts
interface FieldSelector {
  primary: string;
  fallback?: string;
}

interface JsonLdMap {
  available: true;
  parse: (raw: any) => Partial<JobDraft>;
}

interface SiteConfig {
  hostname: string;
  jsonLd?: JsonLdMap;
  dom: {
    title: FieldSelector;
    company: FieldSelector;
    location: FieldSelector;
    description: FieldSelector;
  };
}

const siteConfigs: SiteConfig[] = [
  {
    hostname: 'linkedin.com',
    // no jsonLd — confirmed absent on the logged-in view
    dom: {
      title: {
        primary: 'a[href*="/jobs/view/"]',
        fallback: '.job-details-jobs-unified-top-card__job-title'
      },
      company: {
        primary: 'a[href*="/company/"]',
        fallback: '.job-details-jobs-unified-top-card__company-name'
      },
      location: {
        // structural: span sibling to the company link
        primary: 'a[href*="/company/"] ~ span',
        fallback: 'span._3df0079a._1d9c1239' // hashed, brittle, last resort
      },
      description: {
        primary: '[data-testid="expandable-text-box"]'
      }
    }
  },
  {
    hostname: 'wuzzuf.net',
    jsonLd: {
      available: true,
      parse: (data) => ({
        title: data.title,
        company: data.hiringOrganization?.name,
        location: [
          data.jobLocation?.address?.addressRegion,
          data.jobLocation?.address?.addressCountry
        ].filter(Boolean).join(', '),
        description: data.description // contains HTML — see note below
      })
    },
    dom: {
      // fallback only, used if JSON-LD script tag is missing/fails to parse
      title: { primary: 'h1' }, // only H1 in the header section
      company: { primary: 'a[href*="/jobs/careers/"]' },
      location: {
        // NOTE: this element contains BOTH company name and location
        // text combined — needs string parsing (e.g. split on last
        // comma-separated segment) to isolate location alone. Since
        // JSON-LD is primary and gives location cleanly, this fallback
        // path should be rare — flag to me if it needs real use, don't
        // silently ship fragile parsing logic without a heads-up.
        primary: 'strong.css-1vlp604'
      },
      description: {
        // structural, order-dependent — the 3rd/4th <section> on the
        // page (Job Description, then Requirements). Fragile if Wuzzuf
        // reorders sections; again, fallback-only path.
        primary: 'section:nth-of-type(3), section:nth-of-type(4)'
      }
    }
  }
];
\`\`\`

**Extraction order per site:**
- Wuzzuf: try `jsonLd.parse` first → if the script tag is missing or
  `JSON.parse` throws, fall to `dom` selectors (primary → fallback →
  blank per field)
- LinkedIn: `dom` selectors only (primary → fallback → blank per field)

**Description field — HTML handling:** both sites' description content
contains HTML markup (`<strong>`, `<ul>`, etc.), not plain text.
Assumption for v1: **strip tags to plain text** before sending to
`POST /jobs`, since `Job.description` in the data model is a plain
`String` field and `ui-spec.md` doesn't call for rich-text rendering
anywhere. Flag if you'd rather preserve formatting — that would mean
storing raw HTML and trusting the frontend to sanitize/render it, which
is more work for no clear payoff at MVP stage.

## Popup flow

\`\`\`
Popup opens
     ↓
Detect current tab hostname
     ↓
  ┌─────────────┴─────────────┐
  │                           │
Known site               Unknown site
(linkedin/wuzzuf)              │
  │                           │
Wuzzuf: try JSON-LD          Manual form
  → fallback DOM             (title, company,
LinkedIn: DOM only            location, description
  │                           all empty; url
Review form                  pre-filled from tab)
(pre-filled,                   │
 editable,                     │
 fallback fields flagged)      │
  └─────────────┬─────────────┘
                ↓
          "Save to JobQuest"
                ↓
          POST /jobs
                ↓
        ┌───────┴────────┐
      201                409
        ↓                ↓
  Success (+XP)    "Already saved"
\`\`\`

## Popup states

- **Loading**, **Review** (fallback-extracted fields visually flagged
  for double-checking), **Success**, **Already Saved** (409,
  informational), **Network/Auth Error** — unchanged from earlier draft

## Config

One build-time env var: `VITE_API_URL`.