import type { SiteConfig, ExtractedFields } from './types'

// IMPORTANT: this runs in the PAGE context via chrome.scripting.executeScript,
// which serializes it with function.toString(). It must be fully
// self-contained — no imports, no module-scope references, no closures over
// outer variables. The site config is passed in as an argument.
export function extractFields(config: SiteConfig): ExtractedFields {
  const pick = (sel: { primary: string; fallback?: string }) => {
    const read = (selector: string): string => {
      if (!selector) return ''
      try {
        const el = document.querySelector(selector)
        return el ? (el.textContent || '').trim().replace(/\s+/g, ' ') : ''
      } catch {
        return ''
      }
    }
    const primary = read(sel.primary)
    if (primary) return { value: primary, usedFallback: false }
    const fallback = sel.fallback ? read(sel.fallback) : ''
    if (fallback) return { value: fallback, usedFallback: true }
    return { value: '', usedFallback: false }
  }

  return {
    title: pick(config.title),
    company: pick(config.company),
    location: pick(config.location),
    description: pick(config.description),
  }
}
