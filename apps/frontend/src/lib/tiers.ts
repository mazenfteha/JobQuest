// Avatar tiers from specs/ui-spec.md — 4 tiers, swapped by user.level.
// Titles are job-agnostic (JobQuest targets any job seeker, not only tech).

export interface Tier {
  index: 0 | 1 | 2 | 3
  title: string
  /** Human-readable level band, e.g. "5–9". */
  band: string
}

export function tierForLevel(level: number): Tier {
  if (level >= 15) return { index: 3, title: 'Champion', band: '15+' }
  if (level >= 10) return { index: 2, title: 'Pro', band: '10–14' }
  if (level >= 5) return { index: 1, title: 'Contender', band: '5–9' }
  return { index: 0, title: 'Newcomer', band: '1–4' }
}
