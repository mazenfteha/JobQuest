import { defineManifest } from '@crxjs/vite-plugin'

// JobQuest browser extension (MV3). Popup extracts a job posting from the
// active tab and saves it via POST /jobs. See specs/extension-spec.md.
export default defineManifest({
  manifest_version: 3,
  name: 'JobQuest',
  description: 'Save job postings to JobQuest and earn XP.',
  version: '0.1.0',
  icons: {
    '16': 'icon-16.png',
    '32': 'icon-32.png',
    '48': 'icon-48.png',
    '128': 'icon-128.png',
  },
  action: {
    default_popup: 'popup.html',
    default_title: 'Save to JobQuest',
    default_icon: {
      '16': 'icon-16.png',
      '32': 'icon-32.png',
      '48': 'icon-48.png',
      '128': 'icon-128.png',
    },
  },
  // `scripting` is required for chrome.scripting.executeScript (spec omitted
  // it; activeTab alone grants host access but not the API).
  permissions: ['activeTab', 'storage', 'scripting', 'identity'],
  host_permissions: [
    'https://www.linkedin.com/*',
    'https://wuzzuf.net/*',
    // Dev backend origin — lets the popup fetch bypass CORS. Swap for the
    // deployed origin in Phase 6.
    'http://localhost:3000/*',
  ],
})
