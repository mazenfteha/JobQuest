# Extension Spec — JobQuest

## Scope (v1)

Real field extraction on **LinkedIn** and **Wuzzuf** job posting pages.
Any other site → manual fallback form (empty fields, user fills in
title/company/url themselves, url pre-filled from the current tab since
that part is always reliable).

## Manifest (MV3)

- `manifest_version: 3`
- `action` → popup (`popup.html`)
- `permissions`: `activeTab`, `storage`
- `host_permissions`: `https://www.linkedin.com/*`, `https://wuzzuf.net/*`,
  plus your deployed backend's origin (for the `POST /jobs` fetch call)
- No content script needs to run on every page — inject on-demand via
  `chrome.scripting.executeScript` when the popup opens, scoped to the
  active tab.

## Extraction strategy

Confirmed via DevTools inspection: LinkedIn's logged-in (Voyager) view
does **not** expose `application/ld+json` structured data — it's
stripped from the authenticated experience, likely kept only on the
public/SEO-facing job pages. So extraction is DOM-selector-based for
both sites, not JSON-LD.

General selector-priority rule used below, per field:
1. **URL-pattern selectors** (`a[href*="..."]`) — most stable, survives
   LinkedIn's hashed-class churn since it's based on link structure
2. **`data-testid` / semantic attributes** — intentional hooks, stable
3. **Structural relationship** (e.g. "the span following the company
   link") — used only when 1 and 2 aren't available
4. **Hashed/generated class names** (e.g. `_9840af22`) — last-resort
   fallback only, documented as fragile, expect these to break on
   LinkedIn UI updates

## Site configs

\`\`\`ts
// siteConfigs.ts
interface FieldSelector {
  primary: string;
  fallback?: string;
}

interface SiteConfig {
  hostname: string;
  title: FieldSelector;
  company: FieldSelector;
  location: FieldSelector;
  description: FieldSelector;
}

const siteConfigs: SiteConfig[] = [
  {
    hostname: 'linkedin.com',
    title: {
      primary: 'a[href*="/jobs/view/"]',
      fallback: '.job-details-jobs-unified-top-card__job-title'
    },
    company: {
      primary: 'a[href*="/company/"]',
      fallback: '.job-details-jobs-unified-top-card__company-name'
    },
    location: {
      // No stable attribute/href hook found — structural approach:
      // the span immediately following the company link inside the
      // top card header, matched by containing a comma-separated
      // "City, Region, Country"-style text pattern.
      primary: 'a[href*="/company/"] ~ span',
      fallback: 'span._3df0079a._1d9c1239' // hashed class, brittle — last resort only
    },
    description: {
      primary: '[data-testid="expandable-text-box"]' // most reliable hook on the page
    }
  },
  {
    hostname: 'wuzzuf.net',
    title: { primary: '/* TODO — pending DevTools inspection */' },
    company: { primary: '/* TODO — pending DevTools inspection */' },
    location: { primary: '/* TODO — pending DevTools inspection */' },
    description: { primary: '/* TODO — pending DevTools inspection */' }
  }
];
\`\`\`

**Extraction logic per field:** try `primary` first; if it returns no
match (or empty text), try `fallback` if one exists; if both fail,
leave the field blank in the Review form rather than guessing.

**Important caveat to build in:** the `location` selector's `primary`
(`a[href*="/company/"] ~ span`) assumes the location span is a direct
sibling of the company link in the DOM. If Claude Code tests this and
finds it doesn't match reliably, don't silently fall back to the
hashed class — flag it back to me so we adjust the strategy rather than
shipping something fragile without knowing it.

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
Run extraction              Manual form
(primary → fallback         (title, company,
 → blank per field)          location, description
  │                           all empty; url
Review form                  pre-filled from tab)
(pre-filled,                   │
 editable)                     │
  └─────────────┬─────────────┘
                ↓
          User clicks "Save to JobQuest"
                ↓
          POST /jobs
                ↓
        ┌───────┴────────┐
      201                409
        ↓                ↓
  Success state    "Already saved" state
  (shows +10 XP)    (informational, not error)
\`\`\`

## Popup states

- **Loading** — brief, while extraction runs
- **Review** — extracted or manual fields, editable before saving,
  "Save to JobQuest" button. Any field extracted via a `fallback`
  selector should visually hint "double-check this" (e.g. small
  yellow dot) since fallbacks are less reliable
- **Success** — shows the `xpAward` from the `POST /jobs` response
- **Already Saved** (409) — informational, link to "View in JobQuest"
- **Network/Auth Error** — simple retry state

## Config

One build-time env var: `VITE_API_URL`, baked in via Vite at build time.