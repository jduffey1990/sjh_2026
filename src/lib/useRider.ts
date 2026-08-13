import { useCallback, useEffect, useState } from 'react'
import { RIDERS } from '../data/trip'

export type Rider = (typeof RIDERS)[number]

const KEY = 'sjh2026.rider'
const EVENT = 'sjh2026:rider-change'

export function riderByName(name: string | null): Rider | null {
  if (!name) return null
  return RIDERS.find((r) => r.name === name) ?? null
}

function read(): Rider | null {
  try {
    return riderByName(localStorage.getItem(KEY))
  } catch {
    return null
  }
}

/**
 * Who you are, remembered on this device. No passwords -- eight friends, and
 * being able to fix a buddy's list for them is a feature.
 */
export function useRider() {
  const [rider, setRiderState] = useState<Rider | null>(read)

  useEffect(() => {
    const sync = () => setRiderState(read())
    // `storage` covers other tabs; the custom event covers this one.
    window.addEventListener('storage', sync)
    window.addEventListener(EVENT, sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener(EVENT, sync)
    }
  }, [])

  const setRider = useCallback((next: Rider | null) => {
    try {
      if (next) localStorage.setItem(KEY, next.name)
      else localStorage.removeItem(KEY)
    } catch {
      /* private browsing -- fall back to in-memory only */
    }
    window.dispatchEvent(new Event(EVENT))
  }, [])

  return { rider, setRider, riders: RIDERS }
}
