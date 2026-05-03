import { verifyToken } from './auth.js'

export function requireAuth(req, res, next) {
  const h = req.headers.authorization
  const m = h && /^Bearer\s+(.+)$/i.exec(h)
  const token = m ? m[1].trim() : null
  if (!token) {
    res.status(401).json({ error: 'Missing token' })
    return
  }
  const session = verifyToken(token)
  if (!session) {
    res.status(401).json({ error: 'Invalid or expired token' })
    return
  }
  req.userId = session.userId
  req.userEmail = session.email
  next()
}
