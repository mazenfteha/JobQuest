export type SiteKey = 'linkedin' | 'wuzzuf' | 'manual'

export interface FieldSelector {
  primary: string
  fallback?: string
}

export interface DomSelectors {
  title: FieldSelector
  company: FieldSelector
  location: FieldSelector
  description: FieldSelector
}

export interface SiteConfig {
  key: Exclude<SiteKey, 'manual'>
  hostname: string
  /** Wuzzuf: parse schema.org JobPosting JSON-LD first, DOM as fallback. */
  useJsonLd: boolean
  dom: DomSelectors
}

export interface ExtractedField {
  value: string
  /** true when the value came from a less-reliable source (a fallback DOM
   *  selector on LinkedIn, or any DOM selector on Wuzzuf where JSON-LD is
   *  the reliable primary) — the Review UI flags these for double-checking. */
  usedFallback: boolean
}

export interface ExtractedFields {
  title: ExtractedField
  company: ExtractedField
  location: ExtractedField
  description: ExtractedField
}
