// XP <-> level helpers.
//
// Formula is the source of truth from specs/business-logic.md — NOT invented:
//   xpRequiredForLevel(n) = 50 * (n*(n+1)/2 - 1)   for n >= 2
//   xpRequiredForLevel(1) = 0
// Examples: L2=100, L3=250, L4=450, L5=700, L6=1000.

export function xpRequiredForLevel(level: number): number {
  if (level <= 1) return 0
  return 50 * ((level * (level + 1)) / 2 - 1)
}

export interface LevelProgress {
  /** XP threshold to have reached the current level. */
  floor: number
  /** XP threshold for the next level. */
  ceiling: number
  /** XP earned within the current level band. */
  earnedInLevel: number
  /** XP still needed to reach the next level. */
  remaining: number
  /** 0..1 fraction of the current level band completed. */
  fraction: number
}

/**
 * Derive the current-level progress band for an XP bar.
 *
 * `nextLevelXp` is the dashboard's `xpForCurrentLevel` (the next-level target).
 * When omitted we fall back to the formula so the bar still renders correctly.
 */
export function levelProgress(
  xp: number,
  level: number,
  nextLevelXp?: number,
): LevelProgress {
  const floor = xpRequiredForLevel(level)
  const ceiling = nextLevelXp ?? xpRequiredForLevel(level + 1)
  const band = Math.max(ceiling - floor, 1)
  const earnedInLevel = Math.max(xp - floor, 0)
  const fraction = Math.min(Math.max(earnedInLevel / band, 0), 1)
  return {
    floor,
    ceiling,
    earnedInLevel,
    remaining: Math.max(ceiling - xp, 0),
    fraction,
  }
}
