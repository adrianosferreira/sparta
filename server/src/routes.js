import bcrypt from 'bcryptjs'
import { signToken } from './auth.js'
import { requireAuth } from './middleware.js'

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function defaultTrainingPayload() {
  return {
    user: {
      xp: 0,
      level: 1,
      streakDays: 0,
      unlockedBadges: [],
      currentWeek: 1,
      currentDayIndex: 0,
      bodyProfile: null,
    },
    sessions: [],
    locale: 'en',
  }
}

export function registerRoutes(app, { dbGet, dbRun, dbTransaction, persist }) {
  app.post('/api/auth/register', (req, res) => {
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase()
    const password = String(req.body?.password || '')
    if (!emailRe.test(email)) {
      res.status(400).json({ error: 'Invalid email' })
      return
    }
    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' })
      return
    }
    const hash = bcrypt.hashSync(password, 10)
    try {
      const userId = dbTransaction(() => {
        dbRun('INSERT INTO users (email, password_hash) VALUES (?, ?)', [
          email,
          hash,
        ])
        const row = dbGet('SELECT last_insert_rowid() AS id')
        const uid = Number(row?.id ?? 0)
        const payload = JSON.stringify(defaultTrainingPayload())
        dbRun(
          'INSERT INTO user_training_data (user_id, payload_json) VALUES (?, ?)',
          [uid, payload],
        )
        return uid
      })()
      const token = signToken(userId, email)
      res.status(201).json({ token, user: { id: userId, email } })
    } catch (e) {
      if (String(e.message || '').includes('UNIQUE')) {
        res.status(409).json({ error: 'Email already registered' })
        return
      }
      console.error(e)
      res.status(500).json({ error: 'Server error' })
    }
  })

  app.post('/api/auth/login', (req, res) => {
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase()
    const password = String(req.body?.password || '')
    const row = dbGet(
      'SELECT id, email, password_hash FROM users WHERE email = ?',
      [email],
    )
    if (!row || !bcrypt.compareSync(password, row.password_hash)) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }
    const token = signToken(row.id, row.email)
    res.json({ token, user: { id: row.id, email: row.email } })
  })

  app.get('/api/me/training', requireAuth, (req, res) => {
    const row = dbGet(
      'SELECT payload_json FROM user_training_data WHERE user_id = ?',
      [req.userId],
    )
    if (!row) {
      const payload = defaultTrainingPayload()
      dbRun(
        'INSERT INTO user_training_data (user_id, payload_json) VALUES (?, ?)',
        [req.userId, JSON.stringify(payload)],
      )
      persist()
      res.json(payload)
      return
    }
    try {
      res.json(JSON.parse(row.payload_json))
    } catch {
      res.json(defaultTrainingPayload())
    }
  })

  app.put('/api/me/training', requireAuth, (req, res) => {
    const { user, sessions, locale } = req.body || {}
    if (!user || !Array.isArray(sessions) || typeof locale !== 'string') {
      res.status(400).json({ error: 'Expected { user, sessions, locale }' })
      return
    }
    const payload = JSON.stringify({ user, sessions, locale })
    const existing = dbGet(
      'SELECT user_id FROM user_training_data WHERE user_id = ?',
      [req.userId],
    )
    if (existing) {
      dbRun(
        'UPDATE user_training_data SET payload_json = ?, updated_at = datetime(\'now\') WHERE user_id = ?',
        [payload, req.userId],
      )
    } else {
      dbRun(
        'INSERT INTO user_training_data (user_id, payload_json) VALUES (?, ?)',
        [req.userId, payload],
      )
    }
    persist()
    res.json({ ok: true })
  })

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })
}
