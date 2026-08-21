export type SiteKey = 'linkedin' | 'wuzzuf' | 'manual'

export interface FieldSelector {
  primary: string
  fallback?: string
}

export interface SiteConfig {
  key: Exclude<SiteKey, 'manual'>
  hostname: string
  title: FieldSelector
  company: FieldSelector
  location: FieldSelector
  description: FieldSelector
}

export interface ExtractedField {
  value: string
  /** true when the value came from the (less reliable) fallback selector. */
  usedFallback: boolean
}

export interface ExtractedFields {
  title: ExtractedField
  company: ExtractedField
  location: ExtractedField
  description: ExtractedField
}
