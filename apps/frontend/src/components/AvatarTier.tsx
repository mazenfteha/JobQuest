import { useMemo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { createAvatar } from '@dicebear/core'
import * as notionists from '@dicebear/notionists'
import { tierForLevel } from '../lib/tiers'

// The signature element: a DiceBear "Notionists" avatar for the person's
// identity (stable, seeded by name), wrapped in a level-tier frame that shows
// progression — ring color deepens by tier, top tier gets a crown + glowing
// aura. Avatars are generated locally (no network). Idle float + aura animate
// the wrapper div (not SVG internals) per Vercel's animate-svg-wrapper rule,
// and respect prefers-reduced-motion.

interface AvatarTierProps {
  /** Level drives the tier frame. */
  level: number
  /** Stable identity seed (e.g. the user's name). */
  seed?: string
  size?: number
  /** Idle float + aura animation. Disable for dense grids (e.g. the picker). */
  animated?: boolean
}

interface Theme {
  ring: [string, string]
  /** DiceBear background tint (hex, no leading #). */
  bg: string
}

const THEMES: Record<number, Theme> = {
  0: { ring: ['#CBD5E1', '#94A3B8'], bg: 'e8eef4' },
  1: { ring: ['#F5C169', '#E8890C'], bg: 'fdecc8' },
  2: { ring: ['#A9AAF6', '#6366F1'], bg: 'e2e3fc' },
  3: { ring: ['#FBBF24', '#D9880B'], bg: 'fdecc8' },
}

export default function AvatarTier({
  level,
  seed = 'JobQuest',
  size = 96,
  animated = true,
}: AvatarTierProps) {
  const { index } = tierForLevel(level)
  const theme = THEMES[index]
  const reduce = useReducedMotion()
  const motionOn = animated && !reduce
  const isChampion = index === 3

  const avatarUri = useMemo(
    () =>
      createAvatar(notionists, {
        seed,
        backgroundColor: [theme.bg],
        radius: 50,
        scale: 105,
        // Force a beard so the seeded character reads clearly male.
        beardProbability: 100,
      }).toDataUri(),
    [seed, theme.bg],
  )

  // Ring thickness scales gently with size.
  const ring = Math.max(3, Math.round(size * 0.045))

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Level ${level} avatar`}
    >
      {/* Champion aura */}
      {isChampion ? (
        <motion.div
          className="absolute inset-[-10%] rounded-full"
          style={{
            background:
              'radial-gradient(circle, rgba(251,191,36,0.55) 0%, rgba(251,191,36,0) 68%)',
          }}
          animate={motionOn ? { opacity: [0.5, 0.9, 0.5], scale: [1, 1.06, 1] } : undefined}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      ) : null}

      {/* Idle float (wrapper transform only) */}
      <motion.div
        className="relative flex h-full w-full items-center justify-center"
        animate={motionOn ? { y: [0, -3, 0] } : undefined}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Tier frame ring */}
        <div
          className="relative rounded-full"
          style={{
            width: size,
            height: size,
            padding: ring,
            background: `linear-gradient(145deg, ${theme.ring[0]}, ${theme.ring[1]})`,
            boxShadow: '0 6px 18px -6px rgba(15,23,42,0.35)',
          }}
        >
          <img
            src={avatarUri}
            alt=""
            width={size - ring * 2}
            height={size - ring * 2}
            className="block rounded-full bg-base-card"
            draggable={false}
          />

          {/* Level badge */}
          <span
            className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white shadow-card tabular"
            style={{ fontSize: Math.max(9, size * 0.11) * 0.7 }}
          >
            Lv {level}
          </span>

          {/* Champion crown */}
          {isChampion ? (
            <svg
              className="absolute left-1/2 -translate-x-1/2"
              style={{ top: -ring - size * 0.14, width: size * 0.42, height: size * 0.28 }}
              viewBox="0 0 42 28"
              aria-hidden
            >
              <path
                d="M4 26 L2 8 L13 16 L21 3 L29 16 L40 8 L38 26 Z"
                fill="#FBBF24"
                stroke="#B45309"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <circle cx="2" cy="8" r="2.4" fill="#FDE68A" stroke="#B45309" strokeWidth="1.2" />
              <circle cx="21" cy="3" r="2.6" fill="#FDE68A" stroke="#B45309" strokeWidth="1.2" />
              <circle cx="40" cy="8" r="2.4" fill="#FDE68A" stroke="#B45309" strokeWidth="1.2" />
            </svg>
          ) : null}
        </div>
      </motion.div>
    </div>
  )
}
