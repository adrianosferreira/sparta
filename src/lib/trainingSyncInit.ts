import { apiGetTraining, apiPutTraining } from '@/lib/api'
import { getSessionToken } from '@/lib/sessionToken'
import { useAppStore } from '@/store/useAppStore'
import { useAuthStore } from '@/store/useAuthStore'

let started = false
let putUnsub: (() => void) | null = null
let debTimer: ReturnType<typeof setTimeout> | null = null

function startPutSubscriber() {
  if (putUnsub) return
  putUnsub = useAppStore.subscribe(() => {
    if (!getSessionToken()) return
    if (debTimer) window.clearTimeout(debTimer)
    debTimer = window.setTimeout(() => {
      const { user, sessions, locale } = useAppStore.getState()
      void apiPutTraining({ user, sessions, locale }).catch(() => {})
    }, 900)
  })
}

/** Call once at app boot (before React). Loads server state after localStorage rehydrate; debounced API sync. */
export function initTrainingSyncOnce(): void {
  if (started || typeof window === 'undefined') return
  started = true

  useAppStore.persist.onFinishHydration(() => {
    const token = getSessionToken()
    if (!token) {
      startPutSubscriber()
      return
    }
    void apiGetTraining()
      .then((data) => {
        useAppStore.getState().hydrateFromServer(data)
        startPutSubscriber()
      })
      .catch(() => {
        useAuthStore.getState().clearSession()
        startPutSubscriber()
      })
  })
}
