import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'

const DOWNLOAD_URL = 'https://github.com/mazenfteha/JobQuest/releases/download/MVP/jobquest-extension.zip'

const STEPS = [
  {
    num: 1,
    icon: '📦',
    title: 'Download the extension',
    desc: 'Grab the latest JobQuest zip file from GitHub.',
  },
  {
    num: 2,
    icon: '📂',
    title: 'Unzip it',
    desc: 'Extract the zip to a permanent folder (e.g. ~/JobQuestExtension). Don\'t delete it after — Chrome needs it there.',
  },
  {
    num: 3,
    icon: '🧩',
    title: 'Open Chrome extensions',
    desc: 'Type chrome://extensions in your address bar and hit Enter.',
  },
  {
    num: 4,
    icon: '🛠️',
    title: 'Enable Developer mode',
    desc: 'Toggle the "Developer mode" switch in the top-right corner.',
  },
  {
    num: 5,
    icon: '📁',
    title: 'Load unpacked',
    desc: 'Click the "Load unpacked" button and select the folder you unzipped in Step 2.',
  },
  {
    num: 6,
    icon: '📌',
    title: 'Pin the icon',
    desc: 'Click the puzzle piece icon in your toolbar, then pin JobQuest so it\'s always visible.',
  },
  {
    num: 7,
    icon: '🔑',
    title: 'Sign in',
    desc: 'Click the JobQuest icon, hit "Sign in with Google", and authorize the app. You\'re all set!',
  },
]

export default function ExtensionSetup() {
  const reduce = useReducedMotion()

  return (
    <div className="min-h-screen px-4 py-16">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <motion.div
          className="mb-10 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: 'spring', stiffness: 100, damping: 18 }
          }
        >
          <div className="mb-4 text-5xl">🧩</div>
          <h1 className="font-display text-3xl font-bold text-ink sm:text-4xl">
            Install the JobQuest Extension
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-ink-soft sm:text-base">
            One-time setup — takes about 2 minutes. Then you can save jobs
            with a single click.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              className="flex items-start gap-4 rounded-card bg-base-card p-5 shadow-card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : {
                      type: 'spring',
                      stiffness: 100,
                      damping: 20,
                      delay: i * 0.06,
                    }
              }
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-500 text-lg font-bold text-white shadow-glow">
                {step.num}
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-ink">
                  {step.icon} {step.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-ink-soft sm:text-sm">
                  {step.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Download button */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: 'spring', stiffness: 100, damping: 18, delay: 0.5 }
          }
        >
          <a
            href={DOWNLOAD_URL}
            className="inline-flex items-center gap-2.5 rounded-2xl bg-primary-500 px-7 py-3.5 text-base font-bold text-white shadow-card transition-colors hover:bg-primary-600 sm:text-lg"
          >
            <span aria-hidden>⬇️</span>
            Download Extension
          </a>
          <p className="mt-3 text-xs text-ink-muted">
            Requires Google Chrome or a Chromium-based browser.
          </p>
        </motion.div>

        {/* Back link */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="text-sm font-medium text-primary-500 transition-colors hover:text-primary-600"
          >
            ← Back to JobQuest
          </Link>
        </div>
      </div>
    </div>
  )
}
