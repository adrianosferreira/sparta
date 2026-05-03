import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { openDb } from './db.js'
import { registerRoutes } from './routes.js'

const PORT = Number(process.env.PORT) || 4000
const origins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean)
  : true

const app = express()
app.use(cors({ origin: origins, credentials: true }))
app.use(express.json({ limit: '2mb' }))

const dbApi = await openDb()
registerRoutes(app, dbApi)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Sparta API listening on http://0.0.0.0:${PORT}`)
})
