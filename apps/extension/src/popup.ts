import './popup.css'
import { matchSite } from './siteConfigs'
import { extractFields } from './extract'
import { saveJob, ApiError, APP_URL } from './api'
import type { SiteKey, ExtractedFields } from './types'
import type { XpAwardResult } from './api'

const app = document.querySelector<HTMLDivElement>('#app')!

interface FormState {
  title: string
  company: string
  location: string
  description: string
  url: string
  source: SiteKey
  fallback: { title: boolean; company: boolean; location: boolean; description: boolean }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function sourceLabel(source: SiteKey): string {
  if (source === 'linkedin') return 'Extracted from LinkedIn — review & edit'
  if (source === 'wuzzuf') return 'Wuzzuf — selectors pending, fill in below'
  return 'Manual entry — fill in the fields'
}

// --- States ---------------------------------------------------------------

function renderLoading() {
  app.innerHTML = `
    <div class="card center">
      <div class="spinner"></div>
      <p class="muted" style="margin-top:12px">Reading this page…</p>
    </div>`
}

function renderReview(form: FormState) {
  const dot = (on: boolean) =>
    on
      ? '<span class="dot" title="Double-check — extracted via a fallback selector"></span>'
      : ''

  app.innerHTML = `
    <div class="card">
      <h1 class="brand">🎯 JobQuest</h1>
      <p class="sub">${escapeHtml(sourceLabel(form.source))}</p>

      <label for="f-title">Title ${dot(form.fallback.title)}</label>
      <input id="f-title" type="text" placeholder="Job title" />

      <label for="f-company">Company ${dot(form.fallback.company)}</label>
      <input id="f-company" type="text" placeholder="Company" />

      <label for="f-location">Location ${dot(form.fallback.location)}</label>
      <input id="f-location" type="text" placeholder="Location (optional)" />

      <label for="f-description">Description ${dot(form.fallback.description)}</label>
      <textarea id="f-description" placeholder="Description (optional)"></textarea>

      <label for="f-url">Job URL</label>
      <input id="f-url" type="text" placeholder="https://…" />

      <button id="save" class="btn-primary">Save to JobQuest</button>
      <p id="form-error" class="err"></p>
    </div>`

  const bind = (id: string, key: 'title' | 'company' | 'location' | 'description' | 'url') => {
    const input = document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement
    input.value = form[key]
    input.addEventListener('input', () => {
      form[key] = input.value
    })
  }
  bind('f-title', 'title')
  bind('f-company', 'company')
  bind('f-location', 'location')
  bind('f-description', 'description')
  bind('f-url', 'url')

  const btn = document.getElementById('save') as HTMLButtonElement
  btn.addEventListener('click', () => save(form, btn))
}

async function save(form: FormState, btn: HTMLButtonElement) {
  const errEl = document.getElementById('form-error')!
  const title = form.title.trim()
  const company = form.company.trim()
  const url = form.url.trim()
  if (!title || !company || !url) {
    errEl.textContent = 'Title, company and URL are required.'
    return
  }
  errEl.textContent = ''
  btn.disabled = true
  btn.textContent = 'Saving…'
  try {
    const res = await saveJob({
      title,
      company,
      url,
      location: form.location.trim() || undefined,
      description: form.description.trim() || undefined,
      source: form.source,
    })
    renderSuccess(res.xpAward)
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) {
      renderAlready()
      return
    }
    // Network / other — keep the form data, show inline error, allow retry.
    errEl.textContent =
      e instanceof ApiError ? e.message : 'Something went wrong. Try again.'
    btn.disabled = false
    btn.textContent = 'Save to JobQuest'
  }
}

function renderSuccess(award: XpAwardResult) {
  const achievements = award.newAchievements
    .map(
      (a) =>
        `<span class="chip">${escapeHtml(a.icon)} ${escapeHtml(a.title)}</span>`,
    )
    .join('')
  app.innerHTML = `
    <div class="card center">
      <div class="emoji">✅</div>
      <p class="big">Saved to JobQuest</p>
      <p class="muted">Now tracked as a saved application.</p>
      <div class="xp-pill">⚡ +${award.xpGained} XP</div>
      ${award.leveledUp ? `<p class="levelup">🎉 Level up! You're now level ${award.user.level}</p>` : ''}
      ${achievements ? `<div class="chips">${achievements}</div>` : ''}
      ${viewButton()}
      <button id="close" class="btn-ghost">Close</button>
    </div>`
  wireCommon()
}

function renderAlready() {
  app.innerHTML = `
    <div class="card center">
      <div class="emoji">📌</div>
      <p class="big">Already saved</p>
      <p class="muted">This job is already in your JobQuest — no duplicate, no double XP.</p>
      ${viewButton()}
      <button id="close" class="btn-ghost">Close</button>
    </div>`
  wireCommon()
}

function renderError(retry: () => void) {
  app.innerHTML = `
    <div class="card center">
      <div class="emoji">⚠️</div>
      <p class="big">Couldn't read this page</p>
      <p class="muted">Open a job posting and try again.</p>
      <button id="retry" class="btn-primary">Retry</button>
    </div>`
  ;(document.getElementById('retry') as HTMLButtonElement).addEventListener(
    'click',
    retry,
  )
}

function viewButton(): string {
  return APP_URL
    ? '<button id="view" class="btn-primary">View in JobQuest</button>'
    : ''
}

function wireCommon() {
  const view = document.getElementById('view')
  if (view) {
    view.addEventListener('click', () => {
      void chrome.tabs.create({ url: `${APP_URL}/applications` })
      window.close()
    })
  }
  const close = document.getElementById('close')
  if (close) close.addEventListener('click', () => window.close())
}

// --- Init -----------------------------------------------------------------

async function init() {
  renderLoading()
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const tabUrl = tab?.url ?? ''
    let hostname = ''
    try {
      hostname = tabUrl ? new URL(tabUrl).hostname : ''
    } catch {
      hostname = ''
    }

    const site = matchSite(hostname)
    const form: FormState = {
      title: '',
      company: '',
      location: '',
      description: '',
      url: tabUrl,
      source: site ? site.key : 'manual',
      fallback: { title: false, company: false, location: false, description: false },
    }

    if (site && tab?.id != null) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: extractFields,
          args: [site],
        })
        const data = results?.[0]?.result as ExtractedFields | undefined
        if (data) {
          form.title = data.title.value
          form.company = data.company.value
          form.location = data.location.value
          form.description = data.description.value
          form.fallback = {
            title: data.title.usedFallback,
            company: data.company.usedFallback,
            location: data.location.usedFallback,
            description: data.description.usedFallback,
          }
        }
      } catch {
        // Injection failed (permission/edge) — fall back to manual with url.
      }
    }

    renderReview(form)
  } catch {
    renderError(() => void init())
  }
}

void init()
