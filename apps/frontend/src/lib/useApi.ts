import { useCallback, useEffect, useState } from 'react'

// Minimal client data-fetching hook: loading / error / data + manual reload.
// Sufficient for JobQuest's per-screen fetches; can swap for SWR later if we
// want cross-screen caching (see vercel client-swr-dedup).

interface ApiState<T> {
  data: T | null
  error: Error | null
  loading: boolean
}

export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    loading: true,
  })
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: null }))
    fetcher()
      .then((data) => {
        if (!cancelled) setState({ data, error: null, loading: false })
      })
      .catch((error: Error) => {
        if (!cancelled) setState({ data: null, error, loading: false })
      })
    return () => {
      cancelled = true
    }
    // fetcher intentionally omitted; caller controls refetch via deps + reload.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick])

  const reload = useCallback(() => setTick((t) => t + 1), [])

  return { ...state, reload }
}
