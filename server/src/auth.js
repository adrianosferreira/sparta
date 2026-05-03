import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-only-change-me'
const JWT_EXPIRES = '14d'

export function signToken(userId, email) {
  return jwt.sign({ sub: String(userId), email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  })
}

export function verifyToken(token) {
  try {
    const p = jwt.verify(token, JWT_SECRET)
    const id = Number(p.sub)
    if (!Number.isFinite(id) || id < 1) return null
    return { userId: id, email: String(p.email || '') }
  } catch {
    return null
  }
}
