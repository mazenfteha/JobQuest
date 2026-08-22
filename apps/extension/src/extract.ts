import type { SiteConfig, ExtractedFields, FieldSelector } from './types'

// IMPORTANT: this runs in the PAGE context via chrome.scripting.executeScript,
// which serializes it with function.toString(). It must be fully
// self-contained — no imports, no module-scope references, no closures. The
// site config (plain data: useJsonLd flag + DOM selectors) is passed as an arg.
//
// Wuzzuf: schema.org JobPosting JSON-LD is primary (reliable), DOM is fallback.
// LinkedIn: DOM only (primary selector → fallback selector). Descriptions are
// HTML on both sites, so they're stripped to plain text.
export function extractFields(config: SiteConfig): ExtractedFields {
  const clean = (s: string): string => (s || '').replace(/\s+/g, ' ').trim()

  // Strip tags via DOMParser (not innerHTML) — safe under Trusted-Types CSP.
  const stripHtml = (html: string): string => {
    if (!html) return ''
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html')
      return clean(doc.body.textContent || '')
    } catch {
      return clean(html.replace(/<[^>]*>/g, ' '))
    }
  }

  const readSel = (selector: string): string => {
    if (!selector) return ''
    try {
      const el = document.querySelector(selector)
      return el ? clean(el.textContent || '') : ''
    } catch {
      return ''
    }
  }

  const out: ExtractedFields = {
    title: { value: '', usedFallback: false },
    company: { value: '', usedFallback: false },
    location: { value: '', usedFallback: false },
    description: { value: '', usedFallback: false },
  }

  // 1) JSON-LD JobPosting (Wuzzuf primary).
  if (config.useJsonLd) {
    const scripts = Array.from(
      document.querySelectorAll('script[type="application/ld+json"]'),
    )
    let jp: any = null
    for (const s of scripts) {
      try {
        const parsed: any = JSON.parse(s.textContent || '')
        const candidates: any[] = Array.isArray(parsed)
          ? parsed
          : parsed && parsed['@graph']
            ? parsed['@graph']
            : [parsed]
        const found = candidates.find((x) => {
          const t = x && x['@type']
          return t === 'JobPosting' || (Array.isArray(t) && t.includes('JobPosting'))
        })
        if (found) {
          jp = found
          break
        }
      } catch {
        // not JSON / not what we want — keep scanning
      }
    }
    if (jp) {
      const addr = (jp.jobLocation && jp.jobLocation.address) || {}
      const loc = [addr.addressRegion, addr.addressCountry]
        .filter(Boolean)
        .join(', ')
      out.title = { value: clean(jp.title || ''), usedFallback: false }
      out.company = {
        value: clean((jp.hiringOrganization && jp.hiringOrganization.name) || ''),
        usedFallback: false,
      }
      out.location = { value: clean(loc), usedFallback: false }
      out.description = { value: stripHtml(jp.description || ''), usedFallback: false }
    }
  }

  // 2) DOM fill for any field still empty. On a JSON-LD site the DOM is the
  //    fallback source (flag it); on LinkedIn, primary=unflagged, fallback=flagged.
  const domFill = (key: keyof ExtractedFields, sel: FieldSelector) => {
    if (out[key].value) return
    const primary = readSel(sel.primary)
    if (primary) {
      out[key] = { value: primary, usedFallback: config.useJsonLd ? true : false }
      return
    }
    const fallback = sel.fallback ? readSel(sel.fallback) : ''
    if (fallback) out[key] = { value: fallback, usedFallback: true }
  }
  domFill('title', config.dom.title)
  domFill('company', config.dom.company)
  domFill('location', config.dom.location)
  domFill('description', config.dom.description)

  return out
}
