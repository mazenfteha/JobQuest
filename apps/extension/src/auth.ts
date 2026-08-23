import { BASE_URL } from './api'

// Extension auth: the popup can't use the web cookie (SameSite blocks it), so
// it obtains a Bearer JWT via chrome.identity.launchWebAuthFlow → the backend's
// Google flow → the token is handed back in the redirect fragment, then stored.

const TOKEN_KEY = 'jq_token'

export async function getToken(): Promise<string | null> {
  const stored = await chrome.storage.local.get(TOKEN_KEY)
  return (stored[TOKEN_KEY] as string | undefined) ?? null
}

export async function signOut(): Promise<void> {
  await chrome.storage.local.remove(TOKEN_KEY)
}

export async function signIn(): Promise<string> {
  const redirectUri = chrome.identity.getRedirectURL()
  const authUrl = `${BASE_URL}/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`

  const finalUrl = await chrome.identity.launchWebAuthFlow({
    url: authUrl,
    interactive: true,
  })
  if (!finalUrl) throw new Error('Sign-in was cancelled.')

  // Token comes back in the fragment: https://<id>.chromiumapp.org/#token=JWT
  const fragment = finalUrl.split('#')[1] ?? ''
  const token = new URLSearchParams(fragment).get('token')
  if (!token) throw new Error('No token returned from sign-in.')

  await chrome.storage.local.set({ [TOKEN_KEY]: token })
  return token
}
