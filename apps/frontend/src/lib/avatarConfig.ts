import { useCallback, useState } from 'react'

// Avatar personalization (Phase 3: browser-only).
// The chosen character is a DiceBear seed persisted in localStorage. When the
// backend gains a User.avatarConfig field (Phase 4+), swap load/save for the
// API — the rest of the UI stays the same.

// Curated gallery of characters to pick from. Seeds are stable identifiers;
// each renders a distinct avatar (all male — beard forced in AvatarTier).
export interface AvatarOption {
  id: string
  seed: string
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'felix', seed: 'Felix' },
  { id: 'leo', seed: 'Leo' },
  { id: 'milo', seed: 'Milo' },
  { id: 'kai', seed: 'Kai' },
  { id: 'ezra', seed: 'Ezra' },
  { id: 'jasper', seed: 'Jasper' },
  { id: 'theo', seed: 'Theo' },
  { id: 'silas', seed: 'Silas' },
  { id: 'oscar', seed: 'Oscar' },
  { id: 'hugo', seed: 'Hugo' },
  { id: 'nico', seed: 'Nico' },
  { id: 'aaron', seed: 'Aaron' },
]

// Versioned key + minimal payload (single seed string) per the
// client-localstorage-schema best practice.
const STORAGE_KEY = 'jobquest.avatar.v1'

export function loadAvatarSeed(fallback: string): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? fallback
  } catch {
    return fallback
  }
}

export function saveAvatarSeed(seed: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, seed)
  } catch {
    // storage unavailable (private mode / disabled) — non-fatal
  }
}

/** Seed state backed by localStorage. */
export function useAvatarSeed(defaultSeed: string) {
  const [seed, setSeed] = useState(() => loadAvatarSeed(defaultSeed))
  const update = useCallback((next: string) => {
    setSeed(next)
    saveAvatarSeed(next)
  }, [])
  return [seed, update] as const
}
