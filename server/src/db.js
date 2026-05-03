import initSqlJs from 'sql.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataDir = path.join(__dirname, '..', 'data')
const dbPath = path.join(dataDir, 'sparta.db')

let db = null

function persist() {
  if (!db) return
  fs.mkdirSync(dataDir, { recursive: true })
  fs.writeFileSync(dbPath, Buffer.from(db.export()))
}

export function dbGet(sql, params = []) {
  const stmt = db.prepare(sql)
  stmt.bind(params)
  if (!stmt.step()) {
    stmt.free()
    return undefined
  }
  const row = stmt.getAsObject()
  stmt.free()
  return row
}

export function dbRun(sql, params = []) {
  db.run(sql, params)
}

/** Returns a function that runs `fn` inside BEGIN/COMMIT and persists the DB file. */
export function dbTransaction(fn) {
  return () => {
    dbRun('BEGIN')
    try {
      const out = fn()
      dbRun('COMMIT')
      persist()
      return out
    } catch (e) {
      dbRun('ROLLBACK')
      throw e
    }
  }
}

export async function openDb() {
  if (db) {
    return { dbGet, dbRun, dbTransaction, persist }
  }

  const wasmDir = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    'node_modules',
    'sql.js',
    'dist',
  )
  const SQL = await initSqlJs({
    locateFile: (file) => path.join(wasmDir, file),
  })

  fs.mkdirSync(dataDir, { recursive: true })
  if (fs.existsSync(dbPath)) {
    const buf = fs.readFileSync(dbPath)
    db = new SQL.Database(buf)
  } else {
    db = new SQL.Database()
  }

  db.exec('PRAGMA foreign_keys = ON;')

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_training_data (
      user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      payload_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)
  persist()

  return { dbGet, dbRun, dbTransaction, persist }
}
