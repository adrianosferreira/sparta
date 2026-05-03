import type { AppLocale } from '@/i18n/types'
import type { UserState, WorkoutSession } from '@/types'
import { getSessionToken } from '@/lib/sessionToken'

function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_URL as string | undefined
  if (base) return `${base.replace(/\/$/, '')}${path}`
  return path
}

export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body && typeof init.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }
  const token = getSessionToken()
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return fetch(apiUrl(path), { ...init, headers })
}

export async function apiRegister(email: string, password: string) {
  const res = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  const data = (await res.json().catch(() => ({}))) as {
    token?: string
    user?: { id: number; email: string }
    error?: string
  }
  if (!res.ok) throw new Error(data.error || res.statusText)
  if (!data.token || !data.user) throw new Error('Invalid response')
  return data as { token: string; user: { id: number; email: string } }
}

export async function apiLogin(email: string, password: string) {
  const res = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  const data = (await res.json().catch(() => ({}))) as {
    token?: string
    user?: { id: number; email: string }
    error?: string
  }
  if (!res.ok) throw new Error(data.error || res.statusText)
  if (!data.token || !data.user) throw new Error('Invalid response')
  return data as { token: string; user: { id: number; email: string } }
}

export interface TrainingPayload {
  user: UserState
  sessions: WorkoutSession[]
  locale: AppLocale
}

export async function apiGetTraining(): Promise<TrainingPayload> {
  const res = await apiFetch('/api/me/training')
  if (!res.ok) throw new Error(await res.text())
  return res.json() as Promise<TrainingPayload>
}

export async function apiPutTraining(payload: TrainingPayload): Promise<void> {
  const res = await apiFetch('/api/me/training', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error(await res.text())
}
