const TOKEN_KEY = 'sparta_token'
const EMAIL_KEY = 'sparta_email'

export function getSessionToken(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function setSessionToken(token: string, email: string): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(EMAIL_KEY, email)
}

export function clearSessionToken(): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(EMAIL_KEY)
}

export function getSessionEmail(): string | null {
  if (typeof localStorage === 'undefined') return null
  return localStorage.getItem(EMAIL_KEY)
}
