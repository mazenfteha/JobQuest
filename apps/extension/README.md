# JobQuest Extension

Chrome MV3 browser extension that extracts job posting details from LinkedIn and Wuzzuf with one click, then saves them to JobQuest via the backend API.

## For end users

### Install from a release (recommended)

1. Download the latest `jobquest-extension.zip` from [GitHub Releases](https://github.com/mazenfteha/JobQuest/releases/download/MVP/jobquest-extension.zip)
2. Unzip the file to a permanent location (e.g. `~/JobQuestExtension`)
3. Open Chrome and go to `chrome://extensions`
4. Enable **Developer mode** (toggle in the top-right)
5. Click **Load unpacked** and select the unzipped folder
6. Pin the JobQuest icon to your toolbar (click the puzzle piece icon → pin)

### Sign in

1. Click the JobQuest icon in your toolbar
2. Click **Sign in with Google**
3. Authorize the app — your token is stored locally in Chrome

### Save a job

1. Navigate to a job posting on LinkedIn or Wuzzuf
2. Click the JobQuest icon
3. Review the extracted fields (title, company, location, description)
4. Click **Save Job**
5. See the XP gain — you earned +10 XP for saving!

The extension works on:
- `linkedin.com` (job detail pages)
- `wuzzuf.net` (job detail pages)
- Other sites: fields will be blank — fill them in manually in the review form

## For contributors

### Prerequisites

- Node.js 20.x
- npm 10.x

### Build from source

```bash
# From the repo root
npm install
npm run build -w apps/extension

# Or from this directory
cd apps/extension
npm run build
```

Build output goes to `apps/extension/dist/`.

### Load in Chrome for development

1. Build the extension (or use `npm run dev` for watch mode)
2. Open `chrome://extensions`
3. Enable **Developer mode**
4. Click **Load unpacked** and select the `apps/extension/dist/` folder
5. Make changes — rebuild and click the refresh icon on the extension card

### Environment variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend URL — dev: `http://localhost:3000`, prod: deployed URL |
| `VITE_APP_URL` | Frontend URL — dev: `http://localhost:5200` (used for redirect links) |

These are baked in at build time by Vite.

### Source structure

```
src/
├── popup.ts        Main popup logic — sign-in, review form, save flow
├── popup.css       Popup styles
├── extract.ts      Job field extraction (injected into the active tab)
├── siteConfigs.ts  Per-site DOM selectors (LinkedIn, Wuzzuf)
├── api.ts          Typed API client (POST /jobs)
├── auth.ts         Chrome storage + OAuth flow (chrome.identity)
└── types.ts        Shared TypeScript interfaces

manifest.config.ts  MV3 manifest definition (@crxjs/vite-plugin)
popup.html          Popup HTML shell
public/             Extension icons (16, 32, 48, 128px)
```

### How extraction works

1. Popup detects the current tab's hostname
2. Matches against `siteConfigs` (LinkedIn or Wuzzuf)
3. Injects `extract.ts` into the page via `chrome.scripting.executeScript`
4. For Wuzzuf: tries JSON-LD (`ld+json` with `@type: JobPosting`) first, falls back to DOM
5. For LinkedIn: DOM selectors only (no JSON-LD on job pages)
6. Returns `ExtractedFields` with `usedFallback` flags for less-reliable values
7. Popup displays the review form — user can edit before saving

### Permissions

| Permission | Why |
|---|---|
| `activeTab` | Access the current tab when the popup is opened |
| `storage` | Store the JWT token locally |
| `scripting` | Inject extraction script into the page |
| `identity` | Chrome OAuth flow (`chrome.identity.launchWebAuthFlow`) |

### Host permissions

- `https://www.linkedin.com/*` — LinkedIn job pages
- `https://wuzzuf.net/*` — Wuzzuf job pages
- Backend origin (dev or deployed) — API calls from the popup

## Specs

| Spec | What it defines |
|---|---|
| [specs/extension-spec.md](../../specs/extension-spec.md) | Target sites, field extraction strategy, popup states |
| [specs/api.md](../../specs/api.md) | POST /jobs contract, 409 conflict handling |
