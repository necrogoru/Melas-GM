let sentinel: WakeLockSentinel | null = null
let shouldKeepAwake = false
let hasVisibilityListener = false

function handleVisibilityChange(): void {
  if (!shouldKeepAwake || typeof document === 'undefined') return
  if (document.visibilityState === 'visible') {
    void acquireSentinel()
  }
}

function attachVisibilityListener(): void {
  if (hasVisibilityListener || typeof document === 'undefined') return
  document.addEventListener('visibilitychange', handleVisibilityChange)
  hasVisibilityListener = true
}

function detachVisibilityListener(): void {
  if (!hasVisibilityListener || typeof document === 'undefined') return
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  hasVisibilityListener = false
}

async function acquireSentinel(): Promise<boolean> {
  if (!isWakeLockSupported()) return false
  if (sentinel && !sentinel.released) return true

  try {
    const acquired = await navigator.wakeLock.request('screen')
    if (!shouldKeepAwake) {
      await acquired.release().catch(() => undefined)
      return false
    }

    sentinel = acquired
    acquired.addEventListener('release', () => {
      if (sentinel === acquired) {
        sentinel = null
      }
    })
    return true
  } catch {
    sentinel = null
    return false
  }
}

export function isWakeLockSupported(): boolean {
  if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return false
  const maybeWakeLock: unknown = navigator.wakeLock
  return maybeWakeLock !== undefined && maybeWakeLock !== null
}

export function isWakeLockActive(): boolean {
  return sentinel !== null && !sentinel.released
}

export async function requestWakeLock(): Promise<boolean> {
  shouldKeepAwake = true
  attachVisibilityListener()
  return acquireSentinel()
}

export async function releaseWakeLock(): Promise<void> {
  shouldKeepAwake = false
  detachVisibilityListener()

  const activeSentinel = sentinel
  sentinel = null
  if (activeSentinel && !activeSentinel.released) {
    await activeSentinel.release().catch(() => undefined)
  }
}
